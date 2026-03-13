import prisma from "@/lib/prisma"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

interface GlobalLeaderboardWidgetProps {
    tournamentId?: string
    isSticky?: boolean
}

export async function GlobalLeaderboardWidget({ tournamentId, isSticky = false }: GlobalLeaderboardWidgetProps) {
    // 2. Fetch tournament info for header context
    const tournament = tournamentId
        ? await prisma.tournament.findUnique({ where: { id: tournamentId }, select: { name: true } })
        : await prisma.tournament.findFirst({ where: { status: "LIVE" }, select: { name: true } })

    const tournamentLabel = tournament?.name || "Global"

    // 1. Fetch Global Top 10 (Filtered by Tournament only)
    const where: any = {}
    if (tournamentId) {
        where.group = { tournamentId }
    } else {
        // If no specific tournament provided, default to LIVE tournaments
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

    const globalUniqueScores = [...new Set(globalTop10.map(m => m.score))].sort((a, b) => b - a).slice(0, 2);

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${isSticky ? 'lg:sticky lg:top-24' : ''}`}>
            <div className="bg-brand-blue px-6 py-4 flex items-center justify-between border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-orange" />
                    {tournamentLabel} Top 10
                </h2>
            </div>
            <div className="divide-y divide-gray-100">
                {globalTop10.map((member, index) => {
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
                })}
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
    )
}
