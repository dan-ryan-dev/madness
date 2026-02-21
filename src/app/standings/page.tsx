import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function StandingsPage() {
    const session = await auth()
    if (!session?.user) redirect("/")

    // Find the user's first group
    const membership = await prisma.groupMembership.findFirst({
        where: { userId: session.user.id },
        orderBy: { joinedAt: 'desc' }
    })

    if (membership) {
        redirect(`/groups/${membership.groupId}/standings`)
    } else {
        redirect("/dashboard")
    }
}
