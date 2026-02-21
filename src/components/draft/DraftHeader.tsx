"use client"

import { User } from "@prisma/client"
import Image from "next/image"
import { Clock, Undo2, Loader2 } from "lucide-react"
import { undoLastPick } from "@/app/actions/draft"
import { useTransition } from "react"

interface DraftHeaderProps {
    currentPicker: User | null
    nextPicker?: User | null
    pickNumber: number
    isAdmin?: boolean
    groupId?: string
}

export function DraftHeader({ currentPicker, pickNumber, isAdmin, groupId }: DraftHeaderProps) {
    const [isPending, startTransition] = useTransition()

    if (!currentPicker) return null

    const handleUndo = async () => {
        if (!groupId) return
        if (!confirm("Are you sure you want to undo the last pick? This action is permanent.")) return

        startTransition(async () => {
            const result = await undoLastPick(groupId)
            if (!result.success) {
                alert(result.message)
            }
        })
    }

    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-brand-orange/10 p-3 rounded-full">
                        <Clock className="w-6 h-6 text-brand-orange" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">
                            Pick #{pickNumber} • On The Clock
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {currentPicker.image && (
                                <Image
                                    src={currentPicker.image}
                                    alt={currentPicker.name || "User"}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            )}
                            {currentPicker.name || "Unknown"}
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isAdmin && groupId && pickNumber > 1 && (
                        <button
                            onClick={handleUndo}
                            disabled={isPending}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-100 disabled:opacity-50"
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Undo2 className="w-4 h-4" />
                            )}
                            Undo Last Pick
                        </button>
                    )}

                    <div className="hidden md:block">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Live Draft
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
