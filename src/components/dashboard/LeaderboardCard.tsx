import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { GroupMembership, User } from "@prisma/client"

type MemberWithUser = GroupMembership & {
    user: User
    teamsAlive: number
    totalTeams: number
    rank: number
    finalScoreGuess?: number | null
    nitWinnerGuess?: string | null
}

export function LeaderboardCard({ members }: { members: MemberWithUser[] }) {
    return (
        <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100/50 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-brand-orange" />
                    Live Standings
                </h2>
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <th className="px-6 py-3">Rank</th>
                            <th className="px-6 py-3">Player</th>
                            <th className="px-6 py-3 text-center">Alive</th>
                            <th className="px-6 py-3 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {members.map((member, index) => (
                            <tr
                                key={member.id}
                                className={`hover:bg-white/40 transition-colors ${index < 3 ? 'bg-gradient-to-r from-orange-50/30 to-transparent' : ''}`}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold text-lg w-6 text-center ${index === 0 ? 'text-brand-orange' : 'text-gray-500'}`}>
                                            {member.rank}
                                        </span>
                                        {/* Trend Indicator (Mock logic for now) */}
                                        {index === 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> :
                                            index > 4 ? <TrendingDown className="w-4 h-4 text-red-500" /> :
                                                <Minus className="w-4 h-4 text-gray-300" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${index === 0 ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600'}`}>
                                        {member.user.name?.[0] || "U"}
                                    </div>
                                    <div className="flex flex-col">
                                        <span>{member.user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full border border-gray-200">
                                        <span className={`text-sm font-bold ${member.teamsAlive === 0 ? 'text-red-600' : 'text-gray-900'}`}>{member.teamsAlive}</span>
                                        <span className="text-xs text-gray-400">/</span>
                                        <span className="text-xs text-gray-500">{member.totalTeams}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black text-brand-blue leading-none">{member.score}</span>
                                        {member.finalScoreGuess ? (
                                            <div className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${members.filter(m => m.score === member.score).length > 1
                                                ? 'text-brand-orange bg-orange-50 px-1.5 py-0.5 rounded border border-brand-orange/10'
                                                : 'text-brand-blue/30'
                                                }`}>
                                                {member.nitWinnerGuess} • {member.finalScoreGuess}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">PTS</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t-2 border-brand-blue/10 bg-brand-blue/5">
                        <tr>
                            <td className="px-6 py-4 font-bold text-brand-blue uppercase tracking-wider text-xs" colSpan={3}>
                                Group Total
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="text-2xl font-black text-brand-blue">
                                    {members.reduce((acc, m) => acc + m.score, 0)}
                                </span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
