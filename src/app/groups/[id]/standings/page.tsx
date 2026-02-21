import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Trophy, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"

export default async function GroupStandingsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/")

    const { id } = await params

    const group = await prisma.group.findUnique({
        where: { id },
        include: {
            memberships: {
                include: {
                    user: true
                },
                orderBy: {
                    score: 'desc'
                }
            },
            tournament: true
        }
    })

    if (!group) return <div>Group not found</div>

    // Calculate "Teams Alive" for each member
    // We need to fetch their picks and check if team.isEliminated is false
    const memberStats = await Promise.all(group.memberships.map(async (member) => {
        const picks = await prisma.draftPick.findMany({
            where: {
                groupId: group.id,
                userId: member.userId
            },
            include: {
                team: true
            }
        })

        const teamsAlive = picks.filter(p => !p.team.isEliminated).length
        return {
            ...member,
            teamsAlive,
            totalTeams: picks.length
        }
    }))

    // Re-sort by score, then teams alive
    memberStats.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.teamsAlive - a.teamsAlive
    })

    return (
        <div className="container mx-auto py-8">
            <Link href={`/ groups / ${group.id}/dashboard`} className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6" >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link >

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-brand-orange" />
                    Standings
                    <span className="text-lg text-gray-400 font-normal">({group.name})</span>
                </h1>
                <div className="text-sm text-gray-500">
                    Last Updated: {new Date().toLocaleString()}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-white">
                        <tr>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider w-16 text-center">Rank</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider">Player</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">Teams Alive</th>
                            <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {memberStats.map((member, index) => (
                            <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-orange-50/30' : ''}`}>
                                <td className="px-6 py-4 text-center font-bold text-gray-500">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                    {member.user.image ? (
                                        <img src={member.user.image} alt={member.user.name || ""} className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                                            {member.user.name?.[0] || "U"}
                                        </div>
                                    )}
                                    {member.user.name || member.user.email}
                                    {index === 0 && <Trophy className="w-4 h-4 text-brand-orange fill-current" />}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${member.teamsAlive === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {member.teamsAlive} / {member.totalTeams}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-2xl font-bold text-brand-blue">
                                        {member.score}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    )
}
