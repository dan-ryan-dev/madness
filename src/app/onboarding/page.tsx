import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PartyPopper, CheckCircle } from "lucide-react"

export default async function OnboardingPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/api/auth/signin")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-lg border border-gray-100 text-center p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PartyPopper className="w-8 h-8 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome, {session.user.name || "Draft Player"}!
                </h1>

                <p className="text-gray-600 mb-8">
                    You have successfully joined the Madness 2026 Draft Pool. Your account is verified and you are ready to draft.
                </p>

                <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg text-left">
                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-blue-900">Account Verified</p>
                            <p className="text-xs text-blue-700">Your email {session.user.email} is confirmed.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <a
                        href="/dashboard"
                        className="block w-full bg-brand-orange text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Go to Dashboard
                    </a>
                </div>
            </div>
        </div>
    )
}
