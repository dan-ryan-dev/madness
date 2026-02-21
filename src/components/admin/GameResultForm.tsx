"use client"

import { processGameResult } from "@/app/actions/game"
import { useActionState, useState, useEffect } from "react"
import { Trophy, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { ROUND_LABELS } from "@/lib/constants"

interface Team {
    id: string
    name: string
    seed: number
    region: string
}

export function GameResultForm({ teams, tournamentId, currentRound }: { teams: Team[], tournamentId: string, currentRound?: number }) {
    const [state, formAction, isPending] = useActionState(processGameResult, { success: false, message: "" })
    const [teamA, setTeamA] = useState<string>("")
    const [teamB, setTeamB] = useState<string>("")
    const [winner, setWinner] = useState<string>("")
    const router = useRouter()

    // Initialize round from URL or default to 1
    const [selectedRound, setSelectedRound] = useState<number>(currentRound || 1)

    // Sync selectedRound if currentRound prop changes (e.g. via navigation or refresh)
    useEffect(() => {
        if (currentRound && currentRound !== selectedRound) {
            setSelectedRound(currentRound)
        }
    }, [currentRound, selectedRound])

    useEffect(() => {
        if (state.success) {
            setTeamA("")
            setTeamB("")
            setWinner("")
            router.refresh()
        }
    }, [state.success, router])

    // Update URL when round changes
    const handleRoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const round = parseInt(e.target.value)
        setSelectedRound(round)
        router.push(`/admin/tournaments/${tournamentId}/games?round=${round}`)
    }

    // Sort teams alphabetically for easier finding
    const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name))

    return (
        <form action={formAction} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <input type="hidden" name="tournamentId" value={tournamentId} />

            {/* Round Selection */}
            <div>
                <label htmlFor="round" className="block text-sm font-medium text-gray-700 mb-1">
                    Round
                </label>
                <select
                    name="round"
                    id="round"
                    required
                    value={selectedRound}
                    onChange={handleRoundChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                >
                    {Object.entries(ROUND_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team A */}
                <div>
                    <label htmlFor="teamA" className="block text-sm font-medium text-gray-700 mb-1">
                        Team A
                    </label>
                    <select
                        name="teamA_selector" // Just for UI state, not submission
                        value={teamA}
                        onChange={(e) => {
                            setTeamA(e.target.value)
                            if (winner === teamA) setWinner("")
                        }}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                    >
                        <option value="">Select Team A</option>
                        {sortedTeams.filter(t => t.id !== teamB).map(t => (
                            <option key={t.id} value={t.id}>
                                ({t.seed}) {t.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Team B */}
                <div>
                    <label htmlFor="teamB" className="block text-sm font-medium text-gray-700 mb-1">
                        Team B
                    </label>
                    <select
                        name="teamB_selector"
                        value={teamB}
                        onChange={(e) => {
                            setTeamB(e.target.value)
                            if (winner === teamB) setWinner("")
                        }}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                    >
                        <option value="">Select Team B</option>
                        {sortedTeams.filter(t => t.id !== teamA).map(t => (
                            <option key={t.id} value={t.id}>
                                ({t.seed}) {t.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Winner Selection - Visual Toggle/Radio */}
            {(teamA && teamB) && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Who Won?
                    </label>
                    <div className="flex justify-center gap-4">
                        <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all w-full md:w-1/3 ${winner === teamA ? 'border-brand-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                            <input
                                type="radio"
                                name="winnerId"
                                value={teamA}
                                checked={winner === teamA}
                                onChange={() => setWinner(teamA)}
                                className="sr-only"
                                required
                            />
                            <span className="font-bold text-lg text-center">{sortedTeams.find(t => t.id === teamA)?.name}</span>
                            <span className="text-xs text-gray-500 mt-1">Team A</span>
                        </label>

                        <div className="self-center font-bold text-gray-400">VS</div>

                        <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all w-full md:w-1/3 ${winner === teamB ? 'border-brand-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                            <input
                                type="radio"
                                name="winnerId"
                                value={teamB}
                                checked={winner === teamB}
                                onChange={() => setWinner(teamB)}
                                className="sr-only"
                                required
                            />
                            <span className="font-bold text-lg text-center">{sortedTeams.find(t => t.id === teamB)?.name}</span>
                            <span className="text-xs text-gray-500 mt-1">Team B</span>
                        </label>
                    </div>
                    {/* Hidden input for Loser ID based on selection */}
                    <input type="hidden" name="loserId" value={winner === teamA ? teamB : teamA} />
                </div>
            )}

            {/* Status Messages */}
            {state.message && (
                <div className={`p-4 rounded-md flex items-start gap-2 ${state.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                    {state.success ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                    <p>{state.message}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={isPending || !winner}
                className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isPending ? "Recording Result..." : "Record Game Result"}
            </button>
        </form>
    )
}
