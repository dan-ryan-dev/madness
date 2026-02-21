import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ArrowLeft, Trophy, Clock } from "lucide-react"
import Link from "next/link"
import { GameResultForm } from "@/components/admin/GameResultForm"
import { ROUND_LABELS } from "@/lib/constants"
import { RevertGameButton } from "@/components/admin/RevertGameButton"
import { getSeedBracket, ROUND_POINTS } from "@/lib/scoring"


export default async function TournamentGamesPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ round?: string }> }) {
    const session = await auth()
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const { id } = await params
    const { round } = await searchParams
    const currentRound = round ? parseInt(round) : 1

    const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: {
            teams: {
                where: { isEliminated: false },
                orderBy: { name: 'asc' }
            },
            gameResults: {
                where: { round: currentRound }, // Filter by current round
                orderBy: { createdAt: 'desc' },
                // take: 20, // Remove limit to see all round results
                include: {
                    winner: true,
                    loser: true
                }
            }
        }
    })

    if (!tournament) return <div className="p-8 text-center text-red-500">Tournament not found</div>

    // Identify teams that have already won in this round
    const teamsWonInRound = new Set(tournament.gameResults.map(g => g.winnerId))

    // Filter available teams for the form:
    // 1. Must not be eliminated (handled by query)
    // 2. Must not have won in THIS round already
    const availableTeams = tournament.teams.filter(team => !teamsWonInRound.has(team.id))

    // Helper to calculate score for display
    const getGamePoints = (round: number, winnerSeed: number, loserSeed: number) => {
        const base = ROUND_POINTS[round] || 0
        const winnerBracket = getSeedBracket(winnerSeed)
        const loserBracket = getSeedBracket(loserSeed)
        const upset = Math.max(0, winnerBracket - loserBracket)
        return { total: base + upset, base, upset }
    }

    const totalRoundPoints = tournament.gameResults.reduce((acc, game) => {
        if (game.winner && game.loser) {
            return acc + getGamePoints(game.round, game.winner.seed, game.loser.seed).total
        }
        return acc
    }, 0)

    return (
        <div className="container mx-auto py-8">
            <Link href="/admin/tournaments" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tournaments
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-brand-orange" />
                    Manage Games
                    <span className="text-lg text-gray-400 font-normal">({tournament.name})</span>
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Game Result Form */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Record New Result</h2>
                    <GameResultForm
                        teams={availableTeams}
                        tournamentId={tournament.id}
                        currentRound={currentRound}
                    />
                </div>

                {/* Recent Results Feed */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <h3 className="font-semibold text-gray-700">Results for {ROUND_LABELS[currentRound]}</h3>
                        </div>
                        <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange rounded-full text-xs font-bold whitespace-nowrap">
                            {totalRoundPoints} Total Pts
                        </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {tournament.gameResults.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                No results recorded for this round.
                            </div>
                        ) : (
                            tournament.gameResults.map(game => {
                                const points = game.winner && game.loser
                                    ? getGamePoints(game.round, game.winner.seed, game.loser.seed)
                                    : { total: 0, base: 0, upset: 0 }

                                return (
                                    <div key={game.id} className="p-4 hover:bg-gray-50 transition-colors group">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
                                                {ROUND_LABELS[game.round] || `Round ${game.round}`}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">
                                                    {game.createdAt.toLocaleDateString()}
                                                </span>
                                                <RevertGameButton gameId={game.id} tournamentId={tournament.id} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-bold text-gray-900">
                                                    <span className="text-gray-400 text-xs mr-1">({game.winner?.seed})</span>
                                                    {game.winner?.name}
                                                </span>
                                                <span className="text-xs text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">DEF</span>
                                                <span className="text-gray-500 line-through decoration-red-500 decoration-2">
                                                    <span className="text-gray-400 text-xs mr-1">({game.loser?.seed})</span>
                                                    {game.loser?.name}
                                                </span>
                                            </div>
                                            <div className="text-xs text-center text-gray-500 bg-gray-50 py-1 rounded mt-1">
                                                <span className="font-bold text-brand-orange">{points.total} pts awarded</span>
                                                {points.upset > 0 && <span className="ml-1 text-xs text-gray-400">({points.base} base + {points.upset} upset)</span>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
