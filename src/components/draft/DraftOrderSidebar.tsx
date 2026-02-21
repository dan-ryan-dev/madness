import { User } from "@prisma/client"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, Trophy } from "lucide-react"

interface DraftOrderSidebarProps {
    members: (any & { user: User })[]
    currentPickerId?: string
    currentRound: number
    totalPlayers: number
    isAdmin: boolean
}

export function DraftOrderSidebar({ members, currentPickerId, currentRound, totalPlayers, isAdmin }: DraftOrderSidebarProps) {
    // Determine snake direction
    // Round 1 (Odd) -> Down (Index 0 to N-1)
    // Round 2 (Even) -> Up (Index N-1 to 0)
    const isEvenRound = currentRound % 2 === 0
    const direction = isEvenRound ? "up" : "down"

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit sticky top-24 overflow-hidden">
            <div className={cn(
                "p-4 border-b border-gray-100 flex items-center justify-between",
                isAdmin ? "bg-blue-50" : "bg-gray-50"
            )}>
                <h3 className={cn("font-bold", isAdmin ? "text-blue-800" : "text-gray-700")}>
                    {isAdmin ? "War Room Control" : "Draft Order"}
                </h3>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                    Round {currentRound}
                    {direction === "down" ? <ArrowDown className="w-3 h-3 text-brand-orange" /> : <ArrowUp className="w-3 h-3 text-brand-orange" />}
                </div>
            </div>

            <div className="divide-y divide-gray-50">
                {members.map((member, index) => {
                    // Visual Order: Always 1..8
                    // Highlighting depends on snake logic
                    const isCurrentPicker = member.userId === currentPickerId

                    return (
                        <div
                            key={member.id}
                            className={cn(
                                "p-3 flex items-center gap-3 transition-colors",
                                isCurrentPicker ? "bg-brand-orange/5 border-l-4 border-brand-orange" : "border-l-4 border-transparent hover:bg-gray-50"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                isCurrentPicker ? "bg-brand-orange text-white" : "bg-gray-100 text-gray-400"
                            )}>
                                {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-medium truncate",
                                    isCurrentPicker ? "text-brand-orange" : "text-gray-700"
                                )}>
                                    {member.user.name || member.user.email}
                                </p>
                            </div>

                            {isCurrentPicker && (
                                <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                            )}
                        </div>
                    )
                })}
            </div>

            {isAdmin && (
                <div className="p-3 bg-blue-50 text-xs text-center text-blue-600 border-t border-blue-100">
                    You are in Admin Mode
                </div>
            )}
        </div>
    )
}
