import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const REGIONS = ['East', 'West', 'South', 'Midwest']
const TOURNAMENT_NAME = "Madness 2026"

async function main() {
    console.log(`Start seeding ...`)

    // 1. Create Tournament
    const tournament = await prisma.tournament.upsert({
        where: { name: TOURNAMENT_NAME },
        update: {},
        create: {
            name: TOURNAMENT_NAME,
            year: 2026,
            status: 'SETUP',
        },
    })
    console.log(`Created tournament: ${tournament.name}`)

    // 2. Create 64 Teams
    const teamsData = []
    for (const region of REGIONS) {
        for (let seed = 1; seed <= 16; seed++) {
            teamsData.push({
                name: `${region} State ${seed}`, // e.g., "East State 1"
                seed: seed,
                region: region,
                tournamentId: tournament.id,
            })
        }
    }

    for (const team of teamsData) {
        const t = await prisma.team.upsert({
            where: {
                tournamentId_name: {
                    tournamentId: team.tournamentId,
                    name: team.name,
                }
            },
            update: {},
            create: team,
        })
        console.log(`Created team: ${t.name} (${t.region} #${t.seed})`)
    }

    // 3. Create Hall of Fame Records
    console.log(`Seeding Hall of Fame...`)
    const hofData = [
        { year: 2025, winnerName: "Pat Allen", winningTeam: "Florida", totalPoints: 38, groupName: "Midwest" },
        { year: 2024, winnerName: "Trent Tillman", winningTeam: "Connecticut", totalPoints: 38, groupName: "San Francisco" },
        { year: 2023, winnerName: "Rand Smith", winningTeam: "Connecticut", totalPoints: 38, groupName: "Portland" },
        { year: 2022, winnerName: "Scott McGinty", winningTeam: "Kansas", totalPoints: 45, groupName: "Boulder" },
        { year: 2021, winnerName: "Dan Ryan", winningTeam: "Baylor", totalPoints: 38, groupName: "PoSpo" },
        { year: 2020, winnerName: "NA", winningTeam: "Covid", totalPoints: 0, groupName: "-" },
        { year: 2019, winnerName: "Kevin Blair?", winningTeam: "Virginia", totalPoints: 38, groupName: "-" },
        { year: 2018, winnerName: "Rand??", winningTeam: "Villanova", totalPoints: 38, groupName: "-" },
        { year: 2017, winnerName: "??", winningTeam: "North Carolina", totalPoints: 38, groupName: "-" },
        { year: 2016, winnerName: "??", winningTeam: "Villanova", totalPoints: 38, groupName: "-" },
        { year: 2015, winnerName: "??", winningTeam: "Duke", totalPoints: 38, groupName: "-" },
        { year: 2014, winnerName: "??", winningTeam: "Connecticut", totalPoints: 38, groupName: "-" },
        { year: 2013, winnerName: "??", winningTeam: "Louisville", totalPoints: 38, groupName: "-" },
        { year: 2012, winnerName: "??", winningTeam: "Kentucky", totalPoints: 38, groupName: "-" },
        { year: 2011, winnerName: "??", winningTeam: "Connecticut", totalPoints: 38, groupName: "-" },
        { year: 2010, winnerName: "??", winningTeam: "Duke", totalPoints: 38, groupName: "-" },
        { year: 2009, winnerName: "Matt Vail", winningTeam: "Connecticut", totalPoints: 38, groupName: "-" },
        { year: 2008, winnerName: "Mike Spears", winningTeam: "Kansas", totalPoints: 38, groupName: "-" },
        { year: 2007, winnerName: "Dave Harder", winningTeam: "Florida", totalPoints: 38, groupName: "Portland" },
        { year: 2006, winnerName: "Adam Beck", winningTeam: "Florida", totalPoints: 42, groupName: "-" },
    ]

    for (const entry of hofData) {
        await prisma.hallOfFame.upsert({
            where: { year: entry.year },
            update: entry,
            create: entry,
        })
    }

    console.log(`Seeding finished.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
