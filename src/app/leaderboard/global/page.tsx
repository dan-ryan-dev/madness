import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Trophy, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { GlobalFilter } from "@/components/leaderboard/GlobalFilter"
import { TournamentFilter } from "@/components/leaderboard/TournamentFilter"

export const dynamic = 'force-dynamic'

export default async function GlobalLeaderboardPage({ searchParams }: { searchParams: Promise<{ filterGroupId?: string, tournamentId?: string }> }) {
    const session = await auth()
    const { filterGroupId, tournamentId } = await searchParams
    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"

    // 1. Fetch Tournaments for Filter (Super Admin sees all, Others see only LIVE)
    const availableTournaments = await prisma.tournament.findMany({
        where: isSuperAdmin ? {} : { status: "LIVE" },
        orderBy: { year: 'desc' },
        select: { id: true, name: true, year: true, status: true }
    })

    // Determine which tournament to show
    let activeTournamentId = tournamentId
    if (!activeTournamentId) {
        // Default to the first LIVE tournament
        const liveTournament = availableTournaments.find(t => t.status === "LIVE")
        if (liveTournament) {
            activeTournamentId = liveTournament.id
        } else if (availableTournaments.length > 0) {
            // Fallback to most recent if nothing is live (for admins)
            activeTournamentId = availableTournaments[0].id
        }
    }

    const where: any = {}
    if (filterGroupId) {
        where.groupId = filterGroupId
    } else if (activeTournamentId) {
        where.group = { tournamentId: activeTournamentId }
    } else {
        where.group = { tournament: { status: "LIVE" } }
    }

    // 2. Fetch all groups for filter (Scoped to tournament)
    const allGroups = await prisma.group.findMany({
        where: activeTournamentId ? { tournamentId: activeTournamentId } : {},
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    const globalRankings = await prisma.groupMembership.findMany({
        where,
        orderBy: { score: 'desc' },
        take: 100, // Limit to top 100 for now
        include: {
            user: true,
            group: true
        }
    })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className={`bg-brand-blue py-6 border-b border-white/10 sticky top-0 z-10 shadow-md ${isSuperAdmin ? 'sm:h-32' : ''}`}>
                <div className="container mx-auto px-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Link href="/leaderboard" className="text-white/70 hover:text-white flex items-center gap-2 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back to Standings</span>
                        </Link>
                        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-brand-orange" />
                            Global Standings
                        </h1>
                        <div className="w-[140px]">
                            <GlobalFilter groups={allGroups} />
                        </div>
                    </div>
                    {isSuperAdmin && (
                        <div className="flex justify-center">
                            <TournamentFilter
                                tournaments={availableTournaments}
                                currentTournamentId={activeTournamentId}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {(() => {
                            const globalUniqueScores = [...new Set(globalRankings.map(m => m.score))].sort((a, b) => b - a).slice(0, 2);
                            return globalRankings.map((member, index) => {
                                const isGlobalTiedTop = globalUniqueScores.includes(member.score) && globalRankings.filter(m => m.score === member.score).length > 1;
                                return (
                                    <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <span className={`font-mono font-bold text-sm w-8 text-center flex items-center justify-center h-8 shrink-0 rounded-full ${index < 3 ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-400'}`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 truncate">
                                                <div className="font-bold text-gray-900 truncate">{member.user.name}</div>
                                                <Link
                                                    href={`/groups/${member.groupId}/dashboard`}
                                                    className="text-xs text-gray-400 hover:text-brand-blue hover:underline decoration-brand-blue/30 truncate"
                                                >
                                                    {member.group.name}
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Tiebreaker Column */}
                                        <div className="flex flex-col items-center justify-center w-32 sm:w-40 shrink-0">
                                            {member.finalScoreGuess ? (
                                                <div className={`flex flex-col items-center leading-tight py-1 px-2 ${isGlobalTiedTop ? 'bg-orange-50 rounded border border-brand-orange/20 animate-pulse' : ''}`}>
                                                    <div className={`text-[10px] font-black uppercase tracking-tighter ${isGlobalTiedTop ? 'text-brand-orange' : 'text-brand-blue/40'}`}>
                                                        {member.nitWinnerGuess}
                                                    </div>
                                                    <div className={`text-[10px] font-black ${isGlobalTiedTop ? 'text-brand-orange' : 'text-gray-400'}`}>
                                                        {member.finalScoreGuess}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest italic">Pending</span>
                                            )}
                                        </div>

                                        {/* Score Column */}
                                        <div className="w-16 sm:w-20 text-right shrink-0">
                                            <div className="font-mono font-bold text-xl text-gray-900">{member.score}</div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                        {globalRankings.length === 0 && (
                            <div className="p-12 text-center text-gray-400">No players found matching criteria.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
