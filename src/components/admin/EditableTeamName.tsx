
"use client"

import { useState } from "react"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { updateTeamName } from "@/app/actions/tournament"

interface EditableTeamNameProps {
    teamId: string
    initialName: string
}

export function EditableTeamName({ teamId, initialName }: EditableTeamNameProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(initialName)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSave = async () => {
        if (name === initialName) {
            setIsEditing(false)
            return
        }

        if (!name.trim()) {
            setError("Name cannot be empty")
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            const result = await updateTeamName(teamId, name)
            if (result.success) {
                setIsEditing(false)
            } else {
                setError(result.message || "Failed to update")
            }
        } catch (err) {
            setError("Something went wrong")
        } finally {
            setIsSaving(false)
        }
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 group">
                <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave()
                        if (e.key === 'Escape') setIsEditing(false)
                    }}
                    className="border-b-2 border-brand-blue outline-none py-0.5 font-medium text-gray-900 bg-transparent min-w-[200px]"
                    disabled={isSaving}
                />
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="p-1 rounded hover:bg-green-50 text-green-600 transition-colors"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                {error && <span className="text-[10px] text-red-500 font-bold uppercase">{error}</span>}
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 group">
            <span className="font-medium text-gray-900">{name}</span>
            <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                title="Edit Team Name"
            >
                <Pencil className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}
