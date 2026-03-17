"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { transporter, generateMagicLink } from "@/lib/mail"
import { getBaseUrl } from "@/lib/utils"


interface PlayerInput {
    name: string
    email: string
}

export async function createGroupWithPlayers(prevState: any, formData: FormData) {
    const session = await auth()

    // Authorization Check
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        return { success: false, message: "Unauthorized" }
    }

    const groupName = formData.get("groupName") as string
    const tournamentId = formData.get("tournamentId") as string

    if (!groupName || !tournamentId) {
        return { success: false, message: "Group name and tournament selection are required" }
    }

    // Parse players from FormData
    const players: PlayerInput[] = []

    for (let i = 0; i < 8; i++) {
        const name = formData.get(`player_${i}_name`) as string
        const email = formData.get(`player_${i}_email`) as string

        if (name && email) {
            players.push({ name, email })
        }
    }

    if (players.length !== 8) {
        return {
            success: false,
            message: `Group must have exactly 8 players. Your configuration results in ${players.length} players.`
        }
    }

    try {
        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId },
        })

        if (!tournament) {
            return { success: false, message: "Selected tournament not found" }
        }

        // Verify the admin user exists in the DB (stale session check after reset)
        const adminUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!adminUser) {
            return { success: false, message: "Session expired or user record missing. Please sign out and sign back in." }
        }

        const txResult = await prisma.$transaction(async (tx) => {
            // 1. Create Group (Admin is owner)
            const group = await tx.group.create({
                data: {
                    name: groupName,
                    tournamentId: tournament.id,
                    adminId: session.user.id,
                }
            })

            const playersToEmail: Array<{ email: string, name: string, isExisting: boolean }> = []

            // 2. Process Players (All 8)
            for (let i = 0; i < players.length; i++) {
                const player = players[i]
                let user = await tx.user.findUnique({
                    where: { email: player.email }
                })

                let isExisting = true
                if (!user) {
                    isExisting = false
                    user = await tx.user.create({
                        data: {
                            name: player.name,
                            email: player.email,
                            role: "PLAYER",
                        }
                    })
                }

                // Determine Role: If this user is the Admin, give them ADMIN role in group
                const isGroupAdmin = user.email === session.user.email

                await tx.groupMembership.create({
                    data: {
                        userId: user.id,
                        groupId: group.id,
                        role: isGroupAdmin ? "ADMIN" : "MEMBER",
                        draftPosition: i + 1 // 1-based picking order
                    }
                })

                // Don't email the admin if they created the group
                if (user.email !== session.user.email) {
                    playersToEmail.push({
                        email: player.email,
                        name: player.name,
                        isExisting
                    })
                }
            }
            return { group, playersToEmail }
        }, {
            timeout: 15000, 
            maxWait: 15000
        })

        const group = txResult.group

        // 3. Generate Magic Links OUTSIDE the transaction to prevent database lock timeouts
        const emailTasks: Array<{ email: string, magicLink: string, name: string, isExisting: boolean }> = []
        for (const pt of txResult.playersToEmail) {
            const { magicLink } = await generateMagicLink(pt.email)
            emailTasks.push({ ...pt, magicLink })
        }

        // 4. Send Emails in PARALLEL to prevent serverless function timeout
        const displayTournamentName = tournament.name || "Madness 2026";
        await Promise.allSettled(emailTasks.map(async (task) => {
            const subject = task.isExisting
                ? `You've been added to a new ${displayTournamentName} Group!`
                : `You've been invited to ${displayTournamentName}!`

            const html = `
                <h1>Hello ${task.name},</h1>
                <p><strong>${session.user.name}</strong> has added you to the group <strong>"${groupName}"</strong> in <strong>${displayTournamentName}</strong>.</p>
                <p>${task.isExisting ? "Log in to view your new group." : "Click below to join setup your account."}</p>
                <a href="${task.magicLink}">Click here to access ${displayTournamentName}</a>
            `

            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM || "admin@madness2026.com",
                    to: task.email,
                    subject,
                    html,
                    text: `You have been added to group "${groupName}" in ${displayTournamentName}. Link: ${task.magicLink}`
                })
                console.log(`[EMAIL SENT] To: ${task.email} | Existing: ${task.isExisting} | Link: ${task.magicLink}`)
            } catch (emailError: any) {
                console.error(`[EMAIL FAILED] Failed to send to ${task.email}:`, emailError)
            }
        }))

        revalidatePath("/admin/groups")
        return { success: true, message: `Group "${groupName}" created successfully with 8 players.`, groupId: group.id }

    } catch (error: any) {
        console.error("Create group error:", error)
        return { success: false, message: `Failed to create group: ${error.message || "Unknown error"}` }
    }
}

