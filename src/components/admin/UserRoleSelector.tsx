"use client"

import { useState } from "react"
import { updateUserRole } from "@/app/actions/admin"
import { Shield, User, ShieldCheck, Loader2 } from "lucide-react"

interface UserRoleSelectorProps {
    userId: string
    initialRole: string
    userEmail: string
}

const ROLES = [
    { value: "PLAYER", label: "Player", icon: User, color: "text-gray-600" },
    { value: "GROUP_ADMIN", label: "Group Admin", icon: Shield, color: "text-blue-600" },
    { value: "SUPER_ADMIN", label: "Super Admin", icon: ShieldCheck, color: "text-purple-600" },
]

export function UserRoleSelector({ userId, initialRole, userEmail }: UserRoleSelectorProps) {
    const [role, setRole] = useState(initialRole)
    const [isUpdating, setIsUpdating] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleRoleChange = async (newRole: string) => {
        if (newRole === role) return

        // Prevent self-demotion if the user is changing their own role (simple check)
        // In a real app, we'd check against the session user ID

        setIsUpdating(true)
        setMessage(null)

        try {
            const result = await updateUserRole(userId, newRole)
            if (result.success) {
                setRole(newRole)
                setMessage({ type: 'success', text: "Updated" })
                setTimeout(() => setMessage(null), 3000)
            } else {
                setMessage({ type: 'error', text: result.message || "Failed" })
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Error" })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <div className="flex items-center gap-3">
            <div className="relative group">
                <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    disabled={isUpdating}
                    className={`
            appearance-none pl-10 pr-8 py-2 rounded-lg text-sm font-semibold border transition-all
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-blue'}
            ${role === 'SUPER_ADMIN' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                            role === 'GROUP_ADMIN' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                'bg-gray-50 border-gray-200 text-gray-700'}
          `}
                >
                    {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                            {r.label}
                        </option>
                    ))}
                </select>

                {/* Icon Overlay */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                        (() => {
                            const CurrentIcon = ROLES.find(r => r.value === role)?.icon || User
                            return <CurrentIcon className={`w-4 h-4 ${ROLES.find(r => r.value === role)?.color}`} />
                        })()
                    )}
                </div>

                {/* Custom Arrow */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {message && (
                <span className={`text-xs font-bold px-2 py-1 rounded animate-fade-in ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {message.text}
                </span>
            )}
        </div>
    )
}
