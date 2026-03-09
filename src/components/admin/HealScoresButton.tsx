"use client"

import { useState, useTransition } from "react"
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { recalculateTournamentScores } from "@/app/actions/admin"

interface HealScoresButtonProps {
    tournamentId: string
}

export function HealScoresButton({ tournamentId }: HealScoresButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    const handleHeal = () => {
        if (!confirm("This will recalculate EVERY player score in this tournament based on current game results. Use this to fix any scoring anomalies. This cannot be undone. Proceed?")) {
            return
        }

        startTransition(async () => {
            const res = await recalculateTournamentScores(tournamentId)
            setResult(res)

            // Auto-clear message after 5 seconds if successful
            if (res.success) {
                setTimeout(() => setResult(null), 5000)
            }
        })
    }

    return (
        <div className="space-y-4">
            <button
                onClick={handleHeal}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-brand-orange/10 text-brand-orange px-6 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-brand-orange/20 transition-all border-2 border-dashed border-brand-orange/30 disabled:opacity-50"
            >
                {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Sparkles className="w-5 h-5" />
                )}
                {isPending ? "Recalculating..." : "Heal Tournament Scores"}
            </button>

            {result && (
                <div className={`p-4 rounded-xl flex items-start gap-3 border ${result.success
                        ? "bg-green-50 border-green-100 text-green-800"
                        : "bg-red-50 border-red-100 text-red-800"
                    }`}>
                    {result.success ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <p className="text-sm font-bold">{result.message}</p>
                </div>
            )}
        </div>
    )
}
