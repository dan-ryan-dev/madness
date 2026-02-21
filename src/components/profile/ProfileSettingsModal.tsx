"use client"

import { useState } from "react"
import { useActionState } from "react"
import { updateProfile } from "@/app/actions/auth"
import { X, User, Lock, Loader2 } from "lucide-react"

interface ProfileSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    currentName: string
}

export function ProfileSettingsModal({ isOpen, onClose, currentName }: ProfileSettingsModalProps) {
    const [state, action, isPending] = useActionState(updateProfile, null)

    // Close modal if success
    if (state?.success && isOpen) {
        // We might want to show a success state first, but for now let's just close or show message
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-brand-blue p-6 text-white flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase italic tracking-tight">Profile Settings</h2>
                    <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form action={action} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <User className="w-3 h-3" /> Display Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={currentName}
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-brand-blue focus:bg-white outline-none transition-all"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Lock className="w-3 h-3" /> New Password (Optional)
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-700 focus:border-brand-blue focus:bg-white outline-none transition-all"
                                placeholder="••••••••"
                            />
                            <p className="text-[10px] text-gray-400 font-medium">Leave blank to keep your current password.</p>
                        </div>
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-xl text-sm font-bold ${state.success ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {state.message}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-[2] bg-brand-orange text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
