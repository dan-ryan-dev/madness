import { GameResult, Team } from "@prisma/client"
import { Clock, TrendingUp } from "lucide-react"
import { ROUND_LABELS } from "@/lib/constants"
import { calculateGamePoints } from "@/lib/scoring"

type GameResultWithTeams = GameResult & {
    winner: Team | null
    loser: Team | null
}

export function RecentTicker({ results }: { results: GameResultWithTeams[] }) {
    if (results.length === 0) return null

    // Duplicate results for seamless loop
    const displayResults = [...results, ...results]

    return (
        <div className="bg-gray-900 border-b border-white/10 overflow-hidden relative group">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-0"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-900 via-gray-900/80 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-0"></div>

            <div className="flex items-center whitespace-nowrap py-3">
                <div className="flex items-center gap-2 px-6 py-1 bg-gray-900 z-20 sticky left-0 border-r border-white/5 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
                    <Clock className="w-3 h-3 text-brand-orange animate-pulse" />
                    <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Latest Scoring</span>
                </div>

                <div className="flex items-center gap-6 animate-scroll hover:[animation-play-state:paused]">
                    {displayResults.map((game, idx) => {
                        const points = calculateGamePoints(game);
                        return (
                            <div key={`${game.id}-${idx}`} className="inline-flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-colors rounded-full pl-3 pr-4 py-1.5 border border-white/10">
                                <span className="text-[10px] font-black text-brand-orange uppercase bg-brand-orange/10 px-2 py-0.5 rounded leading-none">
                                    {ROUND_LABELS[game.round]?.split('(')[0].trim() || `R${game.round}`}
                                </span>
                                <div className="flex items-center gap-2 text-sm text-gray-200">
                                    <span className="font-bold">({game.winner?.seed}) {game.winner?.name}</span>
                                    <span className="text-[9px] text-gray-500 font-black bg-white/5 px-1.5 py-0.5 rounded border border-white/5">DEF.</span>
                                    <span className="text-gray-400 font-medium italic opacity-80">({game.loser?.seed}) {game.loser?.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 ml-1">
                                    <TrendingUp className="w-3 h-3 text-green-400" />
                                    <span className="text-xs font-black text-white">{points} PTS</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}
