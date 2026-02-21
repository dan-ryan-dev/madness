
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
    try {
        const teams = await prisma.team.count()
        const users = await prisma.user.count()
        const tournaments = await prisma.tournament.count()
        const groups = await prisma.group.count()
        const games = await prisma.gameResult.count()

        console.log('--- DATABASE DIAGNOSTIC ---')
        console.log('Tournaments:', tournaments)
        console.log('Teams:', teams)
        console.log('Users:', users)
        console.log('Groups:', groups)
        console.log('Games:', games)
        console.log('---------------------------')
    } catch (e) {
        console.error('Error querying DB:', e.message)
    } finally {
        await prisma.$disconnect()
    }
}

check()
