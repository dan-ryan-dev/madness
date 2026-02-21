import { HowItWorks } from "@/components/landing/HowItWorks"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-brand-blue py-12 text-white mb-12">
                <div className="max-w-6xl mx-auto px-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange hover:opacity-80 transition-opacity mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Homepage
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                        The Rulebook
                    </h1>
                </div>
            </div>

            <HowItWorks />
        </main>
    )
}
