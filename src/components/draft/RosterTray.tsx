import { Team, User } from "@prisma/client"
import { cn } from "@/lib/utils"

interface RosterTrayProps {
    members: (any & { user: User })[]
    rosterMap: Map<string, any[]>
    currentPickerId?: string
}

export function RosterTray({ members, rosterMap, currentPickerId }: RosterTrayProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 h-24 overflow-x-auto">
            <div className="container mx-auto px-4 h-full flex items-center gap-4 min-w-max">
                {members.map((member) => {
                    const picks = rosterMap.get(member.userId) || []
                    const isPicking = member.userId === currentPickerId

                    return (
                        <div
                            key={member.id}
                            className={cn(
                                "flex-shrink-0 w-48 p-2 rounded-lg border h-20 flex flex-col justify-between transition-all",
                                isPicking ? "bg-brand-orange/5 border-brand-orange shadow-sm" : "bg-gray-50 border-gray-100 opacity-80 hover:opacity-100"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={cn(
                                    "font-bold text-sm truncate max-w-[120px]",
                                    isPicking ? "text-brand-orange" : "text-gray-700"
                                )}>
                                    {member.user.name || "Player"}
                                </span>
                                <span className="text-xs font-mono text-gray-400">
                                    {picks.length}/8
                                </span>
                            </div>

                            <div className="flex gap-1 overflow-hidden">
                                {picks.map((pick) => (
                                    <div
                                        key={pick.id}
                                        className="w-4 h-4 rounded-sm bg-brand-blue/20 flex-shrink-0"
                                        title={pick.team.name}
                                    />
                                ))}
                                {Array.from({ length: 8 - picks.length }).map((_, i) => (
                                    <div key={i} className="w-4 h-4 rounded-sm bg-gray-100 border border-gray-200 flex-shrink-0" />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
