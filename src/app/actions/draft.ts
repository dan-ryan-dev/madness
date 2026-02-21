"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { getCurrentPicker } from "@/lib/draft-logic"

// Helper to get or create a demo group for the user
// In a real app, users would create/join groups explicitly.
// For this MVP, we auto-assign them to a "Demo Group".
export async function ensureDemoGroup() {
    const session = await auth()
    if (!session?.user?.id) return null

    const DEMO_GROUP_NAME = "Madness 2026 Demo"
    const TOURNAMENT_NAME = "Madness 2026"

    // 1. Get Tournament
    const tournament = await prisma.tournament.findUnique({
        where: { name: TOURNAMENT_NAME },
    })

    if (!tournament) {
        throw new Error("Tournament not found. Did you run seed?")
    }

    // 2. Find existing group
    let group = await prisma.group.findFirst({
        where: { name: DEMO_GROUP_NAME },
        include: { memberships: { include: { user: true } } },
    })

    // 3. Create if missing
    if (!group) {
        group = await prisma.group.create({
            data: {
                name: DEMO_GROUP_NAME,
                tournamentId: tournament.id,
                adminId: session.user.id, // First user is admin
                memberships: {
                    create: {
                        userId: session.user.id,
                        role: "ADMIN",
                    }
                },
            },
            include: { memberships: { include: { user: true } } },
        })
    }

    // 4. Ensure current user is in the group
    const isMember = group.memberships.some((m: any) => m.userId === session.user.id)
    if (!isMember) {
        await prisma.groupMembership.create({
            data: {
                groupId: group.id,
                userId: session.user.id,
                role: "MEMBER",
            }
        })
        // Re-fetch group with new member
        group = (await prisma.group.findUnique({
            where: { id: group.id },
            include: { memberships: { include: { user: true } } },
        }))!
    }

    return group
}

export async function pickTeam(groupId: string, teamId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Not authenticated" }
    }

    try {
        // Find group by ID now, not demo
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { memberships: { include: { user: true } } }
        })

        if (!group) return { success: false, message: "Group not found" }

        const totalPlayers = group.memberships.length
        // Standardized Sort: Use draftPosition (1-based), default to 999 if null/0, fallback to joinedAt
        const sortedMembers = group.memberships.sort((a: any, b: any) => {
            const posA = a.draftPosition || 999
            const posB = b.draftPosition || 999
            if (posA !== posB) return posA - posB
            // Safe date comparison: handles both Date objects and numeric timestamps
            const timeA = a.joinedAt instanceof Date ? a.joinedAt.getTime() : Number(a.joinedAt)
            const timeB = b.joinedAt instanceof Date ? b.joinedAt.getTime() : Number(b.joinedAt)
            return timeA - timeB
        })
        const isGroupAdmin = group.adminId === session.user.id

        // Wrap in transaction for safety
        await prisma.$transaction(async (tx) => {
            // Re-fetch picks inside transaction to ensure atomicity
            const currentPicks = await tx.draftPick.findMany({
                where: { groupId: group.id },
                orderBy: [{ round: 'asc' }, { pickNumber: 'asc' }],
            })

            const totalPicksMade = currentPicks.length
            const currentPickNumberGlobal = totalPicksMade + 1

            // Recalculate picker inside transaction
            const pickerIndex = getCurrentPicker(currentPickNumberGlobal, totalPlayers)
            const expectedMember = sortedMembers[pickerIndex]

            if (!expectedMember) {
                throw new Error("Could not determine current picker")
            }

            // Verify turn (again, inside transaction)
            if (expectedMember.userId !== session.user.id && !isGroupAdmin) {
                const expectedUser = expectedMember.user
                throw new Error(`Not your turn! Waiting for ${expectedUser?.name || expectedUser?.email}`)
            }

            const userIdToRecord = expectedMember.userId

            // Validate Team Availability (inside transaction)
            const isTaken = await tx.draftPick.findFirst({
                where: {
                    groupId: group.id,
                    teamId: teamId,
                }
            })

            if (isTaken) {
                throw new Error("Team already taken")
            }

            // Validate Max Teams (8 per user) - CHECK TARGET USER, NOT ADMIN
            const userPickCount = currentPicks.filter(p => p.userId === userIdToRecord).length
            if (userPickCount >= 8) {
                throw new Error("This user has already picked 8 teams.")
            }

            // Calculate Round and PickInRound
            const round = Math.floor((currentPickNumberGlobal - 1) / totalPlayers) + 1
            const pickNumberInRound = ((currentPickNumberGlobal - 1) % totalPlayers) + 1

            // Execute Pick
            await tx.draftPick.create({
                data: {
                    groupId: group.id,
                    userId: userIdToRecord, // CORRECTED: Use calculated ID
                    teamId: teamId,
                    round: round,
                    pickNumber: pickNumberInRound,
                }
            })
        })

        revalidatePath(`/groups/${groupId}/draft`)
        return { success: true, message: "Pick successful!" }

    } catch (error: any) {
        console.error("Pick error:", error)
        return { success: false, message: error.message || "Failed to pick team" }
    }
}
export async function undoLastPick(groupId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: "Not authenticated" }

    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId }
        })

        if (!group) return { success: false, message: "Group not found" }

        // Authorization: Only Admin or Super Admin can undo
        const isGroupAdmin = group.adminId === session.user.id
        const isSuperAdmin = session.user.role === "SUPER_ADMIN"

        if (!isGroupAdmin && !isSuperAdmin) {
            return { success: false, message: "Unauthorized: Only admins can undo picks" }
        }

        // Find the latest pick based on sequence and time
        const lastPick = await prisma.draftPick.findFirst({
            where: { groupId },
            orderBy: [
                { round: 'desc' },
                { pickNumber: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        if (!lastPick) {
            return { success: false, message: "No picks found to undo" }
        }

        // Delete it
        await prisma.draftPick.delete({
            where: { id: lastPick.id }
        })

        revalidatePath(`/groups/${groupId}/draft`)
        revalidatePath(`/groups/${groupId}/dashboard`)
        return { success: true, message: "Last pick undone!" }
    } catch (error: any) {
        console.error("Undo pick error:", error)
        return { success: false, message: error.message || "Failed to undo last pick" }
    }
}
