import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BulkTeamImporter } from "@/components/admin/BulkTeamImporter"
import { ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"

export default async function ImportTeamsPage({ params }: { params: Promise<{ id: string }> }) {
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
            <Link href="/admin/tournaments" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tournaments
            </Link>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-4xl mx-auto">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
                    <div className="p-3 bg-brand-orange/10 rounded-lg">
                        <Trophy className="w-8 h-8 text-brand-orange" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Import Teams</h1>
                        <p className="text-gray-500">
                            Populate the bracket for <strong>{tournament.name}</strong>
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <BulkTeamImporter tournamentId={tournament.id} />
                </div>
            </div>
        </div>
    )
}
