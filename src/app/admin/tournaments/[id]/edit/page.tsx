import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ArrowLeft, Save, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { updateTournament, deleteTournament } from "@/app/actions/tournament"
import { DeleteAdminItem } from "@/components/admin/DeleteAdminItem"
import { TournamentSetupChecklist } from "@/components/admin/TournamentSetupChecklist"

export default async function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    const { id } = await params
    const tournament = await prisma.tournament.findUnique({
        where: { id }
    })

    if (!tournament) {
        return <div className="p-8 text-center text-red-500">Tournament not found</div>
    }

    // Fetch Setup Stats
    const [teamCount, groupCount, managerCount] = await Promise.all([
        prisma.team.count({ where: { tournamentId: id } }),
        prisma.group.count({ where: { tournamentId: id } }),
        prisma.user.count({ where: { role: 'GROUP_ADMIN' } })
    ])

    return (
        <div className="container mx-auto py-8">
            <Link href="/admin" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 font-bold transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                            <div className="p-3 bg-brand-orange/10 rounded-xl">
                                <Trophy className="w-6 h-6 text-brand-orange" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-xl font-black uppercase italic tracking-tight text-brand-blue">Tournament Details</h1>
                                <p className="text-sm text-gray-500 font-medium">Update settings for {tournament.name}</p>
                            </div>
                            <DeleteAdminItem
                                id={tournament.id}
                                label="Tournament"
                                deleteAction={deleteTournament}
                                redirectPath="/admin"
                            />
                        </div>

                        <form action={updateTournament} className="p-8 space-y-6">
                            <input type="hidden" name="id" value={tournament.id} />

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                        Tournament Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        defaultValue={tournament.name}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all font-medium"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="year" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                        Tournament Year
                                    </label>
                                    <input
                                        type="number"
                                        name="year"
                                        id="year"
                                        required
                                        defaultValue={tournament.year}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                                    Current Status
                                </label>
                                <select
                                    name="status"
                                    id="status"
                                    required
                                    defaultValue={tournament.status}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all font-medium appearance-none"
                                >
                                    <option value="SETUP">🛠️ Setup Phase</option>
                                    <option value="DRAFTING">🎲 Drafting Active</option>
                                    <option value="LIVE">🔥 Live Results</option>
                                    <option value="COMPLETED">🏆 Tournament Over</option>
                                </select>
                            </div>

                            <div className="pt-6 flex flex-col sm:flex-row justify-between items-center bg-gray-50 -mx-8 -mb-8 p-8 gap-4">
                                <Link
                                    href={`/admin/tournaments/${tournament.id}/managers`}
                                    className="text-sm font-black uppercase tracking-widest text-brand-blue hover:text-blue-800 transition-colors flex items-center gap-2"
                                >
                                    <Users className="w-4 h-4" />
                                    Manage Managers
                                </Link>

                                <button
                                    type="submit"
                                    className="w-full sm:w-auto bg-brand-blue text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Tournament
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-8">
                    <TournamentSetupChecklist
                        tournamentId={id}
                        stats={{
                            teamCount,
                            groupCount,
                            managerCount,
                            status: tournament.status
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
