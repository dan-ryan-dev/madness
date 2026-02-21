import Link from 'next/link'
import { Trophy } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6">
                <Trophy className="w-16 h-16 text-brand-orange mx-auto opacity-20" />
                <h1 className="text-4xl font-black text-brand-blue tracking-tighter">404 - LOST IN THE MADNESS</h1>
                <p className="text-gray-500 max-w-xs mx-auto">This page has been eliminated from the tournament.</p>
                <Link
                    href="/"
                    className="inline-block bg-brand-blue text-white px-8 py-3 rounded-full font-bold hover:bg-blue-800 transition-colors"
                >
                    Back to Selection
                </Link>
            </div>
        </div>
    )
}
