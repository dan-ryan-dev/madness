import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const tournaments = await prisma.tournament.findMany({
        orderBy: { year: 'desc' },
        select: { id: true, name: true, year: true, status: true }
    })

    console.log('--- All Tournaments ---')
    tournaments.forEach(t => {
        console.log({
            id: t.id,
            name: t.name,
            year: t.year,
            status: t.status
        })
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
