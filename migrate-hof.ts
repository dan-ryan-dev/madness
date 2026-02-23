import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

async function migrate() {
    const devUrl = "postgresql://postgres:M%40ngotruck464@db.uhwszvkoukjtgjblsmms.supabase.co:5432/postgres"
    const prisma = new PrismaClient({
        datasources: { db: { url: devUrl } }
    })

    const data = JSON.parse(fs.readFileSync('hof_data.json', 'utf8'))

    console.log(`Starting migration of ${data.length} entries...`)

    for (const entry of data) {
        try {
            await prisma.hallOfFame.upsert({
                where: { year: entry.year },
                update: entry,
                create: entry
            })
            console.log(`Migrated year: ${entry.year}`)
        } catch (e) {
            console.error(`Failed to migrate year ${entry.year}:`, e)
        }
    }

    await prisma.$disconnect()
    console.log('Migration complete.')
}

migrate()
