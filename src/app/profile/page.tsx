import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ProfileHero } from "@/components/profile/ProfileHero"
import { TeamSportsCard } from "@/components/profile/TeamSportsCard"
import { getSeedBracket, ROUND_POINTS } from "@/lib/scoring"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    const userId = session.user.id

    // 1. Fetch User Data with current picks and game results
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            draftPicks: {
                include: { team: true }
            }
        }
    })

    if (!user) redirect("/")

    // 2. Fetch all game results for the user's teams in active tournament
    // For simplicity, we fetch all results to use in our math
    const gameResults = await prisma.gameResult.findMany({
        include: { winner: true, loser: true }
    })

    // 3. Calculate points per team for the user
    const teamPointsMap = new Map<string, number>()
    user.draftPicks.forEach(pick => {
        let teamScore = 0
        gameResults.forEach(game => {
            if (game.winnerId === pick.teamId) {
                // Base points
                teamScore += ROUND_POINTS[game.round] || 0

                // Upset bonus
                const winnerBracket = getSeedBracket(game.winner!.seed)
                const loserBracket = getSeedBracket(game.loser!.seed)
                if (winnerBracket > loserBracket) {
                    teamScore += (winnerBracket - loserBracket)
                }
            }
        })
        teamPointsMap.set(pick.teamId, teamScore)
    })

    const totalPoints = Array.from(teamPointsMap.values()).reduce((a, b) => a + b, 0)
    const teamsAlive = user.draftPicks.filter(p => !p.team.isEliminated).length

    // 4. Calculate Global Rank
    // Fetch all user scores (this could be optimized later with a dedicated leaderboard table)
    const allUserScores = await prisma.user.findMany({
        include: {
            memberships: {
                select: { score: true }
            }
        }
    })

    // Sum scores across all memberships for each user (or take max if they are in multiple groups? 
    // Usually total points is cumulative or unique per tournament. 
    // For now, let's rank by the highest score across all their group memberships)
    const rankings = allUserScores.map(u => ({
        id: u.id,
        maxScore: Math.max(0, ...u.memberships.map(m => m.score))
    })).sort((a, b) => b.maxScore - a.maxScore)

    const globalRank = rankings.findIndex(r => r.id === userId) + 1

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* Header / Nav */}
            <header className="container mx-auto px-6 py-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-blue transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Tournament
                </Link>
            </header>

            <div className="container mx-auto px-6 space-y-12">
                <ProfileHero
                    userName={user.name || "Anonymous Player"}
                    totalPoints={totalPoints}
                    globalRank={globalRank}
                    teamsAlive={teamsAlive}
                    totalTeams={user.draftPicks.length}
                />

                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                        <h2 className="text-2xl font-black text-brand-blue uppercase tracking-tight italic">
                            Your Roster
                        </h2>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {user.draftPicks.length} Teams Selected
                        </span>
                    </div>

                    {user.draftPicks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {user.draftPicks.map((pick) => (
                                <TeamSportsCard
                                    key={pick.id}
                                    team={pick.team}
                                    pointsContributed={teamPointsMap.get(pick.teamId) || 0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-24 text-center space-y-4">
                            <div className="text-gray-300 text-6xl font-black">?</div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-400">No Drafted Teams Yet</h3>
                                <p className="text-gray-500 max-w-xs mx-auto text-sm">Join a group and participate in a snake draft to start building your squad!</p>
                            </div>
                            <Link href="/leaderboard" className="inline-block bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all">
                                Find a Group
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