export async function updateGroup(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        return { success: false, message: "Unauthorized" }
    }

    const groupId = formData.get("groupId") as string
    const groupName = formData.get("groupName") as string

    if (!groupId || !groupName) {
        return { success: false, message: "Missing required fields" }
    }

    try {
        // Update Name
        await prisma.group.update({
            where: { id: groupId },
            data: { name: groupName }
        })

        // Handle New Invites
        const newPlayers: PlayerInput[] = []
        // We allow up to 8 potential invites now (if group was empty), though UI limits it.
        // Let's check up to 8 inputs to be safe and flexible.
        for (let i = 0; i < 8; i++) {
            const name = formData.get(`new_player_${i}_name`) as string
            const email = formData.get(`new_player_${i}_email`) as string
            if (name && email) {
                newPlayers.push({ name, email })
            }
        }

        if (newPlayers.length > 0) {
            // Re-use logic or extract helper? 
            // For speed, let's inline a simplified version or extract the invite logic if I can.
            // Extracting logic is safer.
            const tournament = await prisma.tournament.findUnique({
                where: { id: (await prisma.group.findUnique({ where: { id: groupId }, select: { tournamentId: true } }))?.tournamentId }
            })
            await invitePlayersToGroup(groupId, newPlayers, session.user.name || "Admin", tournament?.name)
        }

        revalidatePath(`/admin/groups/${groupId}/edit`)
        revalidatePath("/admin/groups")
        return { success: true, message: `Group updated.` + (newPlayers.length ? ` Sent ${newPlayers.length} invites.` : "") }
    } catch (error) {
        console.error("Update group error:", error)
        return { success: false, message: "Failed to update group" }
    }
}

export async function removeMember(groupId: string, userId: string) {
    const session = await auth()
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        return { success: false, message: "Unauthorized" }
    }

    // Safeguard: Check if draft is complete
    const pickCount = await prisma.draftPick.count({
        where: { groupId }
    })
    if (pickCount >= 64) {
        return { success: false, message: "Draft is complete. Members cannot be removed." }
    }

    try {
        await prisma.groupMembership.delete({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: groupId
                }
            }
        })

        // Also remove their picks?
        // Logic: If we remove a user, their picks become orphaned or should be deleted.
        // For now, let's delete them to clean up state.
        await prisma.draftPick.deleteMany({
            where: {
                groupId: groupId,
                userId: userId
            }
        })

        revalidatePath(`/admin/groups/${groupId}/edit`)
        return { success: true, message: "Member removed" }
    } catch (e) {
        console.error("Remove member error:", e)
        return { success: false, message: "Failed to remove member" }
    }
}

