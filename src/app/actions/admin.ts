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
