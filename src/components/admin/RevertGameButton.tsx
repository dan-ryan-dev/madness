"use client"

import { revertGameResult } from "@/app/actions/game"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function RevertGameButton({ gameId, tournamentId }: { gameId: string, tournamentId: string }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleRevert = () => {
        if (!confirm("Are you sure you want to revert this result? This will subtract points and un-eliminate the loser.")) return

        startTransition(async () => {
            const result = await revertGameResult(gameId)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.message)
            }
        })
    }

    return (
        <button
            onClick={handleRevert}
            disabled={isPending}
            className="text-gray-300 hover:text-red-500 transition-colors p-1"
            title="Revert Result"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    )
}
