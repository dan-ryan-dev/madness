import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ResetDraftForm } from "@/components/admin/ResetDraftForm"
import { Database, RefreshCw, Trash2 } from "lucide-react"

export default async function AdminSetupPage() {
    const session = await auth()

    if (session?.user?.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
                <Database className="w-8 h-8 text-brand-orange" />
                <h1 className="text-3xl font-bold text-gray-900">Draft Setup & Configuration</h1>
            </div>

            <div className="grid gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-brand-blue mb-2 flex items-center gap-2">
                        <Trash2 className="w-5 h-5" />
                        Reset Draft
                    </h2>
                    <p className="text-gray-600 mb-6">
                        This will permanently delete ALL draft picks for the current tournament. Use this to restart a mock draft.
                    </p>

                    <ResetDraftForm />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 opacity-75 cursor-not-allowed relative">
                    <div className="absolute inset-0 bg-white/50 z-10" />
                    <h2 className="text-xl font-bold text-brand-blue mb-2 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Randomize Draft Order
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Shuffles the player order for the active group. (Coming Soon)
                    </p>
                    <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded-md font-medium cursor-not-allowed">
                        Shuffle Order
                    </button>
                </div>
            </div>
        </div>
    )
}
