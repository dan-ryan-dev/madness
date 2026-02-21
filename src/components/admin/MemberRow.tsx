"use client"

import { removeMember, saveTieBreaker } from "@/app/actions/group"
import { Trash2, User as UserIcon, Save, Loader2 } from "lucide-react"
import { useTransition, useState } from "react"

interface MemberRowProps {
    groupId: string
    player: {
        id: string
        userId: string
        user: {
            name: string | null
            email: string | null
        }
        role: string
        joinedAt: Date
        draftPosition: number
        finalScoreGuess: number | null
        nitWinnerGuess: string | null
    }
}

export function MemberRow({ groupId, player }: MemberRowProps) {
    const [isPending, startTransition] = useTransition()
    const [nitWinner, setNitWinner] = useState(player.nitWinnerGuess || "")
    const [finalScore, setFinalScore] = useState(player.finalScoreGuess?.toString() || "")
    const [isSavingTB, setIsSavingTB] = useState(false)
    const [tbSaved, setTbSaved] = useState(false)

    const handleRemove = async () => {
        if (!confirm(`Are you sure you want to remove ${player.user.name || player.user.email}? This will delete their draft picks.`)) {
            return
        }

        startTransition(async () => {
            await removeMember(groupId, player.userId)
        })
    }

    const handleSaveTB = async () => {
        setIsSavingTB(true)
        try {
            const result = await saveTieBreaker(
                groupId,
                parseInt(finalScore) || 0,
                nitWinner,
                player.userId
            )
            if (result.success) {
                setTbSaved(true)
                setTimeout(() => setTbSaved(false), 2000)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsSavingTB(false)
        }
    }

    const hasTBChanges = nitWinner !== (player.nitWinnerGuess || "") ||
        finalScore !== (player.finalScoreGuess?.toString() || "")

    return (
        <div className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-100 gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 text-gray-400">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{player.user.name || "Unknown Name"}</p>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${player.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {player.role}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">{player.user.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100/50 border border-gray-200/50">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Pos</span>
                        <span className="text-sm font-black text-brand-blue/60">{player.draftPosition || '-'}</span>
                    </div>

                    {player.role !== 'ADMIN' && (
                        <button
                            onClick={handleRemove}
                            disabled={isPending}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors disabled:opacity-50"
                            title="Remove Member"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tie-Breaker Section */}
            <div className="flex flex-wrap items-end gap-4 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-wider">NIT Winner</label>
                    <input
                        type="text"
                        value={nitWinner}
                        onChange={(e) => setNitWinner(e.target.value)}
                        placeholder="e.g. UConn"
                        className="w-full text-xs font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:border-brand-blue outline-none"
                    />
                </div>
                <div className="w-24">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-wider">Final Score</label>
                    <input
                        type="number"
                        value={finalScore}
                        onChange={(e) => setFinalScore(e.target.value)}
                        placeholder="145"
                        className="w-full text-xs font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:border-brand-blue outline-none"
                    />
                </div>
                <div className="flex items-center h-[30px]">
                    {hasTBChanges ? (
                        <button
                            onClick={handleSaveTB}
                            disabled={isSavingTB}
                            className="bg-brand-blue text-white p-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                            title="Save Tie-Breaker"
                        >
                            {isSavingTB ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        </button>
                    ) : tbSaved ? (
                        <span className="text-[10px] font-bold text-green-600 animate-pulse bg-green-50 px-2 py-1 rounded">Saved!</span>
                    ) : (
                        <div className="w-[26px]" /> // Spacer
                    )}
                </div>
            </div>
        </div>
    )
}
