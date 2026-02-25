"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function resetDraft(prevState: any, formData: FormData) {
    const session = await auth()

    // Strict RBAC check
    if (session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        // Delete all draft picks
        await prisma.draftPick.deleteMany({})

        // Optionally reset tournament status to SETUP or DRAFTING
        // await prisma.tournament.update(...)

        revalidatePath("/admin/setup")
        return { success: true, message: "Draft has been reset." }
    } catch (error) {
        console.error("Failed to reset draft:", error)
        return { success: false, message: "Failed to reset draft." }
    }
}

export async function updateUserRole(userId: string, newRole: string) {
    const session = await auth()

    // Strict RBAC check: Only Super Admins can manage roles
    if (session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        })

        revalidatePath("/admin/users")
        return { success: true, message: `User role updated to ${newRole}` }
    } catch (error) {
        console.error("Update user role error:", error)
        return { success: false, message: "Failed to update user role" }
    }
}
export async function updateMemberOrder(groupId: string, userId: string, position: number) {
    const session = await auth()

    // Authorization: Only Super Admins or Group Admins can change order
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        return { success: false, message: "Unauthorized" }
    }

    // Validation: Ensure position is a valid positive number
    const posInt = parseInt(position.toString())
    if (isNaN(posInt) || posInt < 1 || posInt > 64) {
        return { success: false, message: "Invalid position number (1-64)" }
    }

    try {
        await prisma.groupMembership.update({
            where: {
                userId_groupId: {
                    userId,
                    groupId
                }
            },
            data: {
                draftPosition: posInt
            }
        })

        revalidatePath(`/admin/groups/${groupId}/edit`)
        return { success: true, message: "Position updated" }
    } catch (e) {
        console.error("Update member order error:", e)
        return { success: false, message: "Failed to update position" }
    }
}

export async function searchUsers(query: string) {
    const session = await auth()
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        return []
    }

    if (!query || query.length < 2) return []

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true
            },
            take: 10
        })
        return users
    } catch (error) {
        console.error("Search users error:", error)
        return []
    }
}
import { createTransport } from "nodemailer"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

// Transport setup for Nodemailer
const transporter = createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
})

export async function inviteManagers(tournamentId: string, managers: { name: string, email: string }[]) {
    const session = await auth()

    // Strict RBAC check: Only Super Admins can bulk invite managers
    if (session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId }
    })

    if (!tournament) {
        return { success: false, message: "Tournament not found" }
    }

    const results = {
        invited: 0,
        skipped: 0,
        failed: 0,
        errors: [] as string[]
    }

    for (const manager of managers) {
        try {
            const email = manager.email.toLowerCase().trim()
            const name = manager.name.trim()

            if (!email || !name) continue

            // 1. Create or Update User
            const tempPassword = Math.random().toString(36).slice(-8).toUpperCase()
            const hashedPassword = await bcrypt.hash(tempPassword, 10)

            const user = await prisma.user.upsert({
                where: { email },
                update: {
                    role: "GROUP_ADMIN",
                    // We only update the password if they don't have one or if we are resetting them
                    // For now, let's assume we are giving them a fresh one for the new tournament
                    password: hashedPassword,
                    name: name
                },
                create: {
                    email,
                    name,
                    password: hashedPassword,
                    role: "GROUP_ADMIN"
                }
            })

            // 2. Send Invitation Email
            const loginUrl = `${process.env.NEXTAUTH_URL}/auth/login`

            await transporter.sendMail({
                to: email,
                from: process.env.EMAIL_FROM,
                subject: `Invitation: Manage a Group for ${tournament.name}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                        <h2 style="color: #143278; text-align: center;">${tournament.name}</h2>
                        <p>Hello ${name},</p>
                        <p>You have been selected to manage a group for <strong>Krazy Kevy's Madness 2026</strong>!</p>
                        
                        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #374151;"><strong>Your Sign-In Credentials:</strong></p>
                            <p style="margin: 10px 0 5px 0;">Email: <code>${email}</code></p>
                            <p style="margin: 0;">Temporary Password: <code>${tempPassword}</code></p>
                        </div>

                        <h3 style="color: #143278;">What's Next?</h3>
                        <ol>
                            <li>Click the button below to sign in (Select <strong>"Sign in with password"</strong>).</li>
                            <li>Once logged in, click the <strong>"Admin Console"</strong> link in the top navigation bar.</li>
                            <li>From your dashboard, you can manage your group and add your 8 players before draft day.</li>
                        </ol>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${loginUrl}" style="background-color: #F58220; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Sign In to Madness 2026</a>
                        </div>

                        <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; pt: 20px; margin-top: 30px;">
                            <strong>Security Note:</strong> Please change your password after your first login via Account Settings.
                        </p>
                    </div>
                `,
            })

            results.invited++
        } catch (error: any) {
            console.error(`Failed to invite ${manager.email}:`, error)
            results.failed++
            results.errors.push(`${manager.email}: ${error.message}`)
        }
    }

    revalidatePath("/admin/users")
    revalidatePath(`/admin/tournaments/${tournamentId}/managers`)

    return {
        success: results.failed === 0,
        message: `Successfully invited ${results.invited} managers. ${results.failed} failed.`,
        data: results
    }
}
