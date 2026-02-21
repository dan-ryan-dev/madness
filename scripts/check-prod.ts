import { PrismaClient } from '@prisma/client'

// Manually set the DATABASE_URL to Prod for this check
const prodUrl = process.env.PROD_DATABASE_URL || "postgresql://postgres:M%40ngotruck464@db.bnqmmdafysfrxlbujtvw.supabase.co:5432/postgres";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: prodUrl,
        },
    },
})

async function main() {
    console.log('Connecting to Production Database...')
    const tournaments = await prisma.tournament.findMany()
    console.log('Tournaments found:', tournaments.length)
    tournaments.forEach(t => console.log(`- ${t.name} (Status: ${t.status})`))

    const hallOfFameCount = await prisma.hallOfFame.count()
    console.log('Hall of Fame entries:', hallOfFameCount)
}

main()
    .catch((e) => {
        console.error('Connection failed:', e.message)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
