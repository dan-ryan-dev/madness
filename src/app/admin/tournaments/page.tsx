import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Plus, Trophy, ArrowLeft, Settings, Users } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminTournamentsPage() {
    const session = await auth()

    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const tournaments = await prisma.tournament.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    teams: true,
                    groups: true
                }
            }
        }
    })

    const isSuperAdmin = session.user.role === "SUPER_ADMIN"

    return (
        <div className="container mx-auto py-8">
            <Link href="/admin" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-brand-orange" />
                    Tournaments
                </h1>
                {isSuperAdmin && (
                    <Link
                        href="/admin/tournaments/new"
                        className="bg-brand-orange text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Tournament
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-700">Tournament Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Year</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Status</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Teams</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-center">Groups</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tournaments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-gray-500 font-medium">No 2026 Tournament Found</p>
                                        <Link href="/admin/tournaments/new" className="text-brand-orange font-bold hover:underline">
                                            Click 'Initialize' to start
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            tournaments.map((tournament) => (
                                <tr key={tournament.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {tournament.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {tournament.year}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${tournament.status === 'LIVE' ? 'bg-green-100 text-green-800' :
                                            tournament.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                                tournament.status === 'DRAFTING' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {tournament.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600">
                                        {tournament._count.teams}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600">
                                        {tournament._count.groups}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Link
                                                href={`/admin/tournaments/${tournament.id}/edit`}
                                                className="p-2 text-gray-500 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Settings"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={tournament._count.teams > 0 ? `/admin/tournaments/${tournament.id}/teams` : `/admin/tournaments/${tournament.id}/import`}
                                                className={`p-2 rounded-lg transition-colors ${tournament._count.teams > 0
                                                    ? 'text-gray-500 hover:text-brand-blue hover:bg-blue-50'
                                                    : 'text-brand-orange hover:bg-orange-50'
                                                    }`}
                                                title={tournament._count.teams > 0 ? "View Teams" : "Import Teams"}
                                            >
                                                <Users className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={tournament._count.teams > 0 ? `/admin/tournaments/${tournament.id}/games` : '#'}
                                                className={`p-2 rounded-lg transition-colors ${tournament._count.teams > 0
                                                    ? 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                                                    : 'text-gray-300 cursor-not-allowed'
                                                    }`}
                                                title="Manage Games"
                                            >
                                                <Trophy className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
