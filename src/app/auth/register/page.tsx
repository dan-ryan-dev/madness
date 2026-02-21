"use client"

import { useActionState } from "react"
import Link from "next/link"
import Image from "next/image"
import { registerUser } from "@/app/actions/auth"

const initialState = {
    success: false,
    message: "",
}

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(registerUser, initialState)

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gray-50 overflow-hidden">
            {/* Background Texture */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: 'url("/court-bg.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100 relative z-10 mx-4">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-48 h-24 mb-4">
                        <Image
                            src="/logo.png"
                            alt="Madness 2026 Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-brand-dark">Create Your Account</h1>
                    <p className="text-gray-500 text-sm mt-1 text-center font-medium">
                        Join the pool and start drafting your winning roster.
                    </p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                            required
                            minLength={8}
                        />
                    </div>

                    {state.message && (
                        <p className={`text-sm font-medium ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                            {state.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transform transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {isPending ? "Creating Account..." : "Create Account"}
                    </button>

                    {state.success && (
                        <Link
                            href="/auth/login"
                            className="block w-full text-center py-3 rounded-lg border-2 border-brand-blue text-brand-blue font-bold hover:bg-blue-50 transition-all"
                        >
                            Back to Sign In
                        </Link>
                    )}
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-brand-blue font-bold hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
