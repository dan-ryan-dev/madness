import { Team } from "@prisma/client"
import { Zap, Skull } from "lucide-react"

interface TeamSportsCardProps {
    team: Team
    pointsContributed: number
}

export function TeamSportsCard({ team, pointsContributed }: TeamSportsCardProps) {
    return (
        <div className={`relative group bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden ${team.isEliminated ? 'border-gray-100 opacity-75' : 'border-gray-200'}`}>
            {/* Team Header */}
            <div className={`px-4 py-3 border-b flex justify-between items-center ${team.isEliminated ? 'bg-gray-50' : 'bg-brand-blue/5'}`}>
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Seed #{team.seed}</span>
                {team.isEliminated ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                        <Skull className="w-3 h-3" />
                        ELIMINATED
                    </span>
                ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        <Zap className="w-3 h-3" />
                        ALIVE
                    </span>
                )}
            </div>

            {/* Team Body */}
            <div className="p-5 space-y-4">
                <div className="space-y-1">
                    <h3 className={`text-xl font-black text-brand-dark uppercase tracking-tight leading-tight ${team.isEliminated ? 'grayscale italic opacity-60' : ''}`}>
                        {team.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{team.region} Region</p>
                </div>

                <div className="pt-2 flex items-end justify-between border-t border-gray-50">
                    <div className="space-y-0.5">
                        <div className="text-[10px] font-black text-gray-300 uppercase">Points</div>
                        <div className={`text-3xl font-black ${team.isEliminated ? 'text-gray-400' : 'text-brand-orange'}`}>
                            {pointsContributed}
                        </div>
                    </div>
                    {/* Visual Flair: Mini Logo or Initial */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl border-4 ${team.isEliminated ? 'bg-gray-100 border-white text-gray-300' : 'bg-brand-blue text-white border-brand-orange shadow-lg'}`}>
                        {team.name[0]}
                    </div>
                </div>
            </div>

            {/* Card Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/0 via-white/0 to-gray-500/5"></div>
            {team.isEliminated && (
                <div className="absolute inset-0 bg-white/40 pointer-events-none backdrop-grayscale-[0.5]"></div>
            )}
        </div>
    )
}
