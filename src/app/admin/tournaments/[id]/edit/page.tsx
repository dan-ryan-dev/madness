import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ArrowLeft, Save, Trophy } from "lucide-react"
import Link from "next/link"
import { updateTournament, deleteTournament } from "@/app/actions/tournament"
import { DeleteAdminItem } from "@/components/admin/DeleteAdminItem"

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

    return (
        <div className="container mx-auto py-8">
            <Link href="/admin" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                        <div className="p-3 bg-brand-orange/10 rounded-lg">
                            <Trophy className="w-6 h-6 text-brand-orange" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold text-gray-900">Edit Tournament</h1>
                            <p className="text-sm text-gray-500">Update details for {tournament.name}</p>
                        </div>
                        <DeleteAdminItem
                            id={tournament.id}
                            label="Tournament"
                            deleteAction={deleteTournament}
                            redirectPath="/admin"
                        />
                    </div>

                    <form action={updateTournament} className="p-6 space-y-6">
                        <input type="hidden" name="id" value={tournament.id} />

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Tournament Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                defaultValue={tournament.name}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                                Year
                            </label>
                            <input
                                type="number"
                                name="year"
                                id="year"
                                required
                                defaultValue={tournament.year}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                id="status"
                                required
                                defaultValue={tournament.status}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                            >
                                <option value="SETUP">Setup</option>
                                <option value="DRAFTING">Drafting</option>
                                <option value="LIVE">Live</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>

                        <div className="pt-4 flex justify-between items-center">
                            <Link
                                href={`/admin/tournaments/${tournament.id}/import`}
                                className="text-sm text-brand-blue hover:underline"
                            >
                                Manage Teams / Import
                            </Link>

                            <button
                                type="submit"
                                className="bg-brand-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
