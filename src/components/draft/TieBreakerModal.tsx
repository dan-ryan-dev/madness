"use client"

import { useState } from "react"
import { Trophy, Target, Star, Loader2 } from "lucide-react"
import { saveTieBreaker } from "@/app/actions/group"

interface TieBreakerModalProps {
    groupId: string
    isOpen: boolean
    playerName: string
    userId?: string // The user ID we are saving for
}

const COMMON_TEAMS = [
    "Duke", "Kentucky", "Kansas", "North Carolina", "UConn", "Purdue", "Houston", "Arizona",
    "Gonzaga", "Tennessee", "Auburn", "Alabama", "Illinois", "Wisconsin", "Michigan State",
    "Virginia", "Villanova", "St. John's", "Wake Forest", "Providence", "Indiana", "Ohio State",
    "Memphis", "Florida Atlantic", "San Diego State"
].sort()

export function TieBreakerModal({ groupId, isOpen, playerName, userId }: TieBreakerModalProps) {
    const [score, setScore] = useState<string>("")
    const [nitWinner, setNitWinner] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isFinished, setIsFinished] = useState(false)

    if (!isOpen || isFinished) return null

    const handleSave = async () => {
        if (!score || !nitWinner) {
            setError("Both predictions are required to finish the entry.")
            return
        }

        const scoreNum = parseInt(score)
        if (isNaN(scoreNum) || scoreNum <= 0) {
            setError("Please enter a valid championship total score.")
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            const result = await saveTieBreaker(groupId, scoreNum, nitWinner, userId)
            if (result.success) {
                setIsFinished(true)
                // The revalidatePath in the action will update the UI
            } else {
                setError(result.message)
            }
        } catch (e) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-4 border-brand-orange animate-in fade-in zoom-in duration-300">
                <div className="bg-brand-orange p-6 text-center text-white relative">
                    <Trophy className="w-12 h-12 mx-auto mb-2 drop-shadow-lg" />
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">
                        Finalize Entry for<br />{playerName}
                    </h2>
                    <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest mt-2">Tie-Breaker Predictions</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-black uppercase text-brand-blue tracking-wider">
                                <Target className="w-4 h-4 text-brand-orange" />
                                Championship Total Score
                            </label>
                            <input
                                type="number"
                                value={score}
                                onChange={(e) => setScore(e.target.value)}
                                placeholder="Combined score (e.g. 145)"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:border-brand-orange focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                            />
                            <p className="text-[10px] text-gray-400 font-medium">Predict the total points scored by both teams in the final.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-black uppercase text-brand-blue tracking-wider">
                                <Star className="w-4 h-4 text-brand-orange" />
                                NIT Winner Prediction
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    list="team-suggestions"
                                    value={nitWinner}
                                    onChange={(e) => setNitWinner(e.target.value)}
                                    placeholder="Search or type a team..."
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:border-brand-orange focus:ring-0 outline-none transition-all placeholder:text-gray-300"
                                />
                                <datalist id="team-suggestions">
                                    {COMMON_TEAMS.map(team => (
                                        <option key={team} value={team} />
                                    ))}
                                </datalist>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">Predict which team will win the NIT tournament.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-brand-blue text-white rounded-2xl py-4 font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-brand-blue/20 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>Lock In Predictions</>
                        )}
                    </button>

                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed px-4">
                        Predictions are final and will be used as the ultimate tie-breaker for group standings.
                    </p>
                </div>
            </div>
        </div>
    )
}
