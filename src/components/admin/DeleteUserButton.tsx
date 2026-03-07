"use client"

import { useState } from "react"
import { deleteUser } from "@/app/actions/admin"
import { Trash2, Loader2, AlertTriangle } from "lucide-react"

interface DeleteUserButtonProps {
    userId: string
    userName: string
}

export function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setIsDeleting(true)
        setError(null)
        try {
            const result = await deleteUser(userId)
            if (result.success) {
                setShowConfirm(false)
            } else {
                setError(result.message || "Failed to delete")
                setIsDeleting(false)
            }
        } catch (e) {
            setError("An error occurred")
            setIsDeleting(false)
        }
    }

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                {error ? (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {error}
                        <button
                            onClick={() => { setShowConfirm(false); setError(null); }}
                            className="ml-1 font-bold hover:underline"
                        >
                            Dismiss
                        </button>
                    </span>
                ) : (
                    <>
                        <span className="text-xs font-bold text-red-600">Delete {userName}?</span>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                        >
                            {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                            Confirm
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={isDeleting}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Delete User"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    )
}
