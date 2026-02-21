import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { ArrowLeft, Settings } from "lucide-react"
import { RecentTicker } from "@/components/dashboard/RecentTicker"
import { LeaderboardCard } from "@/components/dashboard/LeaderboardCard"
import { GroupSelector } from "@/components/dashboard/GroupSelector"

import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function GroupDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    const { id } = await params
    const group = await prisma.group.findUnique({
        where: { id },
        include: {
            memberships: {
                include: { user: true },
                orderBy: { score: 'desc' }
            },
            draftPicks: {
                include: { team: true },
            },
            tournament: {
                include: {
                    gameResults: {
                        take: 10,
                        orderBy: { createdAt: 'desc' },
                        include: { winner: true, loser: true }
                    },
                    groups: {
                        select: { id: true, name: true }
                    }
                }
            }
        }
    })

    if (!group) return <div className="p-8 text-center text-red-500">Group not found.</div>

    // Calculate Member Stats (Teams Alive)
    const memberStats = group.memberships.map((member, index) => {
        const memberPicks = group.draftPicks.filter(p => p.userId === member.userId)
        const teamsAlive = memberPicks.filter(p => !p.team.isEliminated).length
        return {
            ...member,
            teamsAlive,
            totalTeams: memberPicks.length,
            rank: index + 1,
            finalScoreGuess: member.finalScoreGuess,
            nitWinnerGuess: member.nitWinnerGuess
        }
    }).sort((a, b) => { // Secondary sort by teams alive if scores tied
        if (b.score !== a.score) return b.score - a.score
        return b.teamsAlive - a.teamsAlive
    }).map((m, i) => ({ ...m, rank: i + 1 }))

    // Roster Map for Grid View
    const rosterMap = new Map<string, typeof group.draftPicks>()
    group.draftPicks.forEach(pick => {
        if (!rosterMap.has(pick.userId)) rosterMap.set(pick.userId, [])
        rosterMap.get(pick.userId)?.push(pick)
    })

    const isGroupAdmin = session.user.id === group.adminId

    return (
        <div className="min-h-screen bg-[#F3F4F6] relative font-sans">
            {/* Background Blob for aesthetic */}
            <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-blue to-[#F3F4F6] z-0 opacity-10 pointer-events-none"></div>

            {/* Ticker */}
            <div className="sticky top-0 z-50 shadow-md">
                <RecentTicker results={group.tournament.gameResults} />
            </div>

            <div className="relative z-10 pb-12">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-[53px] z-40">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/groups" className="text-gray-400 hover:text-gray-700 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>

                            {/* Group Selector */}
                            <GroupSelector
                                groups={group.tournament.groups}
                                currentGroupId={group.id}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            {isGroupAdmin && (
                                <Link
                                    href={`/admin/groups/${group.id}/edit`}
                                    className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-full transition-all"
                                >
                                    <Settings className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-8 space-y-8">
                    {/* Live Standings at the top */}
                    <div className="max-w-4xl mx-auto">
                        <LeaderboardCard members={memberStats} />
                    </div>

                    {/* Main Content: Rosters */}
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="grid gap-6 md:grid-cols-2">
                            {[...memberStats].sort((a, b) => a.draftPosition - b.draftPosition).map((member) => {
                                const picks = rosterMap.get(member.userId) || []
                                picks.sort((a, b) => (a.round - b.round) || (a.pickNumber - b.pickNumber))
                                const isMe = member.userId === session.user.id

                                return (
                                    <div
                                        key={member.id}
                                        className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${isMe ? 'border-brand-blue/30 ring-4 ring-brand-blue/5' : 'border-gray-200'}`}
                                    >
                                        <div className={`px-5 py-3 border-b flex justify-between items-center ${isMe ? 'bg-brand-blue/5 border-brand-blue/10' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-gray-400 leading-none mb-0.5">Draft Order</span>
                                                    <span className={`font-bold text-sm w-8 h-6 flex items-center justify-center rounded bg-white border text-gray-500 shadow-sm`}>
                                                        {member.draftPosition}
                                                    </span>
                                                </div>
                                                <h3 className={`font-bold truncate max-w-[140px] ${isMe ? 'text-brand-blue' : 'text-gray-900'}`}>
                                                    {member.user.name}
                                                </h3>
                                            </div>
                                            <span className="font-mono font-bold text-lg text-gray-900">{member.score}</span>
                                        </div>

                                        <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                                            {picks.map((pick) => (
                                                <div key={pick.id} className={`px-5 py-2.5 flex items-center justify-between text-sm ${pick.team.isEliminated ? 'opacity-40 bg-gray-50 grayscale' : 'hover:bg-gray-50'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-mono text-gray-400 w-4">R{pick.round}</span>
                                                        <div>
                                                            <div className="font-bold text-gray-900 leading-tight">
                                                                {pick.team.name}
                                                            </div>
                                                            <div className="text-[10px] text-gray-400">
                                                                #{pick.team.seed} {pick.team.region}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Status Dot */}
                                                    {!pick.team.isEliminated && (
                                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
