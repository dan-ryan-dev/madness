"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Info } from "lucide-react"

interface Tournament {
    id: string
    name: string
    year: number
}

interface TournamentFilterProps {
    tournaments: Tournament[]
    currentTournamentId?: string
}

export function TournamentFilter({ tournaments, currentTournamentId }: TournamentFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleTournamentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        if (id) {
            params.set("tournamentId", id)
        } else {
            params.delete("tournamentId")
        }
        router.push(`/leaderboard?${params.toString()}`)
    }

    if (tournaments.length <= 1) return null

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 group relative">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                    Tournament (Admin View Only)
                </span>
                <div className="hover:text-brand-orange cursor-help transition-colors text-white/30">
                    <Info className="w-3 h-3" />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center font-bold">
                    Only super admins can see previous tournament results.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                </div>
            </div>

            <select
                value={currentTournamentId || ""}
                onChange={handleTournamentChange}
                className="bg-brand-blue/50 border border-white/20 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none cursor-pointer hover:bg-brand-blue/70 transition-all"
            >
                <option value="">Default (Live)</option>
                {tournaments.map((t) => (
                    <option key={t.id} value={t.id} className="bg-brand-blue">
                        {t.name} ({t.year})
                    </option>
                ))}
            </select>
        </div>
    )
}
