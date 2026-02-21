"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import nodemailer from "nodemailer"
import { randomUUID } from "crypto"

// Configure Nodemailer for development (logs to console if no real transport)
// For a real app, use SendGrid/Resend/AWS SES
const transporter = nodemailer.createTransport({
    jsonTransport: true,
})

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

        const emailTasks: Array<{ email: string, magicLink: string, name: string, isExisting: boolean }> = []

        const group = await prisma.$transaction(async (tx) => {
            // 1. Create Group (Admin is owner)
            const group = await tx.group.create({
                data: {
                    name: groupName,
                    tournamentId: tournament.id,
                    adminId: session.user.id,
                }
            })

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

                // 3. Generate Magic Link
                const token = randomUUID()
                const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

                await tx.verificationToken.create({
                    data: {
                        identifier: player.email,
                        token: token,
                        expires: expires
                    }
                })

                const host = process.env.NEXTAUTH_URL || "http://localhost:3000"
                const magicLink = `${host}/api/auth/callback/email?token=${token}&email=${encodeURIComponent(player.email)}&callbackUrl=${encodeURIComponent("/onboarding")}`

                // Don't email the admin if they created the group
                if (user.email !== session.user.email) {
                    emailTasks.push({
                        email: player.email,
                        magicLink,
                        name: player.name,
                        isExisting
                    })
                }
            }
            return group
        })

        // 4. Send Emails
        for (const task of emailTasks) {
            const subject = task.isExisting
                ? "You've been added to a new Madness 2026 Group!"
                : "You've been invited to Madness 2026!"

            const html = `
                <h1>Hello ${task.name},</h1>
                <p><strong>${session.user.name}</strong> has added you to the group <strong>"${groupName}"</strong>.</p>
                <p>${task.isExisting ? "Log in to view your new group." : "Click below to join setup your account."}</p>
                <a href="${task.magicLink}">Click here to access Madness 2026</a>
            `

            await transporter.sendMail({
                from: process.env.EMAIL_FROM || "admin@madness2026.com",
                to: task.email,
                subject,
                html,
                text: `You have been added to group "${groupName}". Link: ${task.magicLink}`
            })

            console.log(`[EMAIL MOCK] To: ${task.email} | Existing: ${task.isExisting} | Link: ${task.magicLink}`)
        }

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
            await invitePlayersToGroup(groupId, newPlayers, session.user.name || "Admin")
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

async function invitePlayersToGroup(groupId: string, players: PlayerInput[], inviterName: string) {
    const emailTasks: Array<{ email: string, magicLink: string, name: string }> = []

    await prisma.$transaction(async (tx) => {
        for (const player of players) {
            let user = await tx.user.findUnique({ where: { email: player.email } })
            if (!user) {
                user = await tx.user.create({
                    data: { name: player.name, email: player.email, role: "PLAYER" }
                })
            }

            // Check membership
            const existing = await tx.groupMembership.findUnique({
                where: { userId_groupId: { userId: user.id, groupId: groupId } }
            })

            if (!existing) {
                await tx.groupMembership.create({
                    data: { userId: user.id, groupId: groupId, role: "MEMBER" }
                })
            }

            // Magic Link
            const token = randomUUID()
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
            await tx.verificationToken.create({
                data: { identifier: player.email, token, expires }
            })

            const host = process.env.NEXTAUTH_URL || "http://localhost:3000"
            const magicLink = `${host}/api/auth/callback/email?token=${token}&email=${encodeURIComponent(player.email)}&callbackUrl=${encodeURIComponent("/onboarding")}`

            emailTasks.push({ email: player.email, magicLink, name: player.name })
        }
    })

    // Send Emails
    for (const task of emailTasks) {
        const emailContent = {
            from: "admin@madness2026.com",
            to: task.email,
            subject: "You've been added to Madness 2026 Draft Pool!",
            html: `<h1>Welcome, ${task.name}!</h1><p>${inviterName} invited you.</p><a href="${task.magicLink}">${task.magicLink}</a>`,
            text: `Welcome! Join here: ${task.magicLink}`
        }
        await transporter.sendMail(emailContent)
        console.log(`[EMAIL MOCK] To: ${task.email} | Link: ${task.magicLink}`)
    }
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
        const adminMembership = await prisma.groupMembership.findUnique({
            where: { userId_groupId: { userId: session.user.id as string, groupId: groupId } }
        })
        const isSuperAdmin = session.user.role === "SUPER_ADMIN"
        const isGroupAdmin = adminMembership?.role === "ADMIN"

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
