import prisma from "@/lib/prisma"
import { Trophy, Star, Shield, TrendingUp, Medal } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function PublicHallOfFamePage() {
    try {
        const entries = await prisma.hallOfFame.findMany({
            orderBy: { year: "desc" },
        })

        const defendingChamp = entries[0]
        const historicalEntries = entries.slice(1)

        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* Hero Header */}
                <div className="bg-brand-blue py-16 md:py-24 relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full -ml-24 -mb-24 blur-3xl"></div>

                    <div className="container mx-auto px-4 text-center relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full border border-white/20 backdrop-blur-md">
                            <Trophy className="w-5 h-5 text-brand-orange" />
                            <span className="text-sm font-black uppercase tracking-[0.2em] italic">Tournament Legacy</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
                            Hall of <span className="text-brand-orange">Fame</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-white/70 font-medium">
                            Honoring the legends who navigated the madness and emerged victorious.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 -mt-12 pb-24 relative z-20 space-y-12">
                    {/* Defending Champion Highlight */}
                    {defendingChamp && (
                        <div className="bg-white rounded-[2rem] shadow-2xl border-4 border-brand-orange overflow-hidden max-w-4xl mx-auto transform hover:scale-[1.01] transition-transform duration-300">
                            <div className="bg-brand-orange px-8 py-3 flex justify-between items-center text-white">
                                <span className="text-sm font-black uppercase tracking-widest italic">Defending Champion</span>
                                <div className="flex gap-1">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                            </div>
                            <div className="p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <div className="text-6xl font-black text-brand-blue italic tracking-tighter">{defendingChamp.year}</div>
                                        <h2 className="text-4xl font-black uppercase text-gray-900 leading-tight">{defendingChamp.winnerName}</h2>
                                        {defendingChamp.groupName && (
                                            <div className="inline-flex items-center gap-2 text-gray-400 font-bold uppercase text-xs tracking-widest">
                                                <Shield className="w-3 h-3" /> {defendingChamp.groupName}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-8">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Winning Team</div>
                                            <div className="font-black text-brand-orange uppercase text-xl italic">{defendingChamp.winningTeam}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Points</div>
                                            <div className="font-black text-gray-900 text-xl italic">{defendingChamp.totalPoints}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center md:justify-end">
                                    <div className="relative">
                                        <Trophy className="w-48 h-48 md:w-64 md:h-64 text-brand-orange/10 absolute -top-8 -right-8 -rotate-12" />
                                        <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-50 rounded-full flex items-center justify-center border-8 border-white shadow-inner relative z-10">
                                            <Medal className="w-24 h-24 md:w-32 md:h-32 text-brand-orange drop-shadow-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* historical list */}
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h3 className="text-xl font-black uppercase italic tracking-tight text-gray-400 px-4">Historical Archive</h3>
                        <div className="grid gap-4">
                            {historicalEntries.map((entry) => (
                                <div key={entry.id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-6">
                                        <div className="text-4xl font-black text-brand-blue/30 italic tracking-tighter w-24">{entry.year}</div>
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black uppercase text-gray-900">{entry.winnerName}</h4>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                                                <span className="text-sm font-bold text-brand-orange uppercase italic">{entry.winningTeam}</span>
                                                {entry.groupName && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-200 pl-4">{entry.groupName}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Score</div>
                                            <div className="font-black text-xl text-gray-900 italic leading-none">{entry.totalPoints}</div>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-xl text-gray-300">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {entries.length === 0 && (
                            <div className="bg-white rounded-2xl p-24 text-center border border-dashed border-gray-200">
                                <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest">No legends recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    } catch (error: any) {
        console.error("Hall of Fame Error:", error)
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-100 text-brand-orange rounded-full flex items-center justify-center mx-auto">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase italic">Historical Data Error</h2>
                    <p className="text-gray-500 text-sm">
                        Issue detected: {error?.message || "Internal Exception"}
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg text-left overflow-auto max-h-32 shadow-inner border border-orange-50">
                        <code className="text-[10px] text-red-500 font-mono">
                            {error?.stack?.split('\n').slice(0, 3).join('\n') || "No trace available"}
                        </code>
                    </div>
                </div>
            </div>
        )
    }
}
