"use client"

import { resetDraft } from "@/app/actions/admin"
import { useActionState } from "react"
import { Trash2 } from "lucide-react"

const initialState = {
    success: false,
    message: "",
}

export function ResetDraftForm() {
    const [state, formAction, isPending] = useActionState(resetDraft, initialState)

    return (
        <form action={formAction}>
            <button
                type="submit"
                disabled={isPending}
                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
                <Trash2 className="w-4 h-4" />
                {isPending ? "Resetting..." : "Clear All Picks"}
            </button>
            {state.message && (
                <p className={`mt-2 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                    {state.message}
                </p>
            )}
        </form>
    )
}
