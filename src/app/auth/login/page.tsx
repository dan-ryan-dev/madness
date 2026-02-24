"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) {
            setError("Please enter your email address first.")
            return
        }
        setIsLoading(true)
        setError("")
        try {
            await signIn("nodemailer", { email, callbackUrl: "/" })
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        if (res?.error) {
            setError("Invalid email or password.")
            setIsLoading(false)
        } else {
            window.location.href = "/"
        }
    }

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
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <form onSubmit={handleCredentialsLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-600 transform transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500 font-medium">Or</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => signIn("google", { callbackUrl: "/" })}
                            disabled={isLoading}
                            className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>

                        <button
                            onClick={handleMagicLink}
                            disabled={isLoading}
                            className="w-full bg-white border-2 border-brand-blue text-brand-blue py-3 rounded-lg font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                        >
                            Sign in with Nodemailer
                        </button>
                        <p className="text-xs text-gray-500 italic text-center px-4 leading-relaxed">
                            “This will sign you in securely via your email. You will receive a Magic Link to access the app, where you can then set or change your permanent password in your profile settings.”
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
                        <Link
                            href="/auth/reset-password"
                            className="text-sm font-medium text-[#002366] hover:underline text-center"
                        >
                            Forgot Password?
                        </Link>
                        <Link
                            href="/auth/register"
                            className="text-sm font-medium text-[#002366] hover:underline text-center"
                        >
                            Don&apos;t have an account? Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
