
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("Testing Admin Groups Query...")
    try {
        const groups = await prisma.group.findMany({
            include: {
                memberships: true,
                _count: {
                    select: {
                        draftPicks: true
                    }
                },
                tournament: true,
                admin: true
            },
            take: 5
        })
        console.log("Successfully fetched groups:", groups.length)
        console.log("Sample Group:", JSON.stringify(groups[0], null, 2))
    } catch (error) {
        console.error("Query Failed:", error)
    }
}

main()
