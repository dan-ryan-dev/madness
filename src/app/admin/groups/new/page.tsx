import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { NewGroupForm } from "@/components/admin/NewGroupForm"
import prisma from "@/lib/prisma"
import { Users, ArrowLeft, LayoutDashboard } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function NewGroupPage() {
    const session = await auth()
    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const tournaments = await prisma.tournament.findMany({
        orderBy: { createdAt: 'desc' },
        where: { status: { not: 'COMPLETED' } }
    })

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link href="/admin" className="text-gray-500 hover:text-brand-blue flex items-center gap-2 text-sm font-medium transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Console
                </Link>
                <span className="text-gray-300">/</span>
                <Link href="/admin/groups" className="text-gray-500 hover:text-brand-blue flex items-center gap-2 text-sm font-medium transition-colors">
                    <Users className="w-4 h-4" />
                    Groups
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-brand-orange font-bold text-sm">New Group</span>
            </div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="w-8 h-8 text-brand-orange" />
                    Create New Group
                </h1>
                <p className="text-gray-600 mt-2">
                    Start a new draft pool by creating a group and inviting your players.
                    They will receive an email with a magic link to join.
                </p>
            </div>

            <NewGroupForm tournaments={tournaments} />
        </div>
    )
}
