import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const ids = ['cmlxzq5vu000oune99n5nqy5k', 'cmlzotdzc0000f5uhe54s66os']

    for (const id of ids) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                memberships: true,
                administeredGroups: true,
                draftPicks: true
            }
        })

        if (user) {
            console.log(`--- User Stats: ${user.name} (${user.email}) ---`)
            console.log('ID:', user.id)
            console.log('Memberships:', user.memberships.length)
            console.log('Administered Groups:', user.administeredGroups.length)
            console.log('Draft Picks:', user.draftPicks.length)
            console.log('\n')
        }
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
