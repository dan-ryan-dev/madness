"use client"

import { createGroupWithPlayers } from "@/app/actions/group"
import { useActionState, useState } from "react"
import { Users, Loader2, AlertCircle, Info, ExternalLink, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface Tournament {
    id: string
    name: string
}

export function NewGroupForm({ tournaments }: { tournaments: Tournament[] }) {
    const [state, formAction, isPending] = useActionState(createGroupWithPlayers, { success: false, message: "", groupId: "" })
    const [clientError, setClientError] = useState<string | null>(null)

    const handleSubmit = async (formData: FormData) => {
        setClientError(null)

        const groupName = formData.get("groupName") as string
        if (!groupName) {
            setClientError("Group Name is required.")
            return
        }

        const players: { name: string, email: string }[] = []
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        for (let i = 0; i < 8; i++) {
            const name = formData.get(`player_${i}_name`) as string
            const email = formData.get(`player_${i}_email`) as string

            if (!name || !email) {
                setClientError(`All 8 players must have both a name and an email. Slot #${i + 1} is incomplete.`)
                return
            }

            if (!emailRegex.test(email)) {
                setClientError(`Invalid email format for player #${i + 1}: ${email}`)
                return
            }

            players.push({ name, email })
        }

        formAction(formData)
    }

    if (tournaments.length === 0) {
        return (
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-center text-yellow-800">
                <p className="font-bold">No tournaments found.</p>
                <p className="text-sm">Please ask a Super Admin to create a tournament first.</p>
            </div>
        )
    }

    if (state.success && state.groupId) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-green-100 max-w-2xl mx-auto text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">
                    Group Created!
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Group <span className="font-bold text-gray-900">"{state.message.split('"')[1] || "New Group"}"</span> has been created successfully with 8 players.
                    Invitation emails have been sent!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href={`/groups/${state.groupId}/draft`}
                        className="flex items-center justify-center gap-2 bg-brand-orange text-white px-6 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200"
                    >
                        Go to Draft Room
                        <ExternalLink className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/admin/groups"
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                        Back to Groups
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            {/* Tournament Selection */}
            <div className="mb-6">
                <label htmlFor="tournamentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Tournament
                </label>
                <select
                    name="tournamentId"
                    id="tournamentId"
                    required
                    defaultValue={tournaments[0].id}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent bg-white"
                >
                    {tournaments.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            {/* Group Details */}
            <div className="mb-8">
                <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                </label>
                <input
                    type="text"
                    name="groupName"
                    id="groupName"
                    placeholder="e.g. Rose City"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                />
            </div>

            {/* Members Section */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-brand-blue" />
                            Members (Exactly 8)
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configure the 8 slots below in their picking order.
                        </p>
                    </div>
                </div>

                {/* Draft Order Instructions */}
                <div className="bg-orange-50 p-6 rounded-xl border-2 border-brand-orange/20 mb-8 shadow-sm">
                    <h3 className="text-xl font-black italic tracking-tight text-[#002F6C] flex items-center gap-2 uppercase mb-2">
                        <AlertCircle className="w-6 h-6" />
                        Picking Order Matters!
                    </h3>
                    <p className="text-gray-800 font-bold leading-relaxed">
                        IMPORTANT: Enter players in the <span className="text-brand-orange underline underline-offset-4">exact order</span> they will pick.
                        The first player added will have <span className="bg-brand-orange text-white px-2 py-0.5 rounded italic">Pick #1</span>.
                        This order is required for the Snake Draft board logic to work properly.
                    </p>
                </div>

                <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex gap-4 items-start p-4 rounded-lg border bg-gray-50 border-gray-100">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 font-bold text-sm shrink-0 mt-1">
                                {i + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor={`player_${i}_name`} className="block text-xs font-medium text-gray-500 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name={`player_${i}_name`}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                                        placeholder="Player Name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`player_${i}_email`} className="block text-xs font-medium text-gray-500 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name={`player_${i}_email`}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                                        placeholder="player@example.com"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tie-breaker Note */}
                <div className="mt-6 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                    <p>
                        <strong>Note:</strong> Tie-breaker predictions (Final Score & NIT Winner) will be captured from each player once the draft is complete.
                    </p>
                </div>
            </div>

            {/* Notification Info */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-6 text-sm text-yellow-800">
                <p className="font-semibold mb-1">📧 Notifications:</p>
                <ul className="list-disc pl-4 space-y-1">
                    <li><strong>New Users:</strong> Will receive an email with a Magic Link to create their account.</li>
                    <li><strong>Existing Users:</strong> Will receive an email notification linking them to this group.</li>
                </ul>
            </div>

            {/* Feedback */}
            {(state.message || clientError) && (
                <div className={`p-4 rounded-md mb-6 flex items-start gap-3 ${state.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">{state.success ? "Success!" : "Action Required"}</p>
                        <p className="text-sm">{clientError || state.message}</p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-brand-orange text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isPending ? "Creating Group..." : "Create Group & Invite Players"}
                </button>
            </div>
        </form>
    )
}
