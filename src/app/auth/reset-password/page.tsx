"use client"

import { useActionState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { forgotPassword, resetPassword } from "@/app/actions/auth"

const initialState = {
    success: false,
    message: "",
}

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [requestState, requestAction, isRequestPending] = useActionState(forgotPassword, initialState)
    const [resetState, resetAction, isResetPending] = useActionState(resetPassword, initialState)

    // Stage 1: Request Link
    if (!token) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-brand-dark">Reset Password</h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">
                        Enter your email and we'll send you a secure reset link.
                    </p>
                </div>

                <form action={requestAction} className="space-y-6">
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

                    {requestState.message && (
                        <p className={`text-sm font-medium ${requestState.success ? 'text-green-600' : 'text-red-600'}`}>
                            {requestState.message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isRequestPending}
                        className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transform transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {isRequestPending ? "Sending..." : "Send Reset Link"}
                    </button>

                    <Link
                        href="/auth/login"
                        className="block w-full text-center text-sm font-bold text-brand-blue hover:underline"
                    >
                        Back to Login
                    </Link>
                </form>
            </div>
        )
    }

    // Stage 2: Set New Password
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-brand-dark">Create New Password</h1>
                <p className="text-gray-500 text-sm mt-1 font-medium">
                    Secure your account with a new master password.
                </p>
            </div>

            <form action={resetAction} className="space-y-6">
                <input type="hidden" name="token" value={token} />

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
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

                {resetState.message && (
                    <p className={`text-sm font-medium ${resetState.success ? 'text-green-600' : 'text-red-600'}`}>
                        {resetState.message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isResetPending}
                    className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transform transition-all active:scale-[0.98] disabled:opacity-70"
                >
                    {isResetPending ? "Updating Password..." : "Update Password"}
                </button>

                {resetState.success && (
                    <Link
                        href="/auth/login"
                        className="block w-full text-center py-3 rounded-lg border-2 border-brand-blue text-brand-blue font-bold hover:bg-blue-50 transition-all"
                    >
                        Success! Sign In Now
                    </Link>
                )}
            </form>
        </div>
    )
}

export default function ResetPasswordPage() {
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
                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-48 h-24 mb-4">
                        <Image
                            src="/logo.png"
                            alt="Madness 2026 Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
