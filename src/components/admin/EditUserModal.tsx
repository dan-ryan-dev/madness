"use client"

import { useState } from "react"
import { updateUser } from "@/app/actions/admin"
import { Edit2, Loader2, X, Check } from "lucide-react"

interface EditUserModalProps {
    user: {
        id: string
        name: string | null
        email: string | null
    }
}

export function EditUserModal({ user }: EditUserModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: user.name || "",
        email: user.email || "",
        password: ""
    })

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        setError(null)

        try {
            const result = await updateUser(user.id, formData)
            if (result.success) {
                setIsOpen(false)
                setFormData(prev => ({ ...prev, password: "" }))
            } else {
                setError(result.message || "Failed to update")
            }
        } catch (e) {
            setError("An error occurred")
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                title="Edit User"
            >
                <Edit2 className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-semibold">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">New Password (Optional)</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
                                    placeholder="Enter new password"
                                    minLength={8}
                                />
                                <p className="text-[10px] text-gray-400 ml-1 italic">Leave blank to keep existing password.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-brand-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isUpdating}
                                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
