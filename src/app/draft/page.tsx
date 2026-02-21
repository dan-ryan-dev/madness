import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ensureDemoGroup } from "@/app/actions/draft"
import { BigBoard } from "@/components/draft/BigBoard"
import { DraftHeader } from "@/components/draft/DraftHeader"
import { RosterSidebar } from "@/components/draft/RosterSidebar"
import { getCurrentPicker } from "@/lib/draft-logic"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic' // Ensure we get fresh data every time

export default async function DraftPage() {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    // 1. Get Group Context
    // In a real app, we'd grab this from the URL or user's active group
    // For MVP, we auto-create/find the "Demo Group"
    const group = await ensureDemoGroup()
    if (!group) return <div>Failed to load group.</div>

    // 2. Fetch Data
    const [teams, picks, tournament] = await Promise.all([
        prisma.team.findMany({
            where: { tournamentId: group.tournamentId },
            orderBy: [{ region: 'asc' }, { seed: 'asc' }],
        }),
        prisma.draftPick.findMany({
            where: { groupId: group.id },
            orderBy: [{ round: 'asc' }, { pickNumber: 'asc' }],
        }),
        prisma.tournament.findUnique({ where: { id: group.tournamentId } }),
    ])

    // 3. Calc State
    const takenTeamIds = picks.map(p => p.teamId)
    const myTeamsPoints = picks
        .filter(p => p.userId === session.user?.id)
        .map(p => teams.find(t => t.id === p.teamId))
        .filter(Boolean) as any[]

    const currentPickNumberGlobal = picks.length + 1

    // Sort members by joinedAt
    const sortedMembers = group.memberships.sort((a: any, b: any) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime())

    const pickerIndex = getCurrentPicker(currentPickNumberGlobal, sortedMembers.length)
    const currentMember = sortedMembers[pickerIndex]

    // Access user from member
    const currentPicker = currentMember?.user
    const isMyTurn = currentPicker?.id === session.user.id

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 1. Header with Stats */}
            <DraftHeader
                currentPicker={currentPicker}
                pickNumber={currentPickNumberGlobal}
            />

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 2. Main Draft Board (Left/Center) */}
                    <div className="lg:col-span-9">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Available Teams</h2>
                            <div className="text-sm text-gray-500">
                                {teams.length - takenTeamIds.length} Teams Remaining
                            </div>
                        </div>

                        <BigBoard
                            teams={teams}
                            takenTeamIds={takenTeamIds}
                            isMyTurn={isMyTurn}
                            isAdmin={false}
                            groupId={group.id}
                        />
                    </div>

                    {/* 3. Sidebar (Right) */}
                    <div className="lg:col-span-3">
                        <RosterSidebar myTeams={myTeamsPoints} />
                    </div>
                </div>
            </div>
        </div>
    )
}
