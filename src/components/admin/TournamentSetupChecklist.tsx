"use client"

import { CheckCircle2, Circle, ArrowRight, Trophy, Users, Layout, Play } from "lucide-react"
import Link from "next/link"

interface SetupStep {
    id: string
    title: string
    description: string
    href: string
    status: 'pending' | 'complete'
    icon: any
}

interface Props {
    tournamentId: string
    stats: {
        teamCount: number
        groupCount: number
        managerCount: number
        status: string
    }
}

export function TournamentSetupChecklist({ tournamentId, stats }: Props) {
    const steps: SetupStep[] = [
        {
            id: 'structure',
            title: 'Tournament Structure',
            description: 'Define name, year, and status.',
            href: `/admin/tournaments/${tournamentId}/edit`,
            status: stats.status !== 'SETUP' ? 'complete' : 'complete', // Structure is defined if we are here
            icon: Trophy
        },
        {
            id: 'teams',
            title: 'Import Teams',
            description: 'Import the 64 bracket teams.',
            href: stats.teamCount > 0 ? `/admin/tournaments/${tournamentId}/teams` : `/admin/tournaments/${tournamentId}/import`,
            status: stats.teamCount >= 64 ? 'complete' : 'pending',
            icon: Layout
        },
        {
            id: 'managers',
            title: 'Invite Managers',
            description: 'Bulk invite your 15 group admins.',
            href: `/admin/tournaments/${tournamentId}/managers`,
            status: stats.managerCount >= 10 ? 'complete' : 'pending',
            icon: Users
        },
        {
            id: 'groups',
            title: 'Create Groups',
            description: 'Initialize and assign groups to managers.',
            href: `/admin/groups/new?tournamentId=${tournamentId}`,
            status: stats.groupCount >= stats.managerCount && stats.groupCount > 0 ? 'complete' : 'pending',
            icon: Play
        }
    ]

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Pre-Draft Setup Checklist</h3>
                    <p className="text-sm text-gray-500">Complete these steps to ensure a smooth draft day.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-brand-orange">Progress</p>
                    <p className="text-lg font-bold text-brand-blue">
                        {steps.filter(s => s.status === 'complete').length} / {steps.length}
                    </p>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {steps.map((step) => (
                    <Link
                        key={step.id}
                        href={step.href}
                        className="p-5 flex items-center justify-between hover:bg-brand-blue/[0.02] transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${step.status === 'complete' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue'} transition-colors`}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className={`font-bold text-sm ${step.status === 'complete' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                    {step.title}
                                </h4>
                                <p className="text-xs text-gray-500">{step.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {step.status === 'complete' ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand-blue transition-all group-hover:translate-x-1" />
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* Final Action */}
            {steps.every(s => s.status === 'complete') && stats.status === 'SETUP' && (
                <div className="p-6 bg-brand-orange/5 border-t border-brand-orange/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-brand-orange text-white rounded-full">
                            <Play className="w-4 h-4 fill-current" />
                        </div>
                        <p className="text-sm font-bold text-brand-orange">Ready to go live!</p>
                    </div>
                    <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                        All pre-setup tasks are complete. Switch the tournament status to <strong>LIVE</strong> to allow players to see their dashboards and prepare for the draft.
                    </p>
                </div>
            )}
        </section>
    )
}
