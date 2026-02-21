import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { EditGroupForm } from "@/components/admin/EditGroupForm"
import { MemberRow } from "@/components/admin/MemberRow"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { deleteGroup } from "@/app/actions/group"
import { DeleteAdminItem } from "@/components/admin/DeleteAdminItem"

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()

    if (!session?.user?.role || !["SUPER_ADMIN", "GROUP_ADMIN"].includes(session.user.role)) {
        redirect("/dashboard")
    }

    const { id } = await params
    const group = await prisma.group.findUnique({
        where: { id },
        include: {
            memberships: {
                include: { user: true },
                orderBy: { joinedAt: 'asc' }
            }
        }
    })

    if (!group) {
        return <div className="p-8 text-center text-red-500">Group not found</div>
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <Link href="/admin/groups" className="text-gray-500 hover:text-gray-900 mb-6 inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Groups
            </Link>

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Users className="w-8 h-8 text-brand-blue" />
                    Edit Group: {group.name}
                </h1>
                <DeleteAdminItem
                    id={group.id}
                    label="Group"
                    deleteAction={deleteGroup}
                    redirectPath="/admin/groups"
                />
            </div>

            <div className="grid gap-8">
                {/* Main Edit Form */}
                <EditGroupForm group={group} />

                {/* Existing Members List (Separate from form to allow individual deletes) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Members ({group.memberships.length})</h2>
                    <div className="space-y-3">
                        {group.memberships.map((membership: any) => (
                            <MemberRow key={membership.id} groupId={group.id} player={membership} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
