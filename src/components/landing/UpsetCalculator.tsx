"use client"

import { useState, useMemo } from "react"
import { getSeedBracket, ROUND_POINTS } from "@/lib/scoring"
import { Calculator, ArrowRight, Zap } from "lucide-react"

export function UpsetCalculator() {
    const [winnerSeed, setWinnerSeed] = useState(14)
    const [loserSeed, setLoserSeed] = useState(3)
    const [round, setRound] = useState(1)

    const result = useMemo(() => {
        const winnerBracket = getSeedBracket(winnerSeed)
        const loserBracket = getSeedBracket(loserSeed)
        const basePoints = ROUND_POINTS[round] || 0
        const bonus = winnerBracket > loserBracket ? (winnerBracket - loserBracket) : 0

        return {
            basePoints,
            bonus,
            total: basePoints + bonus,
            winnerBracket,
            loserBracket
        }
    }, [winnerSeed, loserSeed, round])

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl mx-auto">
            <div className="bg-brand-blue p-6 text-white flex items-center gap-3">
                <Calculator className="w-6 h-6 text-brand-orange" />
                <h3 className="text-xl font-bold">Interactive Upset Calculator</h3>
            </div>

            <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Winner Seed Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Winner Seed
                        </label>
                        <select
                            value={winnerSeed}
                            onChange={(e) => setWinnerSeed(Number(e.target.value))}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:outline-none font-bold"
                        >
                            {Array.from({ length: 16 }, (_, i) => i + 1).map(s => (
                                <option key={s} value={s}>Seed #{s}</option>
                            ))}
                        </select>
                        <div className="text-xs text-gray-500 font-medium italic">
                            Bracket {result.winnerBracket}
                        </div>
                    </div>

                    {/* Round Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Tournament Round
                        </label>
                        <select
                            value={round}
                            onChange={(e) => setRound(Number(e.target.value))}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:outline-none font-bold"
                        >
                            <option value={1}>Round of 64</option>
                            <option value={2}>Round of 32</option>
                            <option value={3}>Sweet 16</option>
                            <option value={4}>Elite 8</option>
                            <option value={5}>Final Four</option>
                            <option value={6}>Championship</option>
                        </select>
                    </div>

                    {/* Loser Seed Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                            Loser Seed
                        </label>
                        <select
                            value={loserSeed}
                            onChange={(e) => setLoserSeed(Number(e.target.value))}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-orange focus:outline-none font-bold"
                        >
                            {Array.from({ length: 16 }, (_, i) => i + 1).map(s => (
                                <option key={s} value={s}>Seed #{s}</option>
                            ))}
                        </select>
                        <div className="text-xs text-gray-500 font-medium italic">
                            Bracket {result.loserBracket}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-xs font-bold text-gray-400 uppercase">Base</div>
                            <div className="text-2xl font-black text-brand-dark">{result.basePoints}</div>
                        </div>
                        <div className="text-xl font-bold text-gray-300">+</div>
                        <div className="text-center">
                            <div className="text-xs font-bold text-brand-orange uppercase">Bonus</div>
                            <div className="text-2xl font-black text-brand-orange">{result.bonus}</div>
                        </div>
                    </div>

                    <ArrowRight className="hidden md:block w-8 h-8 text-gray-200" />

                    <div className="text-center bg-brand-blue text-white px-8 py-3 rounded-xl shadow-lg transform scale-110">
                        <div className="text-xs font-bold uppercase opacity-80">Total Points</div>
                        <div className="text-4xl font-black">{result.total}</div>
                    </div>
                </div>

                {result.bonus > 0 && (
                    <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-lg border border-orange-100 text-orange-800 text-sm">
                        <Zap className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-bold">Upset Alert!</span> Because a Bracket {result.winnerBracket} team beat a Bracket {result.loserBracket} team, you earned a <span className="underline decoration-2 underline-offset-4">+{result.bonus} point bonus</span>.
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
