"use client"

import { useState, useTransition } from "react"
import { inviteManagers } from "@/app/actions/admin"
import { Loader2, CheckCircle, AlertCircle, Eye, Mail, ArrowRight, UserPlus, Info } from "lucide-react"
import Link from "next/link"

export function ManagerInvitationForm({ tournamentId }: { tournamentId: string }) {
    const [managerData, setManagerData] = useState("")
    const [previewData, setPreviewData] = useState<{ name: string, email: string }[]>([])
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isPending, startTransition] = useTransition()

    const SAMPLE_DATA = `Dan Ryan, dan@example.com\nJoe Sacco, joe@example.com`

    const handlePreview = () => {
        setError("")
        setSuccess("")
        if (!managerData.trim()) {
            setError("Please paste some manager data first.")
            return
        }

        const lines = managerData.trim().split("\n")
        const parsed: { name: string, email: string }[] = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const parts = line.split(",").map(p => p.trim())
            if (parts.length < 2) {
                setError(`Line ${i + 1} format invalid. Expected "Name, Email".`)
                return
            }

            const email = parts[parts.length - 1] // Last part is email
            const name = parts.slice(0, -1).join(", ") // Everything else is name

            if (!email.includes("@")) {
                setError(`Line ${i + 1} has an invalid email: ${email}`)
                return
            }

            parsed.push({ name, email })
        }
        setPreviewData(parsed)
    }

    const handleInvite = () => {
        if (previewData.length === 0) return

        startTransition(async () => {
            const result = await inviteManagers(tournamentId, previewData)
            if (result.success) {
                setSuccess(result.message as string)
                setError("")
                setPreviewData([])
                setManagerData("")
            } else {
                setError(result.message as string)
                setSuccess("")
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="bg-brand-blue/5 p-4 rounded-xl border border-brand-blue/10 text-sm text-brand-blue">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4" />
                    How to Invite Managers
                </h4>
                <p>Paste a list of managers below. Each line should be: <strong>Name, Email</strong>.</p>
                <p className="mt-2 text-xs opacity-80">Managers will receive an email with their temporary password and setup instructions.</p>
            </div>

            <textarea
                value={managerData}
                onChange={(e) => setManagerData(e.target.value)}
                placeholder={SAMPLE_DATA}
                className="w-full h-48 p-4 font-mono text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all"
            />

            <div className="flex gap-4">
                <button
                    onClick={handlePreview}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <Eye className="w-5 h-5" />
                    Preview List
                </button>
                <button
                    onClick={handleInvite}
                    disabled={isPending || previewData.length === 0}
                    className="flex-1 bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
                >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    Send Invitations
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-100 p-6 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 text-green-700 mb-4">
                        <CheckCircle className="w-6 h-6 flex-shrink-0" />
                        <span className="font-bold text-lg">{success}</span>
                    </div>
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                    >
                        Back to Admin Dashboard
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}

            {previewData.length > 0 && (
                <div className="border border-gray-200 rounded-2xl overflow-hidden mt-8 shadow-sm">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-700">Preview ({previewData.length} Managers)</span>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Table View</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white sticky top-0 shadow-sm border-b">
                                <tr>
                                    <th className="px-6 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Name</th>
                                    <th className="px-6 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {previewData.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3 font-bold text-gray-900">{row.name}</td>
                                        <td className="px-6 py-3 text-gray-600 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-300" />
                                            {row.email}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
