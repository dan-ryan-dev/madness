import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'dan.ryan@tablebrick.com'
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            memberships: {
                include: {
                    group: {
                        include: {
                            tournament: true
                        }
                    }
                }
            }
        }
    })

    if (user) {
        console.log(`--- User Stats: ${user.name} (${user.email}) ---`)
        console.log('ID:', user.id)
        console.log('Role:', user.role)
        console.log('Memberships:', user.memberships.length)
        user.memberships.forEach((m: any) => {
            console.log(`  - Group: ${m.group.name} (${m.groupId})`)
            console.log(`    Tournament: ${m.group.tournament.name} (${m.group.tournamentId})`)
            console.log(`    Status: ${m.group.tournament.status}`)
        })
    } else {
        console.log('User not found')
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
