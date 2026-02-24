import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- User Audit (Detailed) ---')
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL)

    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    })

    // Filter in memory to avoid Prisma filter quirks
    const kblairUsers = users.filter(u =>
        u.email?.toLowerCase().includes('kblair') ||
        u.name?.toLowerCase().includes('kevin blair')
    )

    console.log(`Found ${kblairUsers.length} matching users:`)
    kblairUsers.forEach(u => {
        console.log({
            id: u.id,
            name: `"${u.name}"` + (u.name?.endsWith(' ') ? ' (has trailing space)' : ''),
            email: `"${u.email}"` + (u.email?.endsWith(' ') ? ' (has trailing space)' : ''),
            role: u.role,
            createdAt: u.createdAt
        })
    })

    // Check for exact email duplicates (if any)
    const emailCounts: Record<string, number> = {}
    users.forEach(u => {
        if (u.email) {
            const email = u.email.toLowerCase().trim()
            emailCounts[email] = (emailCounts[email] || 0) + 1
        }
    })

    const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1)
    if (duplicates.length > 0) {
        console.log('\n--- Duplicate Emails Found (normalized) ---')
        console.table(duplicates.map(([email, count]) => ({ email, count })))
    } else {
        console.log('\nNo normalized email duplicates found.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
