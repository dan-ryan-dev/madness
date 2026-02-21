import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { BigBoard } from "@/components/draft/BigBoard"
import { DraftHeader } from "@/components/draft/DraftHeader"
import { DraftOrderSidebar } from "@/components/draft/DraftOrderSidebar"
import { RosterTray } from "@/components/draft/RosterTray"
import { getCurrentPicker } from "@/lib/draft-logic"
import { TieBreakerModal } from "@/components/draft/TieBreakerModal"

export const dynamic = 'force-dynamic' // Ensure we get fresh data every time

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/api/auth/signin")

    const { id } = await params

    // 1. Get Group Context
    const group = await prisma.group.findUnique({
        where: { id },
        include: { memberships: { include: { user: true } } }
    })

    if (!group) return <div className="p-8 text-center text-red-500">Group not found.</div>

    // 2. Fetch Data
    const [teams, picks, tournament] = await Promise.all([
        prisma.team.findMany({
            where: { tournamentId: group.tournamentId },
            orderBy: [{ name: 'asc' }],
        }),
        prisma.draftPick.findMany({
            where: { groupId: group.id },
            include: { team: true }, // Include team for Tray
            orderBy: [{ round: 'asc' }, { pickNumber: 'asc' }],
        }),
        prisma.tournament.findUnique({ where: { id: group.tournamentId } }),
    ])

    // 3. Calc State
    const takenTeamIds = picks.map(p => p.teamId)
    const myPicks = picks.filter(p => p.userId === session.user?.id)
    const myMembership = group.memberships.find(m => m.userId === session.user?.id)

    // Create Roster Map for Tray
    const rosterMap = new Map<string, any[]>()
    picks.forEach(pick => {
        if (!rosterMap.has(pick.userId)) {
            rosterMap.set(pick.userId, [])
        }
        rosterMap.get(pick.userId)?.push(pick)
    })

    /* 
    const myTeamsPoints = picks
        .filter(p => p.userId === session.user?.id)
        .map(p => teams.find(t => t.id === p.teamId))
        .filter(Boolean) as any[]
    */

    const currentPickNumberGlobal = picks.length + 1

    // Sort members by draftPosition (1-based), default to 999 if null/0, fallback to joinedAt
    const sortedMembers = group.memberships.sort((a: any, b: any) => {
        const posA = a.draftPosition || 999
        const posB = b.draftPosition || 999
        if (posA !== posB) return posA - posB
        // Safe date comparison: handles both Date objects and numeric timestamps
        const timeA = a.joinedAt instanceof Date ? a.joinedAt.getTime() : Number(a.joinedAt)
        const timeB = b.joinedAt instanceof Date ? b.joinedAt.getTime() : Number(b.joinedAt)
        return timeA - timeB
    })

    // If draft is complete (e.g. 64 picks), show generic "Draft Complete" message or redirect?
    // For now, let the UI handle it (BigBoard might show "Draft Complete").

    // We need to gracefully handle > 64 picks if accessing this page after completion.
    // Logic: If picks.length >= 64, redirect to dashboard?
    if (picks.length >= 64) {
        redirect(`/groups/${group.id}/dashboard`)
    }

    const pickerIndex = getCurrentPicker(currentPickNumberGlobal, sortedMembers.length)
    const currentMember = sortedMembers[pickerIndex]

    // Access user from member
    const currentPicker = currentMember?.user
    const isMyTurn = currentPicker?.id === session.user.id

    // Admin Check
    const isAdmin = group.adminId === session.user.id || session.user.role === 'SUPER_ADMIN'

    // Calculate current round
    const currentRound = Math.floor((currentPickNumberGlobal - 1) / sortedMembers.length) + 1

    const currentMemberPicks = picks.filter(p => p.userId === currentMember?.userId)

    return (
        <div className="min-h-screen bg-gray-50 pb-32"> {/* Added padding-bottom for Tray */}
            {/* 1. Header with Stats */}
            <DraftHeader
                currentPicker={currentPicker}
                pickNumber={currentPickNumberGlobal}
                isAdmin={isAdmin}
                groupId={group.id}
            />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* 2. Left Sidebar (Draft Order) */}
                    <div className="lg:w-80 flex-shrink-0">
                        <DraftOrderSidebar
                            members={sortedMembers}
                            currentPickerId={currentPicker?.id}
                            currentRound={currentRound}
                            totalPlayers={sortedMembers.length}
                            isAdmin={isAdmin}
                        />
                    </div>

                    {/* 3. Main Draft Board (Right) */}
                    <div className="flex-1">
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
                            isAdmin={isAdmin}
                            groupId={group.id}
                        />
                    </div>
                </div>
            </div>

            {/* 4. Bottom Tray (Roster Summary) */}
            <RosterTray
                members={sortedMembers}
                rosterMap={rosterMap}
                currentPickerId={currentPicker?.id}
            />

            {/* 5. Tie-Breaker Modal */}
            <TieBreakerModal
                groupId={group.id}
                isOpen={currentMemberPicks.length === 8 && !currentMember?.finalScoreGuess}
                playerName={currentMember?.user?.name || "Player"}
                userId={currentMember?.userId}
            />
        </div>
    )
}
