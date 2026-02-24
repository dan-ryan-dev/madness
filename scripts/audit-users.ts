import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        where: {
            email: { contains: 'kblair', mode: 'insensitive' }
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    console.log('--- User Audit ---')
    console.table(users)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
