"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface Tournament {
    id: string
    name: string
}

export function TournamentFilter({ tournaments }: { tournaments: Tournament[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Default to the most recent tournament if no ID is present and NOT 'all'
    const currentTournamentId = searchParams.get("tournamentId") || (tournaments.length > 0 ? tournaments[0].id : "")

    return (
        <select
            name="tournamentId"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue bg-white"
            value={currentTournamentId}
            onChange={(e) => {
                const value = e.target.value
                const params = new URLSearchParams(searchParams.toString())
                if (value) {
                    params.set("tournamentId", value)
                } else {
                    params.delete("tournamentId")
                }
                router.push(`/admin/groups?${params.toString()}`)
            }}
        >
            <option value="all">All Tournaments</option>
            {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                    {t.name}
                </option>
            ))}
        </select>
    )
}
