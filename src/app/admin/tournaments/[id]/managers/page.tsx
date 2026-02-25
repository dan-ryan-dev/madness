import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ArrowLeft, Users, Mail, ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import { ManagerInvitationForm } from "@/components/admin/ManagerInvitationForm"

export default async function TournamentManagersPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    // Auth Check: Super Admin only
    if (session?.user?.role !== "SUPER_ADMIN") {
        redirect("/admin")
    }

    const { id } = await params
    const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: {
            _count: {
                select: { groups: true }
            }
        }
    })

    if (!tournament) {
        return <div className="p-8 text-center text-red-500 font-bold">Tournament not found</div>
    }

    // Fetch existing Group Admins (for display/list)
    // Note: This logic assumes we want to see users who are currently GROUP_ADMINs.
    // In a more complex system, we might link managers specifically to tournaments.
    const currentAdmins = await prisma.user.findMany({
        where: { role: "GROUP_ADMIN" },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="container mx-auto py-8">
            <Link href={`/admin/tournaments/${id}/edit`} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tournament Edit
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-brand-blue" />
                        Manager Management
                    </h1>
                    <p className="text-gray-500 mt-1">Tournament: <span className="font-bold text-brand-orange">{tournament.name}</span></p>
                </div>
                <div className="flex items-center gap-4 px-4 py-2 bg-brand-blue/5 rounded-xl border border-brand-blue/10">
                    <div className="text-center border-r border-brand-blue/10 pr-4">
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Target</p>
                        <p className="text-xl font-bold text-brand-blue">15</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Current</p>
                        <p className="text-xl font-bold text-brand-orange">{currentAdmins.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invitation Tool */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-brand-blue" />
                                Bulk Invite Managers
                            </h2>
                            <p className="text-sm text-gray-500">Add group managers and send them their sign-in credentials.</p>
                        </div>
                        <div className="p-6">
                            <ManagerInvitationForm tournamentId={id} />
                        </div>
                    </section>
                </div>

                {/* Sidebar: Current Managers List */}
                <div className="space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-brand-blue" />
                                Active Managers
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {currentAdmins.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm italic">
                                    No managers found. Use the invitation tool to add some.
                                </div>
                            ) : (
                                currentAdmins.map((admin) => (
                                    <div key={admin.id} className="p-4 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs">
                                                {admin.name?.[0]?.toUpperCase() || admin.email?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{admin.name || "Unnamed"}</p>
                                                <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                                                    <Mail className="w-3 h-3" />
                                                    {admin.email}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                            <Link href="/admin/users" className="text-xs font-bold text-brand-blue hover:underline flex items-center justify-center gap-1">
                                View All Users <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
