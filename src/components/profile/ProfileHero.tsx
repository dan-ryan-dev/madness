"use client"

import { useState } from "react"
import { Trophy, Target, TrendingUp, Settings } from "lucide-react"
import { ProfileSettingsModal } from "./ProfileSettingsModal"

interface ProfileHeroProps {
    userName: string
    totalPoints: number
    globalRank: number
    teamsAlive: number
    totalTeams: number
}

export function ProfileHero({ userName, totalPoints, globalRank, teamsAlive, totalTeams }: ProfileHeroProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <div className="bg-brand-blue rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                {/* Background patterns */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>

                <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                                <TrendingUp className="w-4 h-4 text-brand-orange" />
                                <span className="text-xs font-bold uppercase tracking-widest">Active Tournament: Madness 2026</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
                                {userName}
                            </h1>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="self-start md:self-center flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
                            <Settings className="w-5 h-5" />
                            Profile Settings
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                        <StatBox
                            icon={<Trophy className="w-5 h-5" />}
                            label="Total Points"
                            value={totalPoints}
                            highlight
                        />
                        <StatBox
                            icon={<Target className="w-5 h-5" />}
                            label="Global Rank"
                            value={`#${globalRank}`}
                        />
                        <StatBox
                            icon={<div className="w-5 h-5 font-black text-xs">8/8</div>}
                            label="Survival"
                            value={`${teamsAlive}/${totalTeams}`}
                            subValue="Teams Alive"
                        />
                    </div>
                </div>
            </div>

            <ProfileSettingsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentName={userName}
            />
        </>
    )
}

function StatBox({ icon, label, value, subValue, highlight }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                {icon}
                {label}
            </div>
            <div className="flex items-baseline gap-2">
                <div className={`text-4xl font-black italic ${highlight ? 'text-brand-orange' : 'text-white'}`}>
                    {value}
                </div>
                {subValue && <span className="text-xs font-bold text-white/40 uppercase">{subValue}</span>}
            </div>
        </div>
    )
}
