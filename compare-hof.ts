import { PrismaClient } from '@prisma/client'

async function check() {
    const devUrl = "postgresql://postgres:M%40ngotruck464@db.uhwszvkoukjtgjblsmms.supabase.co:5432/postgres"
    const prodUrl = "postgresql://postgres:M%40ngotruck464@db.bnqmmdafysfrxlbujtvw.supabase.co:5432/postgres"

    const devPrisma = new PrismaClient({
        datasources: { db: { url: devUrl } }
    })
    const prodPrisma = new PrismaClient({
        datasources: { db: { url: prodUrl } }
    })

    try {
        const devCount = await devPrisma.hallOfFame.count()
        const prodCount = await prodPrisma.hallOfFame.count()

        console.log(`Dev HOF Count: ${devCount}`)
        console.log(`Prod HOF Count: ${prodCount}`)

        if (devCount > 0) {
            const devLast = await devPrisma.hallOfFame.findFirst({ orderBy: { year: 'desc' } })
            console.log(`Dev Most Recent Entry: ${JSON.stringify(devLast)}`)
        }
    } catch (e) {
        console.error(e)
    } finally {
        await devPrisma.$disconnect()
        await prodPrisma.$disconnect()
    }
}

check()
