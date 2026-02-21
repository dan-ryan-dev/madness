import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Plus, Users, LayoutDashboard, PlayCircle, Settings } from "lucide-react"
import Link from "next/link"
import { TournamentFilter } from "@/components/admin/TournamentFilter"

export const dynamic = "force-dynamic"

export default async function AdminGroupsPage({ searchParams }: { searchParams: Promise<{ tournamentId?: string }> }) {
    const session = await auth()
    const { tournamentId } = await searchParams

    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    // Fetch Tournaments for Filter
    const tournaments = await prisma.tournament.findMany({
        orderBy: { createdAt: 'desc' }
    })

    const activeTournamentId = tournamentId || tournaments[0]?.id

    const groups = await prisma.group.findMany({
        where: {
            ...(activeTournamentId && activeTournamentId !== 'all' ? { tournamentId: activeTournamentId } : {}),
            ...(session.user.role === "GROUP_ADMIN" ? { adminId: session.user.id } : {})
        },
        include: {
            _count: {
                select: {
                    memberships: true,
                    draftPicks: true
                }
            },
            admin: true,
            tournament: true // Include tournament details
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="w-8 h-8 text-brand-blue" />
                    Groups
                </h1>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Tournament Filter */}
                    {/* Tournament Filter */}
                    <div className="flex-1 md:w-64">
                        <TournamentFilter tournaments={tournaments} />
                    </div>

                    <Link
                        href="/admin/groups/new"
                        className="bg-brand-orange text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Create Group
                    </Link>
                </div>
            </div>

            {/* Filter Component Placeholder - We'll just put links for now or use the client component below */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                <Link
                    href="/admin/groups?tournamentId=all"
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${activeTournamentId === 'all' ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                    All Tournaments
                </Link>
                {tournaments.map(t => (
                    <Link
                        key={t.id}
                        href={`/admin/groups?tournamentId=${t.id}`}
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${activeTournamentId === t.id ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                        {t.name}
                    </Link>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Group Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Tournament</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Admin</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Members</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {groups.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No groups found matching criteria.
                                </td>
                            </tr>
                        ) : (
                            groups.map((group) => {
                                const totalSlots = group._count.memberships * 8
                                const picksMade = group._count.draftPicks
                                const isDraftComplete = picksMade >= totalSlots && totalSlots > 0
                                const isDraftStarted = picksMade > 0

                                return (
                                    <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <Link href={`/groups/${group.id}/dashboard`} className="hover:text-brand-blue flex items-center gap-2">
                                                <LayoutDashboard className="w-4 h-4 text-gray-400" />
                                                {group.name}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {group.tournament.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {group.admin?.name || group.admin?.email}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                                                {group._count.memberships}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {isDraftComplete ? (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                                    Complete
                                                </span>
                                            ) : isDraftStarted ? (
                                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                                                    In Progress ({picksMade}/{totalSlots})
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
                                                    Not Started
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {/* Edit Action */}
                                                <Link
                                                    href={`/admin/groups/${group.id}/edit`}
                                                    className="p-2 text-gray-500 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Group"
                                                >
                                                    <Settings className="w-5 h-5" />
                                                </Link>

                                                {/* View Board Action */}
                                                <Link
                                                    href={isDraftComplete ? `/groups/${group.id}/dashboard` : `/groups/${group.id}/draft`}
                                                    className="p-2 text-gray-500 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-colors"
                                                    title={isDraftComplete ? "View Dashboard" : "Enter War Room"}
                                                >
                                                    {isDraftComplete ? <LayoutDashboard className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
