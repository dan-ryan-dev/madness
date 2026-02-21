import { GameResult, Team } from "@prisma/client"
import { Clock } from "lucide-react"
import { ROUND_LABELS } from "@/lib/constants"

type GameResultWithTeams = GameResult & {
    winner: Team | null
    loser: Team | null
}

export function RecentTicker({ results }: { results: GameResultWithTeams[] }) {
    if (results.length === 0) return null

    return (
        <div className="bg-gray-900 border-b border-white/10 overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-900 to-transparent z-10"></div>

            <div className="flex items-center gap-8 py-3 px-4 animate-scroll whitespace-nowrap overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider sticky left-0">
                    <Clock className="w-3 h-3" />
                    Latest
                </div>
                {results.map((game) => (
                    <div key={game.id} className="inline-flex items-center gap-3 bg-white/5 rounded-full px-4 py-1.5 border border-white/10">
                        <span className="text-xs font-bold text-brand-orange">{ROUND_LABELS[game.round] || `R${game.round}`}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-200">
                            <span className="font-bold">({game.winner?.seed}) {game.winner?.name}</span>
                            <span className="text-xs text-gray-500 font-bold bg-white/10 px-1.5 py-0.5 rounded">DEF</span>
                            <span className="text-gray-400 line-through decoration-red-500/50">({game.loser?.seed}) {game.loser?.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
