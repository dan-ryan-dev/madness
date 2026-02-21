"use client"

import { useState } from "react"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface DeleteAdminItemProps {
    id: string
    label: string
    deleteAction: (id: string) => Promise<{ success: boolean; message: string }>
    redirectPath: string
}

export function DeleteAdminItem({ id, label, deleteAction, redirectPath }: DeleteAdminItemProps) {
    const [isConfirming, setIsConfirming] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        setError("")
        try {
            const result = await deleteAction(id)
            if (result.success) {
                router.push(redirectPath)
                router.refresh()
            } else {
                setError(result.message)
                setIsDeleting(false)
                setIsConfirming(false)
            }
        } catch (e) {
            setError("Something went wrong")
            setIsDeleting(false)
            setIsConfirming(false)
        }
    }

    if (isConfirming) {
        return (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3 text-red-800">
                    <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight italic">Are you absolutely sure?</h3>
                </div>
                <p className="text-sm font-medium text-red-700/80 leading-relaxed">
                    This will permanently delete the **{label}** and all associated data including memberships and picks. This action cannot be undone.
                </p>
                {error && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-700">
                        {error}
                    </div>
                )}
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsConfirming(false)}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 bg-white border-2 border-red-100 rounded-xl text-sm font-black uppercase tracking-widest text-red-800 hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex-[2] px-4 py-3 bg-red-600 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-red-700 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        {isDeleting ? "Deleting..." : "Permanently Delete"}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={() => setIsConfirming(true)}
            className="text-red-600 hover:text-red-700 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-all group"
        >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Delete {label}
        </button>
    )
}
