import { Team } from "@prisma/client"
import { Trophy } from "lucide-react"

interface RosterSidebarProps {
    myTeams: Team[]
}

export function RosterSidebar({ myTeams }: RosterSidebarProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24">
            <div className="p-4 border-b border-gray-100 bg-brand-blue/5 rounded-t-xl">
                <h3 className="font-bold text-brand-blue flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    My Roster
                </h3>
            </div>

            <div className="p-2">
                {myTeams.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No teams drafted yet.
                        <br />
                        Your time is coming!
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {myTeams.map((team) => (
                            <li key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 block">
                                        #{team.seed} {team.region}
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {team.name}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Teams</span>
                    <span className="font-bold">{myTeams.length} / 8</span>
                </div>
            </div>
        </div>
    )
}
