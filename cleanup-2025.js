const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function purge() {
    try {
        const tournamentName = "Madness 2025"
        const tournament = await prisma.tournament.findUnique({
            where: { name: tournamentName }
        })

        if (!tournament) {
            console.log(`Tournament "${tournamentName}" not found. skipping.`)
            return
        }

        console.log(`Found tournament: ${tournament.name} (${tournament.id})`)

        // Delete related records first due to constraints
        const teamsCount = await prisma.team.deleteMany({ where: { tournamentId: tournament.id } })
        console.log(`Deleted ${teamsCount.count} teams.`)

        const groups = await prisma.group.findMany({ where: { tournamentId: tournament.id } })
        for (const group of groups) {
            await prisma.draftPick.deleteMany({ where: { groupId: group.id } })
            await prisma.groupMembership.deleteMany({ where: { groupId: group.id } })
        }
        const groupsCount = await prisma.group.deleteMany({ where: { tournamentId: tournament.id } })
        console.log(`Deleted ${groupsCount.count} groups.`)

        const resultsCount = await prisma.gameResult.deleteMany({ where: { tournamentId: tournament.id } })
        console.log(`Deleted ${resultsCount.count} game results.`)

        await prisma.tournament.delete({ where: { id: tournament.id } })
        console.log(`Deleted tournament "${tournamentName}".`)

    } catch (e) {
        console.error('Purge failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

purge()
