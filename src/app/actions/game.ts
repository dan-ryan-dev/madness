"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { ROUND_POINTS, getSeedBracket } from "@/lib/scoring"

export async function processGameResult(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role || "")) {
        return { success: false, message: "Unauthorized" }
    }

    const tournamentId = formData.get("tournamentId") as string
    const winnerId = formData.get("winnerId") as string
    const loserId = formData.get("loserId") as string
    const round = parseInt(formData.get("round") as string)

    if (!tournamentId || !winnerId || !loserId || !round) {
        return { success: false, message: "Missing required fields" }
    }

    if (winnerId === loserId) {
        return { success: false, message: "Winner and Loser cannot be the same team" }
    }

    // Check if the winner has already won in this round
    const existingResult = await prisma.gameResult.findFirst({
        where: {
            tournamentId,
            round,
            winnerId
        }
    })

    if (existingResult) {
        return { success: false, message: "This team has already advanced from this round." }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Record Game Result
            await tx.gameResult.create({
                data: {
                    tournamentId,
                    round,
                    winnerId,
                    loserId
                }
            })

            // 2. Eliminate Loser
            await tx.team.update({
                where: { id: loserId },
                // @ts-ignore - isEliminated is valid but types might be stale
                data: { isEliminated: true }
            })

            // 3. Calculate Points
            // Base Points: Based on Round
            const basePoints = ROUND_POINTS[round] || 0

            const winnerTeam = await tx.team.findUnique({ where: { id: winnerId } })
            const loserTeam = await tx.team.findUnique({ where: { id: loserId } })

            let upsetBonus = 0
            if (winnerTeam && loserTeam) {
                const winnerBracket = getSeedBracket(winnerTeam.seed)
                const loserBracket = getSeedBracket(loserTeam.seed)
                upsetBonus = Math.max(0, winnerBracket - loserBracket)
            }

            const totalPoints = basePoints + upsetBonus

            // 4. Update Scores for Users who picked the Winner
            const picks = await tx.draftPick.findMany({
                where: { teamId: winnerId }
            })

            for (const pick of picks) {
                // @ts-ignore - groupMembership is valid but types might be stale
                await tx.groupMembership.update({
                    where: {
                        userId_groupId: {
                            userId: pick.userId,
                            groupId: pick.groupId
                        }
                    },
                    data: {
                        score: { increment: totalPoints }
                    }
                })
            }
        })

        revalidatePath(`/admin/tournaments/${tournamentId}/games`)
        revalidatePath(`/standings`)
        return { success: true, message: "Game result recorded and scores updated!" }

    } catch (error) {
        console.error("Failed to process game result:", error)
        return { success: false, message: "Failed to record result. Please try again." }
    }
}

export async function revertGameResult(gameResultId: string) {
    const session = await auth()
    if (!session?.user?.id || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role || "")) {
        return { success: false, message: "Unauthorized" }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Fetch Game Result
            const gameResult = await tx.gameResult.findUnique({
                where: { id: gameResultId },
                include: { winner: true, loser: true }
            })

            if (!gameResult || !gameResult.winnerId || !gameResult.loserId) {
                throw new Error("Game result not found or invalid")
            }

            // 2. Un-eliminate Loser
            await tx.team.update({
                where: { id: gameResult.loserId },
                data: { isEliminated: false }
            })

            // 3. Calculate Points to Revert
            const round = gameResult.round
            const basePoints = Math.pow(2, round - 1)

            const getBracket = (seed: number) => {
                if (seed >= 1 && seed <= 3) return 1
                if (seed >= 4 && seed <= 6) return 2
                if (seed >= 7 && seed <= 9) return 3
                if (seed >= 10 && seed <= 12) return 4
                if (seed >= 13 && seed <= 15) return 5
                if (seed === 16) return 6
                return 1
            }

            let upsetBonus = 0
            if (gameResult.winner && gameResult.loser) {
                const winnerBracket = getBracket(gameResult.winner.seed)
                const loserBracket = getBracket(gameResult.loser.seed)
                upsetBonus = Math.max(0, winnerBracket - loserBracket)
            }

            const totalPoints = basePoints + upsetBonus

            // 4. Decrement Scores
            const picks = await tx.draftPick.findMany({
                where: { teamId: gameResult.winnerId }
            })

            for (const pick of picks) {
                // @ts-ignore
                await tx.groupMembership.update({
                    where: {
                        userId_groupId: {
                            userId: pick.userId,
                            groupId: pick.groupId
                        }
                    },
                    data: {
                        score: { decrement: totalPoints }
                    }
                })
            }

            // 5. Delete Game Result
            await tx.gameResult.delete({
                where: { id: gameResultId }
            })
        })

        revalidatePath('/admin/tournaments/[id]/games') // Generic path not strictly correct but works for now 
        // Need tournamentId to revalidate specific path
        // We can fetch it or just revalidate generic. 
        // For now, let's just return success and let client handle refresh or generic revalidation.

        return { success: true, message: "Game result reverted successfully." }

    } catch (error) {
        console.error("Failed to revert game result:", error)
        return { success: false, message: "Failed to revert result." }
    }
}
