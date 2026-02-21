import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ArrowLeft, Users, Shield, Hash, MapPin, Upload } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { EditableTeamName } from "@/components/admin/EditableTeamName"

export default async function TournamentTeamsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const { id } = await params
    const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: {
            teams: {
                orderBy: [
                    { region: 'asc' },
                    { seed: 'asc' }
                ]
            }
        }
    })

    if (!tournament) {
        return <div className="p-8 text-center text-red-500">Tournament not found</div>
    }

    return (
        <div className="container mx-auto py-8">
            <Link href="/admin" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-brand-orange" />
                        {tournament.name} Teams
                        <span className="text-lg text-gray-400 font-normal">({tournament.teams.length})</span>
                    </h1>
                    <p className="text-gray-500 mt-1">Manage participating teams, seeds, and regions.</p>
                </div>

                <Link
                    href={`/admin/tournaments/${tournament.id}/import`}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                    <Upload className="w-4 h-4" />
                    Import / Re-upload
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {tournament.teams.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Found</h3>
                        <p className="mb-6">This tournament doesn't have any teams yet.</p>
                        <Link
                            href={`/admin/tournaments/${tournament.id}/import`}
                            className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            Import Teams
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700 w-24 text-center">Seed</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Team Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Region</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tournament.teams.map((team) => (
                                <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">
                                            {team.seed}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                                            <EditableTeamName teamId={team.id} initialName={team.name} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            {team.region}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div >
    )
}