async function invitePlayersToGroup(groupId: string, players: PlayerInput[], inviterName: string, tournamentName?: string) {
    const emailTasks: Array<{ email: string, magicLink: string, name: string }> = []
    const displayTournamentName = tournamentName || "Madness 2026"

    await prisma.$transaction(async (tx) => {
        for (const player of players) {
            let user = await tx.user.findUnique({ where: { email: player.email } })
            if (!user) {
                user = await tx.user.create({
                    data: { name: player.name, email: player.email, role: "PLAYER" }
                })
            }

            // Get current positions to find the next available ones
            const currentMemberships = await tx.groupMembership.findMany({
                where: { groupId: groupId },
                select: { draftPosition: true }
            })
            const takenPositions = currentMemberships.map(m => m.draftPosition)

            // Find first available position 1-8
            let availablePos = 1
            for (let p = 1; p <= 8; p++) {
                if (!takenPositions.includes(p)) {
                    availablePos = p
                    break
                }
            }

            // Check membership
            const existing = await tx.groupMembership.findUnique({
                where: { userId_groupId: { userId: user.id, groupId: groupId } }
            })

            if (!existing) {
                await tx.groupMembership.create({
                    data: {
                        userId: user.id,
                        groupId: groupId,
                        role: "MEMBER",
                        draftPosition: availablePos
                    }
                })
            }

            // 3. Magic Link using standardized helper
            const { magicLink } = await generateMagicLink(player.email)

            emailTasks.push({ email: player.email, magicLink, name: player.name })
        }
    })

    // 4. Send Emails in PARALLEL
    await Promise.allSettled(emailTasks.map(async (task) => {
        const emailContent = {
            from: process.env.EMAIL_FROM || "admin@madness2026.com",
            to: task.email,
            subject: `You've been added to ${displayTournamentName} Draft Pool!`,
            html: `
                <h1>Welcome, ${task.name}!</h1>
                <p>${inviterName} has added you to a group in <strong>${displayTournamentName}</strong>.</p>
                <a href="${task.magicLink}">Click here to access ${displayTournamentName}</a>
            `,
            text: `Welcome! Join ${displayTournamentName} here: ${task.magicLink}`
        }
        try {
            await transporter.sendMail(emailContent)
            console.log(`[EMAIL SENT] To: ${task.email} | Link: ${task.magicLink}`)
        } catch (emailError: any) {
            console.error(`[EMAIL FAILED] Failed to send to ${task.email}:`, emailError)
        }
    }))
}

export async function deleteGroup(groupId: string) {
    const session = await auth()
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.group.delete({
            where: { id: groupId }
        })

        revalidatePath("/admin/groups")
        return { success: true, message: "Group deleted" }
    } catch (e) {
        console.error("Delete group error:", e)
        return { success: false, message: "Failed to delete group" }
    }
}

export async function saveTieBreaker(groupId: string, finalScoreGuess: number, nitWinnerGuess: string, targetUserId?: string) {
    const session = await auth()
    if (!session?.user) {
        return { success: false, message: "Unauthorized" }
    }

    // Determine whose membership we are updating
    // If targetUserId is provided, check if the session user is an admin
    let userIdToUpdate = session.user.id
    if (targetUserId && targetUserId !== session.user.id) {
        const targetGroup = await prisma.group.findUnique({
            where: { id: groupId },
            select: { adminId: true }
        })
        const isSuperAdmin = session.user.role === "SUPER_ADMIN"
        const isGroupAdmin = targetGroup?.adminId === session.user.id

        if (!isSuperAdmin && !isGroupAdmin) {
            return { success: false, message: "Unauthorized: Only admins can save tie-breakers for others." }
        }
        userIdToUpdate = targetUserId
    }

    try {
        await prisma.groupMembership.update({
            where: {
                userId_groupId: {
                    userId: userIdToUpdate,
                    groupId: groupId
                }
            },
            data: {
                finalScoreGuess,
                nitWinnerGuess
            }
        })

        revalidatePath(`/groups/${groupId}/dashboard`)
        revalidatePath(`/groups/${groupId}/draft`)
        revalidatePath("/leaderboard")

        return { success: true, message: "Predictions saved successfully!" }
    } catch (error) {
        console.error("Save tie-breaker error:", error)
        return { success: false, message: "Failed to save predictions." }
    }
}
