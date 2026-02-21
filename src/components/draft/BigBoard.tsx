"use client"

import { Team } from "@prisma/client"
import { cn } from "@/lib/utils"
// We'll pass the server action as a prop or import it directly if using client component wrappers
import { pickTeam } from "@/app/actions/draft"
import { useTransition } from "react"

interface BigBoardProps {
    teams: Team[]
    takenTeamIds: string[]
    isMyTurn: boolean
    isAdmin: boolean
    onAdminPick?: (teamId: string) => void
    groupId: string // Needed for server action
}

export function BigBoard({ teams, takenTeamIds, isMyTurn, isAdmin, groupId }: BigBoardProps) {
    const [isPending, startTransition] = useTransition()

    const handlePick = (teamId: string) => {
        startTransition(async () => {
            const result = await pickTeam(groupId, teamId)
            if (!result.success) {
                // In a real app, show toast error
                alert(result.message)
            }
        })
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {teams.map((team) => {
                const isTaken = takenTeamIds.includes(team.id)
                // Admin can pick ANY available team
                // User can only pick if it's their turn AND team is available
                const canPick = !isTaken && (isAdmin || isMyTurn)

                return (
                    <div
                        key={team.id}
                        className={cn(
                            "relative p-2 rounded-lg border transition-all duration-200", // p-4 -> p-2, rounded-xl -> rounded-lg
                            isTaken
                                ? "bg-gray-50 border-gray-100 opacity-40 grayscale"
                                : "bg-white border-gray-200 hover:shadow-md hover:border-brand-blue/30"
                        )}
                    >
                        {/* Seed & Region Badge */}
                        <div className="flex justify-between items-start mb-1"> {/* mb-2 -> mb-1 */}
                            <span className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded", // Smaller text/padding
                                isTaken ? "bg-gray-200 text-gray-500" : "bg-brand-blue/10 text-brand-blue"
                            )}>
                                #{team.seed} {team.region}
                            </span>
                        </div>

                        {/* Team Name */}
                        <h3 className={cn(
                            "text-sm font-bold mb-2 line-clamp-1", // text-md -> text-sm, mb-4 -> mb-2, line-clamp-2 -> line-clamp-1, removed min-h
                            isTaken ? "text-gray-400" : "text-gray-900"
                        )}>
                            {team.name}
                        </h3>

                        {/* Action Button */}
                        {!isTaken && (
                            <button
                                onClick={() => handlePick(team.id)}
                                disabled={!canPick || isPending}
                                className={cn(
                                    "w-full py-1.5 rounded font-bold text-xs transition-colors shadow-sm", // py-2 -> py-1.5, text-sm -> text-xs
                                    isAdmin
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : isMyTurn
                                            ? "bg-brand-orange text-white hover:bg-orange-600"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                {isAdmin
                                    ? (isPending ? "..." : "Assign") // Shorter text
                                    : (isMyTurn ? (isPending ? "..." : "Draft") : "Wait")
                                }
                            </button>
                        )}

                        {isTaken && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-gray-400 font-bold uppercase tracking-widest border-2 border-gray-400 px-4 py-1 rounded-md transform -rotate-12 opacity-50">
                                    Taken
                                </span>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
