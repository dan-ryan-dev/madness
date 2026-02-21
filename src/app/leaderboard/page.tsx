import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Trophy, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { GlobalFilter } from "@/components/leaderboard/GlobalFilter"
import { TournamentFilter } from "@/components/leaderboard/TournamentFilter"

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ filterGroupId?: string, tournamentId?: string }> }) {
    try {
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

        // 2. Fetch all groups for filter
        const allGroups = await prisma.group.findMany({
            where: activeTournamentId ? { tournamentId: activeTournamentId } : {},
            select: { id: true, name: true },
            orderBy: { name: 'asc' }
        })

        // 3. Fetch Global Top 10 (Filtered by Tournament)
        const where: any = {}
        if (filterGroupId) {
            where.groupId = filterGroupId
        } else if (activeTournamentId) {
            where.group = { tournamentId: activeTournamentId }
        } else {
            // If no specific tournament selected and nothing live, filter by status live via relations
            where.group = { tournament: { status: "LIVE" } }
        }

        const globalTop10 = await prisma.groupMembership.findMany({
            where,
            orderBy: { score: 'desc' },
            take: 10,
            include: {
                user: true,
                group: true
            }
        })

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

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Header */}
                <div className="bg-brand-blue py-8 border-b border-white/10">
                    <div className="container mx-auto px-4 text-center space-y-4">
                        <h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-3">
                            <Trophy className="w-8 h-8 text-brand-orange" />
                            Official Standings
                        </h1>
                        {isSuperAdmin && (
                            <TournamentFilter
                                tournaments={availableTournaments}
                                currentTournamentId={activeTournamentId}
                            />
                        )}
                    </div>
                </div>

                <div className="flex-1 container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">

                    {/* Left Pane: Global Top 10 */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-brand-blue px-4 py-3 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-brand-orange" />
                                    Global Top 10
                                </h2>
                                <GlobalFilter groups={allGroups} />
                            </div>
                            <div className="divide-y divide-gray-100">
                                {(() => {
                                    const globalUniqueScores = [...new Set(globalTop10.map(m => m.score))].sort((a, b) => b - a).slice(0, 2);
                                    return globalTop10.map((member, index) => {
                                        const isGlobalTiedTop = globalUniqueScores.includes(member.score) && globalTop10.filter(m => m.score === member.score).length > 1;
                                        return (
                                            <div key={member.id} className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-mono font-bold text-xs w-5 text-center ${index < 3 ? 'text-brand-orange text-base' : 'text-gray-400'}`}>
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-gray-900 text-sm truncate max-w-[120px]">{member.user.name}</div>
                                                        <Link
                                                            href={`/groups/${member.groupId}/dashboard`}
                                                            className="text-[10px] text-gray-400 hover:text-brand-blue hover:underline decoration-brand-blue/30 whitespace-nowrap"
                                                        >
                                                            {member.group.name}
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="font-mono font-bold text-base text-gray-900">{member.score}</div>
                                                    {member.finalScoreGuess && (
                                                        <div className={`text-[9px] font-black uppercase tracking-tighter ${isGlobalTiedTop
                                                            ? 'text-brand-orange bg-orange-50 px-1 rounded animate-pulse'
                                                            : 'text-brand-blue/40'
                                                            }`}>
                                                            {member.nitWinnerGuess} • {member.finalScoreGuess}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                                {globalTop10.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 text-sm">No players found.</div>
                                )}
                            </div>
                            {/* See More Link */}
                            <div className="bg-gray-50 p-2 text-center border-t border-gray-100">
                                <Link href="/leaderboard/global" className="text-xs font-bold text-brand-blue hover:text-brand-orange transition-colors">
                                    See Full Standings
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Group Standings */}
                    <div className="lg:col-span-2 space-y-4">
                        {session?.user ? (
                            myGroupStandings.length > 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                                    <div className="bg-brand-blue px-6 py-4 flex items-center justify-between border-b border-white/10">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Users className="w-5 h-5 text-gray-300" />
                                            {myGroupName}
                                        </h2>
                                        <Link href={`/groups/${myGroupId}/dashboard`} className="text-xs text-white/70 hover:text-white underline">
                                            View Dashboard
                                        </Link>
                                    </div>
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                    <th className="px-6 py-3 w-16 text-center">Rank</th>
                                                    <th className="px-6 py-3">Player</th>
                                                    <th className="px-6 py-3 text-center">Teams Alive</th>
                                                    <th className="px-6 py-3 text-center">Tie-Breaker</th>
                                                    <th className="px-6 py-3 text-right">Score</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {(() => {
                                                    const groupUniqueScores = [...new Set(myGroupStandings.map(m => m.score))].sort((a, b) => b - a).slice(0, 2);
                                                    return myGroupStandings.map((member, index) => {
                                                        const isTied = myGroupStandings.filter(m => m.score === member.score).length > 1 && groupUniqueScores.includes(member.score);
                                                        return (
                                                            <tr key={member.id} className={`hover:bg-blue-50/30 transition-colors ${member.user.id === session.user?.id ? 'bg-yellow-50' : ''}`}>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className={`font-bold ${index === 0 ? 'text-brand-orange text-xl' : 'text-gray-500'}`}>
                                                                        {index + 1}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                                                                    {index === 0 && <Trophy className="w-4 h-4 text-brand-orange" />}
                                                                    {member.user.name}
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${member.teamsAlive > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                        {member.teamsAlive}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    {member.finalScoreGuess ? (
                                                                        <div className={`flex flex-col items-center leading-tight ${isTied ? 'bg-orange-50 rounded-lg py-1 border border-brand-orange/20 animate-pulse' : ''}`}>
                                                                            <div className={`text-[10px] font-black uppercase tracking-tighter ${isTied ? 'text-brand-orange' : 'text-brand-blue/60'}`}>
                                                                                {member.nitWinnerGuess}
                                                                            </div>
                                                                            <div className={`text-xs font-black ${isTied ? 'text-brand-orange' : 'text-gray-400'}`}>
                                                                                {member.finalScoreGuess}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic">Pending</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <span className="text-2xl font-black text-brand-blue">{member.score}</span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                            <tfoot className="bg-gray-50 border-t-2 border-brand-blue/20">
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-right font-black uppercase tracking-widest text-gray-500 text-xs">
                                                        Group Total Score
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-3xl font-black text-brand-orange">
                                                            {myGroupStandings.reduce((sum, m) => sum + m.score, 0)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">You are not in a group yet!</h3>
                                    <p className="text-gray-500 mb-6">Join a group to see your standing.</p>
                                    {/* Add instructions or CTA */}
                                </div>
                            )
                        ) : (
                            <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Sign in to view your group</h3>
                                <Link href="/api/auth/signin" className="inline-block bg-brand-orange text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors">
                                    Sign In
                                </Link>
                            </div>
                        )}
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
