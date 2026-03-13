import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const tokens = await prisma.verificationToken.findMany({
        orderBy: { expires: 'desc' },
        take: 10
    })

    console.log('--- Verification Tokens ---')
    tokens.forEach(t => {
        const url = `http://localhost:3000/api/auth/callback/nodemailer?token=${t.token}&email=${encodeURIComponent(t.identifier)}`
        console.log({
            identifier: t.identifier,
            token: t.token,
            expires: t.expires,
            isExpired: t.expires < new Date(),
            testUrl: url
        })
    })

    const users = await prisma.user.findMany({
        where: { email: { contains: 'dan' } },
        select: { id: true, email: true, role: true }
    })
    console.log('\n--- Relevant Users ---')
    console.log(users)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
