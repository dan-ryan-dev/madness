"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Fetch all Hall of Fame entries, ordered by year descending.
 */
export async function getHallOfFameEntries() {
    try {
        const entries = await prisma.hallOfFame.findMany({
            orderBy: { year: "desc" },
        })
        return entries
    } catch (error) {
        console.error("Failed to fetch Hall of Fame entries:", error)
        return []
    }
}

/**
 * Create a new Hall of Fame entry.
 * Restricted to SUPER_ADMIN.
 */
export async function createHallOfFameEntry(prevState: any, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    const year = parseInt(formData.get("year") as string)
    const winnerName = formData.get("winnerName") as string
    const winningTeam = formData.get("winningTeam") as string
    const totalPoints = parseInt(formData.get("totalPoints") as string)
    const groupName = formData.get("groupName") as string || null

    if (isNaN(year) || !winnerName || !winningTeam || isNaN(totalPoints)) {
        return { success: false, message: "Missing required fields or invalid numbers." }
    }

    try {
        await prisma.hallOfFame.create({
            data: {
                year,
                winnerName,
                winningTeam,
                totalPoints,
                groupName,
            },
        })

        revalidatePath("/admin/hall-of-fame")
        revalidatePath("/hall-of-fame")
        return { success: true, message: "Hall of Fame entry added successfully." }
    } catch (error: any) {
        if (error.code === "P2002") {
            return { success: false, message: "An entry for this year already exists." }
        }
        console.error("Failed to create Hall of Fame entry:", error)
        return { success: false, message: "Something went wrong." }
    }
}

/**
 * Update an existing Hall of Fame entry.
 * Restricted to SUPER_ADMIN.
 */
export async function updateHallOfFameEntry(prevState: any, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    const id = formData.get("id") as string
    const year = parseInt(formData.get("year") as string)
    const winnerName = formData.get("winnerName") as string
    const winningTeam = formData.get("winningTeam") as string
    const totalPoints = parseInt(formData.get("totalPoints") as string)
    const groupName = formData.get("groupName") as string || null

    if (!id || isNaN(year) || !winnerName || !winningTeam || isNaN(totalPoints)) {
        return { success: false, message: "Missing required fields or invalid numbers." }
    }

    try {
        await prisma.hallOfFame.update({
            where: { id },
            data: {
                year,
                winnerName,
                winningTeam,
                totalPoints,
                groupName,
            },
        })

        revalidatePath("/admin/hall-of-fame")
        revalidatePath("/hall-of-fame")
        return { success: true, message: "Hall of Fame entry updated successfully." }
    } catch (error: any) {
        if (error.code === "P2002") {
            return { success: false, message: "An entry for this year already exists." }
        }
        console.error("Failed to update Hall of Fame entry:", error)
        return { success: false, message: "Something went wrong." }
    }
}

/**
 * Delete a Hall of Fame entry.
 * Restricted to SUPER_ADMIN.
 */
export async function deleteHallOfFameEntry(id: string) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.hallOfFame.delete({
            where: { id },
        })

        revalidatePath("/admin/hall-of-fame")
        revalidatePath("/hall-of-fame")
        return { success: true, message: "Hall of Fame entry deleted successfully." }
    } catch (error) {
        console.error("Failed to delete Hall of Fame entry:", error)
        return { success: false, message: "Something went wrong." }
    }
}
