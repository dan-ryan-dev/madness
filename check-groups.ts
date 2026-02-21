
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const groups = await prisma.group.findMany({
        include: {
            _count: {
                select: { memberships: true }
            },
            admin: true
        }
    })
    console.log("Groups found:", groups.length)
    console.log(JSON.stringify(groups, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
