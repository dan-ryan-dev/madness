"use client"

import { useTransition, useState } from "react"
import { createTournament } from "@/app/actions/tournament"
import { ArrowLeft, Loader2, Trophy } from "lucide-react"
import Link from "next/link"

export default function NewTournamentPage() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            try {
                const result = await createTournament(null, formData)
                if (!result.success) {
                    setError(result.message)
                }
            } catch (e: any) {
                // Should not happen if server action handles redirects correctly, 
                // but if it throws, we check here.
                if (e.message === "NEXT_REDIRECT") throw e
                setError("Something went wrong.")
            }
        })
    }

    return (
        <div className="container mx-auto py-8">
            <Link href="/admin/tournaments" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tournaments
            </Link>

            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-orange/10 mb-4">
                        <Trophy className="w-8 h-8 text-brand-orange" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">New Tournament</h1>
                    <p className="text-gray-500 mt-2">Create a new bracket pool.</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <form action={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Tournament Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                placeholder="e.g. Madness 2026"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                                Year
                            </label>
                            <input
                                type="number"
                                name="year"
                                id="year"
                                required
                                defaultValue={2026}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create & Import Teams"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
