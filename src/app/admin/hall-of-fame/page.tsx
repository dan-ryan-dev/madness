import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { HallOfFameAdminManager } from "@/components/admin/HallOfFameAdminManager"
import { ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"

export default async function AdminHallOfFamePage() {
    const session = await auth()
    if (session?.user?.role !== "SUPER_ADMIN") {
        redirect("/dashboard")
    }

    const entries = await prisma.hallOfFame.findMany({
        orderBy: { year: "desc" },
    })

    return (
        <div className="container mx-auto py-8 px-4 max-w-5xl">
            <Link href="/admin" className="text-gray-500 hover:text-gray-900 mb-6 inline-flex items-center gap-2 font-bold transition-all hover:-translate-x-1">
                <ArrowLeft className="w-4 h-4" /> Back to Admin Console
            </Link>

            <div className="mb-10 text-center space-y-2">
                <div className="inline-flex items-center gap-3 bg-brand-orange/10 px-6 py-2 rounded-full border border-brand-orange/20">
                    <Trophy className="w-5 h-5 text-brand-orange" />
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-brand-orange italic">Administrative Hall of Fame</span>
                </div>
                <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none text-brand-blue">
                    Champions Archive
                </h1>
            </div>

            <HallOfFameAdminManager initialEntries={entries} />
        </div>
    )
}
