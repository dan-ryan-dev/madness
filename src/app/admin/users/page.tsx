import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Users, ArrowLeft, Mail, Calendar, Search } from "lucide-react"
import { UserRoleSelector } from "@/components/admin/UserRoleSelector"

export const dynamic = 'force-dynamic'

export default async function UserManagementPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const session = await auth()
    const { q } = await searchParams

    // Auth Check: Strictly Super Admin only for this page
    if (session?.user?.role !== "SUPER_ADMIN") {
        redirect("/admin")
    }

    // Fetch Users with Search
    const users = await prisma.user.findMany({
        where: q ? {
            OR: [
                { name: { contains: q } },
                { email: { contains: q } },
            ]
        } : {},
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Back to Admin"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-brand-blue flex items-center gap-3">
                        <Users className="w-8 h-8" />
                        User Management
                    </h1>
                    <p className="text-gray-500">Manage global user roles and permissions.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Search Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <form className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={q}
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none"
                        />
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-xs font-black uppercase tracking-widest text-gray-400">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Current Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-brand-blue/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold">
                                                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{user.name || "Unnamed User"}</div>
                                                <div className="text-xs text-gray-500 font-mono">{user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <UserRoleSelector
                                            userId={user.id}
                                            initialRole={user.role}
                                            userEmail={user.email || ""}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No users found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
