import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Trophy, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { GlobalFilter } from "@/components/leaderboard/GlobalFilter"
import { TournamentFilter } from "@/components/leaderboard/TournamentFilter"
import { GlobalLeaderboardWidget } from "@/components/leaderboard/GlobalLeaderboardWidget"
import { RecentTicker } from "@/components/dashboard/RecentTicker"

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ filterGroupId?: string, tournamentId?: string, view?: string }> }) {
    try {
        const session = await auth()
        const { filterGroupId, tournamentId, view } = await searchParams
        const role = session?.user?.role
        const isSuperAdmin = role === "SUPER_ADMIN"
        const isGroupAdmin = role === "GROUP_ADMIN"
        const isAdmin = isSuperAdmin || isGroupAdmin

        // 1. Fetch available tournaments based on roles and memberships
        const availableTournaments = await prisma.tournament.findMany({
            where: {
                OR: [
                    { status: "LIVE" },
                    ...(isAdmin ? [{ status: "SETUP" }, { status: "DRAFTING" }] : []),
                    // Also include any tournament where the user has a membership
                    ...(session?.user?.id ? [{
                        groups: {
                            some: {
                                memberships: {
                                    some: { userId: session.user.id }
                                }
                            }
                        }
                    }] : [])
                ]
            },
            orderBy: { year: 'desc' },
            select: { id: true, name: true, year: true, status: true }
        })

        // Determine which tournament to show
        let activeTournamentId = tournamentId

        // If no tournament specified in URL, try to find a smart default
        if (!activeTournamentId && session?.user?.id) {
            // Check if user has membership in any of the available tournaments
            const userMembership = await prisma.groupMembership.findFirst({
                where: {
                    userId: session.user.id,
                    group: {
                        tournamentId: { in: availableTournaments.map(t => t.id) }
                    }
                },
                orderBy: { joinedAt: 'desc' },
                select: { group: { select: { tournamentId: true } } }
            })

            if (userMembership) {
                activeTournamentId = userMembership.group.tournamentId
            }
        }

        // Fallback to Live or Most Recent
        if (!activeTournamentId) {
            const liveTournament = availableTournaments.find(t => t.status === "LIVE")
            if (liveTournament) {
                activeTournamentId = liveTournament.id
            } else if (availableTournaments.length > 0) {
                activeTournamentId = availableTournaments[0].id
            }
        }

        // Fetch active tournament details for the header and ticker
        const activeTournament = await prisma.tournament.findUnique({
            where: { id: activeTournamentId || "" },
            include: {
                gameResults: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: { winner: true, loser: true }
                }
            }
        })
        const tournamentName = activeTournament?.name || "Official"

        // 2. Fetch all groups for filter
        const allGroups = await prisma.group.findMany({
            where: activeTournamentId ? { tournamentId: activeTournamentId } : {},
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })

        // 3. Global Top 10 (Now handled by widget)

        // 4. Fetch User's Group Standings (Scoped to selected tournament)
        let myGroupStandings: any[] = []
        let myGroupName = ""
        let myGroupId = ""

        if (session?.user?.id) {
            const membership = await prisma.groupMembership.findFirst({
                where: {
                    userId: session.user.id,
                    group: { tournamentId: activeTournamentId || undefined }
                },
                orderBy: { joinedAt: 'asc' },
                include: { group: true }
            })

            if (membership) {
                myGroupName = membership.group.name
                myGroupId = membership.groupId

                // Fetch group with memberships and draftPicks
                const groupData = await prisma.group.findUnique({
                    where: { id: membership.groupId },
                    include: {
                        memberships: { include: { user: true } },
                        draftPicks: { include: { team: true } }
                    }
                })

                if (groupData) {
                    myGroupStandings = groupData.memberships.map((m) => {
                        const picks = groupData.draftPicks.filter(p => p.userId === m.userId)
                        const teamsAlive = picks.filter(p => !p.team.isEliminated).length
                        return {
                            ...m,
                            teamsAlive
                        }
                    }).sort((a, b) => b.score - a.score)
                }
            }
        }

        // 5. Fetch Global Top 50 (For the full standings view)
        // Intentionally not filtering by tournament status this year — use tournamentId if available
        const globalTop50 = await prisma.groupMembership.findMany({
            where: {
                ...(activeTournamentId ? { group: { tournamentId: activeTournamentId } } : {}),
                ...(filterGroupId ? { groupId: filterGroupId } : {})
            },
            orderBy: { score: 'desc' },
            take: 50,
            include: {
                user: true,
                group: {
                    include: {
                        draftPicks: {
                            include: { team: true }
                        }
                    }
                }
            }
        })

        // Map globalTop50 to include teamsAlive
        const enrichedGlobalTop50 = globalTop50.map(member => {
            const picks = member.group.draftPicks.filter(p => p.userId === member.userId)
            const teamsAlive = picks.filter(p => !p.team.isEliminated).length
            return {
                ...member,
                teamsAlive
            }
        })

        // No more currentView toggle - showing both


        return (
            <div className="min-h-screen bg-gray-50 flex flex-col relative font-sans">
                {/* Ticker (connected to bottom of main site header) */}
                <div className="sticky top-[64px] z-[60] shadow-md border-b border-white/10">
                    <RecentTicker results={activeTournament?.gameResults || []} />
                </div>

                <div className="relative z-10 pt-6">
                    {/* Header */}
                    <div className="bg-brand-blue py-5 border-b border-white/10 sticky top-[104px] z-50 shadow-lg relative overflow-hidden">
                        {/* Pinned Trophy Icon */}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Trophy className="w-24 h-24 text-white rotate-12" />
                        </div>

                        <div className="container mx-auto px-4 text-center space-y-3 relative z-10">
                            <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-3">
                                <Trophy className="w-6 h-6 text-brand-orange hidden sm:block" />
                                {tournamentName} Official Standings
                            </h1>
                            {isAdmin && availableTournaments.length > 0 && (
                                <TournamentFilter
                                    tournaments={availableTournaments}
                                    currentTournamentId={activeTournamentId}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 container mx-auto px-4 py-8 mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                    <div className="bg-brand-blue px-4 sm:px-6 py-4 border-b border-white/10">
                                        <div className="flex items-center justify-between gap-4">
                                            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 whitespace-nowrap">
                                                <Trophy className="w-5 h-5 text-brand-orange" />
                                                Global Standings
                                                <span className="text-xs font-normal text-white/60 hidden sm:inline">(Top 50)</span>
                                            </h2>
                                            <div className="bg-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2 border border-white/10">
                                                <Users className="w-3.5 h-3.5 text-brand-orange" />
                                                <GlobalFilter groups={allGroups} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative group/scroll">
                                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                                            <table className="w-full text-left min-w-[700px] lg:min-w-0">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        <th className="px-4 sm:px-6 py-3 w-12 sm:w-16 text-center">Rank</th>
                                                        <th className="px-4 sm:px-6 py-3">Player</th>
                                                        <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Group</th>
                                                        <th className="px-4 sm:px-6 py-3 text-center">Alive</th>
                                                        <th className="px-4 sm:px-6 py-3 text-center">Tie-Breaker</th>
                                                        <th className="px-4 sm:px-6 py-3 text-right">Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {(() => {
                                                        const globalUniqueScores = [...new Set(enrichedGlobalTop50.map(m => m.score))].sort((a, b) => b - a).slice(0, 2);
                                                        return enrichedGlobalTop50.map((member, index) => {
                                                            const isGlobalTiedTop = globalUniqueScores.includes(member.score) && enrichedGlobalTop50.filter(m => m.score === member.score).length > 1;
                                                            const trophyColor = index === 0 ? "text-[#FFD700]" : index === 1 ? "text-[#C0C0C0]" : index === 2 ? "text-[#CD7F32]" : "";

                                                            return (
                                                                <tr key={member.id} className="hover:bg-gray-50 transition-colors group/row">
                                                                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                                                                        <div className="flex flex-col items-center">
                                                                            <span className={`font-mono font-bold ${index < 3 ? 'text-lg sm:text-xl' : 'text-gray-400 text-sm'}`}>
                                                                                {index + 1}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                                                                        <div className="flex flex-col">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-bold text-gray-900 text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                                                                                    {member.user.name}
                                                                                </span>
                                                                                {index < 3 && <Trophy className={`w-4 h-4 ${trophyColor} shrink-0`} />}
                                                                            </div>
                                                                            <span className="text-[10px] text-gray-500 sm:hidden truncate max-w-[100px]">
                                                                                {member.group.name}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 sm:px-6 py-4 sm:py-5 hidden sm:table-cell">
                                                                        <Link
                                                                            href={`/groups/${member.groupId}/dashboard`}
                                                                            className="text-sm text-gray-500 hover:text-brand-blue hover:underline"
                                                                        >
                                                                            {member.group.name}
                                                                        </Link>
                                                                    </td>
                                                                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                                                                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${member.teamsAlive > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                            {member.teamsAlive}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                                                                        {member.finalScoreGuess ? (
                                                                            <div className={`flex flex-col items-center leading-tight ${isGlobalTiedTop ? 'bg-orange-50 rounded-lg py-1 border border-brand-orange/20 animate-pulse' : ''}`}>
                                                                                <div className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter ${isGlobalTiedTop ? 'text-brand-orange' : 'text-brand-blue/60'}`}>
                                                                                    {member.nitWinnerGuess}
                                                                                </div>
                                                                                <div className={`text-[10px] sm:text-xs font-black ${isGlobalTiedTop ? 'text-brand-orange' : 'text-gray-400'}`}>
                                                                                    {member.finalScoreGuess}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest italic">Pending</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-right">
                                                                        <span className="text-xl sm:text-2xl font-black text-brand-blue">{member.score}</span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="sm:hidden pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent opacity-50"></div>
                                    </div>
                                    <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-3 text-center">
                                        <Link
                                            href={`/leaderboard/global${activeTournamentId ? `?tournamentId=${activeTournamentId}` : ''}`}
                                            className="text-xs text-gray-400 hover:text-brand-blue transition-colors font-medium italic"
                                        >
                                            😬 Curious how far down the list goes? See the full standings →
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Right Pane: My Group (1/3 on Desktop) */}
                            <div className="lg:col-span-1 space-y-6">
                                {session?.user ? (
                                    myGroupStandings.length > 0 ? (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                            <div className="bg-brand-blue px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/10">
                                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-gray-300" />
                                                    {myGroupName}
                                                </h2>
                                                <Link href={`/groups/${myGroupId}/dashboard`} className="text-[10px] text-white/70 hover:text-white underline uppercase font-bold tracking-wider">
                                                    Dashboard
                                                </Link>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                            <th className="px-4 py-3 w-12 text-center">#</th>
                                                            <th className="px-4 py-3">Player</th>
                                                            <th className="px-4 py-3 text-right">Score</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {(() => {
                                                            const groupUniqueScores = [...new Set(myGroupStandings.map(m => m.score))].sort((a, b) => b - a).slice(0, 2);
                                                            return myGroupStandings.map((member, index) => {
                                                                const isTied = myGroupStandings.filter(m => m.score === member.score).length > 1 && groupUniqueScores.includes(member.score);
                                                                return (
                                                                    <tr key={member.id} className={`hover:bg-blue-50/30 transition-colors ${member.user.id === session.user?.id ? 'bg-yellow-50' : ''}`}>
                                                                        <td className="px-4 py-4 text-center">
                                                                            <span className={`font-bold text-sm ${index === 0 ? 'text-brand-orange' : 'text-gray-400'}`}>
                                                                                {index + 1}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-4 font-bold text-gray-900 text-sm">
                                                                            <div className="flex items-center gap-2">
                                                                                {member.user.name}
                                                                                {index === 0 && <Trophy className="w-3 h-3 text-brand-orange" />}
                                                                            </div>
                                                                            {member.finalScoreGuess && (
                                                                                <div className="text-[9px] text-gray-400 font-normal uppercase tracking-tight">
                                                                                    {member.nitWinnerGuess} • {member.finalScoreGuess}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-4 text-right">
                                                                            <span className="text-lg font-black text-brand-blue">{member.score}</span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            });
                                                        })()}
                                                    </tbody>
                                                    <tfoot className="bg-gray-50 border-t border-gray-100">
                                                        <tr>
                                                            <td colSpan={2} className="px-4 py-3 text-right font-bold uppercase tracking-widest text-gray-400 text-[10px]">
                                                                Group Total
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <span className="text-xl font-black text-brand-orange">
                                                                    {myGroupStandings.reduce((sum, m) => sum + m.score, 0)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm space-y-4">
                                            <Users className="w-12 h-12 text-gray-200 mx-auto" />
                                            <h3 className="text-base font-bold text-gray-900">Not in a group?</h3>
                                            <p className="text-xs text-gray-500">Join a group to track your personal standings against friends.</p>
                                            <Link
                                                href="/groups"
                                                className="inline-block px-4 py-2 bg-brand-blue text-white text-xs rounded-lg font-bold hover:bg-brand-dark transition-colors"
                                            >
                                                Find Groups
                                            </Link>
                                        </div>
                                    )
                                ) : (
                                    <div className="bg-white rounded-xl p-8 text-center border border-gray-200 shadow-sm space-y-4">
                                        <Users className="w-12 h-12 text-gray-200 mx-auto" />
                                        <h3 className="text-base font-bold text-gray-900">Sign in to compete</h3>
                                        <Link href="/api/auth/signin" className="inline-block bg-brand-orange text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors text-xs">
                                            Join a Group
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("Leaderboard Error:", error)
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase italic">Leaderboard Error</h2>
                    <p className="text-gray-500 text-sm">
                        Issue detected: {error?.message || "Internal Exception"}
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg text-left overflow-auto max-h-32 shadow-inner border border-red-50">
                        <code className="text-[10px] text-red-500 font-mono">
                            {error?.stack?.split('\n').slice(0, 3).join('\n') || "No trace available"}
                        </code>
                    </div>
                </div>
            </div>
        )
    }
}
