"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Valid Regions
const VALID_REGIONS = ["East", "West", "South", "Midwest"]

export async function createTournament(prevState: any, formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    const name = formData.get("name") as string
    const year = parseInt(formData.get("year") as string || "2026")

    if (!name) {
        return { success: false, message: "Tournament name is required" }
    }

    try {
        const tournament = await prisma.tournament.create({
            data: {
                name,
                year,
                status: "SETUP"
            }
        })

        // Redirect to import page
        // We can't return the redirect, we have to throw it (Next.js way) 
        // OR return success and let client redirect. 
        // Since this is a server action called from a form, redirect() works if not in try/catch? 
        // No, redirect() throws an error, so we need to validly let it throw or handle it.
    } catch (error) {
        // If it's a redirect error, rethrow it
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("Create Tournament Error:", error)
        return { success: false, message: "Failed to create tournament. Name might be taken." }
    }

    // Attempt to find the created tournament to get ID for redirect?
    // Actually, create returns the object.
    const created = await prisma.tournament.findUnique({ where: { name } })
    if (created) {
        redirect(`/admin/tournaments/${created.id}/import`)
    }
    return { success: false, message: "Something went wrong." }
}

export async function importTeams(tournamentId: string, csvData: string) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    if (!csvData || !tournamentId) {
        return { success: false, message: "Missing data" }
    }

    const lines = csvData.trim().split("\n")
    const teamsToCreate: { name: string, seed: number, region: string, tournamentId: string }[] = []

    // Parse CSV
    // Expected: Name, Seed, Region
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const parts = line.split(",").map(p => p.trim())
        if (parts.length < 3) {
            return { success: false, message: `Line ${i + 1} is malformed: "${line}". Expected: Name, Seed, Region` }
        }

        const [name, seedStr, region] = parts
        const seed = parseInt(seedStr)

        // Validation
        if (isNaN(seed) || seed < 1 || seed > 16) {
            return { success: false, message: `Line ${i + 1}: Invalid seed "${seedStr}". Must be 1-16.` }
        }

        if (!VALID_REGIONS.includes(region)) {
            return { success: false, message: `Line ${i + 1}: Invalid region "${region}". Must be one of: ${VALID_REGIONS.join(", ")}` }
        }

        teamsToCreate.push({
            name,
            seed,
            region,
            tournamentId
        })
    }

    if (teamsToCreate.length === 0) {
        return { success: false, message: "No teams found in CSV." }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Sequential creates are much more stable for Transaction Poolers (PGBouncer)
            // than Promise.all which can overwhelm the pinned connection.
            for (const team of teamsToCreate) {
                await tx.team.create({
                    data: team
                });
            }
        });

        revalidatePath(`/admin/tournaments/${tournamentId}`)
        return { success: true, message: `Successfully imported ${teamsToCreate.length} teams.` }

    } catch (error: any) {
        console.error("Import Error Details:", JSON.stringify(error, null, 2))
        return { success: false, message: `Database error: ${error.message || "Unknown error"}` }
    }
}

export async function updateTournament(formData: FormData) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
        throw new Error("Unauthorized")
    }

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const year = parseInt(formData.get("year") as string)
    const status = formData.get("status") as string

    await prisma.tournament.update({
        where: { id },
        data: { name, year, status }
    })

    revalidatePath("/admin")
    revalidatePath(`/admin/tournaments/${id}`)
    redirect("/admin")
}

export async function deleteTournament(tournamentId: string) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.tournament.delete({
            where: { id: tournamentId }
        })

        revalidatePath("/admin")
        revalidatePath("/admin/tournaments")
        return { success: true, message: "Tournament deleted" }
    } catch (e: any) {
        console.error("Delete tournament error:", e)
        return { success: false, message: `Failed to delete tournament: ${e.message || "It might have active groups or picks."}` }
    }
}

export async function updateTeamName(teamId: string, newName: string) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "GROUP_ADMIN") {
        return { success: false, message: "Unauthorized" }
    }

    if (!newName || !teamId) {
        return { success: false, message: "Missing team name or ID" }
    }

    try {
        const team = await prisma.team.update({
            where: { id: teamId },
            data: { name: newName }
        })

        revalidatePath(`/admin/tournaments/${team.tournamentId}/teams`)
        return { success: true, message: "Team name updated" }
    } catch (error: any) {
        console.error("Update Team Name Error:", error)
        return { success: false, message: `Failed to update team: ${error.message || "Unknown error"}` }
    }
}
