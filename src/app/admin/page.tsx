import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Users, AlertCircle, CheckCircle, Settings, ArrowRight, Trophy } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ tournamentId?: string }> }) {
    const session = await auth()
    const { tournamentId } = await searchParams

    // Auth Check
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    // Fetch Tournaments for Filter
    const tournaments = await prisma.tournament.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { teams: true }
            }
        }
    })

    const activeTournamentId = tournamentId || tournaments[0]?.id

    // Fetch Admin's Groups
    const groups = await prisma.group.findMany({
        where: {
            ...(activeTournamentId && activeTournamentId !== 'all' ? { tournamentId: activeTournamentId } : {}),
            ...(session.user.role === "GROUP_ADMIN" ? { adminId: session.user.id } : {})
        },
        include: {
            memberships: true,
            _count: {
                select: { draftPicks: true }
            },
            tournament: true // Include tournament details
        },
        orderBy: { createdAt: 'desc' }
    })

    const isSuperAdmin = session.user.role === "SUPER_ADMIN"

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-brand-blue">Admin Dashboard</h1>
                <div className="flex items-center gap-2">
                    {isSuperAdmin && (
                        <Link href="/admin/tournaments/new" className="bg-brand-orange text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors whitespace-nowrap">
                            Create Tournament
                        </Link>
                    )}
                </div>
            </div>

            <section className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                    <Link href="/admin/tournaments" className="group">
                        <h2 className="text-xl font-semibold text-brand-dark group-hover:text-brand-blue transition-colors flex items-center gap-2">
                            Tournaments
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h2>
                    </Link>
                </div>

                {tournaments.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center space-y-4">
                        <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-gray-300" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-gray-900">No 2026 Tournament Found</p>
                            <p className="text-sm text-gray-500">Click 'Initialize' to start your first tournament.</p>
                        </div>
                        {isSuperAdmin && (
                            <Link href="/admin/tournaments/new" className="inline-block bg-brand-orange text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors">
                                Initialize
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tournaments.map((tournament) => (
                            <div key={tournament.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-900">{tournament.name}</h3>
                                    <p className="text-sm text-gray-500">Status: {tournament.status} • Year: {tournament.year}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/admin/tournaments/${tournament.id}/edit`} className="text-sm border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 text-gray-700">
                                        Edit
                                    </Link>
                                    <Link
                                        href={tournament._count?.teams > 0 ? `/admin/tournaments/${tournament.id}/games` : '#'}
                                        className={`text-sm border px-3 py-1.5 rounded transition-colors ${tournament._count?.teams > 0
                                            ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : 'border-gray-200 text-gray-300 cursor-not-allowed hidden'
                                            }`}
                                    >
                                        Manage Games
                                    </Link>
                                    <Link
                                        href={tournament._count?.teams > 0 ? `/admin/tournaments/${tournament.id}/teams` : `/admin/tournaments/${tournament.id}/import`}
                                        className={`text-sm border px-3 py-1.5 rounded transition-colors ${tournament._count?.teams > 0
                                            ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                            : 'border-brand-orange text-brand-orange hover:bg-orange-50'
                                            }`}
                                    >
                                        {tournament._count?.teams > 0 ? "View Teams" : "Import Teams"}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {isSuperAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <section className="bg-brand-blue/5 border-2 border-brand-blue/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-brand-blue text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                                <Trophy className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase italic tracking-tight text-brand-blue">Hall of Fame</h2>
                                <p className="text-sm text-gray-500 font-medium">Manage historical records.</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/hall-of-fame"
                            className="bg-brand-blue text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                        >
                            Manage <ArrowRight className="w-4 h-4" />
                        </Link>
                    </section>

                    <section className="bg-purple-50 border-2 border-purple-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase italic tracking-tight text-purple-700">User Control</h2>
                                <p className="text-sm text-gray-500 font-medium">Manage global roles & perms.</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/users"
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-purple-700 transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                        >
                            Manage <ArrowRight className="w-4 h-4" />
                        </Link>
                    </section>
                </div>
            )}

            <section className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-2 gap-4">
                    <Link href="/admin/groups" className="group">
                        <h2 className="text-xl font-semibold text-brand-dark group-hover:text-brand-blue transition-colors flex items-center gap-2">
                            Groups
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h2>
                    </Link>

                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <Link
                            href="/admin?tournamentId=all"
                            className={`px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap ${activeTournamentId === 'all' ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            All
                        </Link>
                        {tournaments.map(t => (
                            <Link
                                key={t.id}
                                href={`/admin?tournamentId=${t.id}`}
                                className={`px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap ${activeTournamentId === t.id ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                            >
                                {t.name}
                            </Link>
                        ))}

                        <div className="ml-auto md:ml-2">
                            <Link href="/admin/groups/new" className="text-sm bg-brand-orange text-white px-3 py-1 rounded hover:bg-orange-600 flex items-center gap-2 whitespace-nowrap">
                                + New Group
                            </Link>
                        </div>
                    </div>
                </div>

                {groups.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
                        <p className="mb-4">No groups found. Create one to get started.</p>
                        <Link href="/admin/groups/new" className="text-brand-blue hover:underline">Create First Group</Link>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group) => {
                            const memberCount = group.memberships.length
                            const pickCount = group._count.draftPicks
                            // Assuming 64 picks for full draft
                            const isDraftComplete = pickCount >= 64

                            return (
                                <div key={group.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-brand-blue transition-colors relative">
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Link href={`/admin/groups/${group.id}/edit`} className="p-1 text-gray-400 hover:text-gray-600">
                                            <Settings className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    <div className="mb-4">
                                        <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">
                                            {group.tournament.name}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 truncate pr-6" title={group.name}>{group.name}</h3>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 flex items-center gap-1">
                                                <Users className="w-4 h-4" /> Members
                                            </span>
                                            <span className="font-medium text-gray-900">{memberCount}/8</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Draft Status</span>
                                            <span className={`font-medium ${isDraftComplete ? 'text-green-600' : 'text-orange-600'}`}>
                                                {isDraftComplete ? "Complete" : "Active"}
                                            </span>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                            <div
                                                className={`h-1.5 rounded-full ${isDraftComplete ? 'bg-green-500' : 'bg-brand-orange'}`}
                                                style={{ width: `${Math.min(100, (pickCount / 64) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <Link
                                        href={isDraftComplete ? `/groups/${group.id}/dashboard` : `/groups/${group.id}/draft`}
                                        className={`block w-full text-center py-2 rounded-md font-medium transition-colors ${isDraftComplete
                                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                            : 'bg-brand-blue text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {isDraftComplete ? "View Dashboard" : "Enter Draft Room"}
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
