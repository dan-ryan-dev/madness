import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

async function migrate() {
    const devUrl = "postgresql://postgres:M%40ngotruck464@db.uhwszvkoukjtgjblsmms.supabase.co:5432/postgres"
    const prisma = new PrismaClient({
        datasources: { db: { url: devUrl } }
    })

    console.log("Loading data files...")
    const users = JSON.parse(fs.readFileSync('users_all.json', 'utf8'))
    const tourneys = JSON.parse(fs.readFileSync('tourney_2025.json', 'utf8'))
    const teams = JSON.parse(fs.readFileSync('teams_2025.json', 'utf8'))
    const groups = JSON.parse(fs.readFileSync('groups_2025.json', 'utf8'))
    const memberships = JSON.parse(fs.readFileSync('memberships_2025.json', 'utf8'))
    const results = JSON.parse(fs.readFileSync('results_2025.json', 'utf8'))
    const picks = JSON.parse(fs.readFileSync('picks_2025.json', 'utf8'))

    console.log("Mapping users by email...")
    const userMap: Record<string, string> = {} // Old ID -> New ID
    for (const u of users) {
        if (!u.email) continue
        const dbUser = await prisma.user.findUnique({ where: { email: u.email } })
        if (dbUser) {
            userMap[u.id] = dbUser.id
        } else {
            console.log(`Creating missing user: ${u.email}`)
            const newUser = await prisma.user.create({
                data: {
                    name: u.name,
                    email: u.email,
                    role: u.role
                }
            })
            userMap[u.id] = newUser.id
        }
    }

    console.log("Migrating Tournament...")
    const tourneyMap: Record<string, string> = {}
    for (const t of tourneys) {
        const dbT = await prisma.tournament.upsert({
            where: { name: t.name },
            update: { year: t.year, status: t.status },
            create: { name: t.name, year: t.year, status: t.status }
        })
        tourneyMap[t.id] = dbT.id
    }

    console.log("Migrating Teams...")
    const teamMap: Record<string, string> = {}
    for (const t of teams) {
        const dbTeam = await prisma.team.upsert({
            where: {
                tournamentId_name: {
                    tournamentId: tourneyMap[t.tournamentId],
                    name: t.name
                }
            },
            update: { seed: t.seed, region: t.region, isEliminated: !!t.isEliminated },
            create: {
                name: t.name,
                seed: t.seed,
                region: t.region,
                isEliminated: !!t.isEliminated,
                tournamentId: tourneyMap[t.tournamentId]
            }
        })
        teamMap[t.id] = dbTeam.id
    }

    console.log("Migrating Groups...")
    const groupMap: Record<string, string> = {}
    for (const g of groups) {
        const dbGroup = await prisma.group.create({
            data: {
                name: g.name,
                tournamentId: tourneyMap[g.tournamentId],
                adminId: userMap[g.adminId],
                createdAt: new Date(g.createdAt),
                updatedAt: new Date(g.updatedAt)
            }
        })
        groupMap[g.id] = dbGroup.id
    }

    console.log("Migrating Memberships...")
    for (const m of memberships) {
        await prisma.groupMembership.upsert({
            where: {
                userId_groupId: {
                    userId: userMap[m.userId],
                    groupId: groupMap[m.groupId]
                }
            },
            update: {
                role: m.role,
                score: m.score,
                draftPosition: m.draftPosition,
                finalScoreGuess: m.finalScoreGuess,
                nitWinnerGuess: m.nitWinnerGuess
            },
            create: {
                userId: userMap[m.userId],
                groupId: groupMap[m.groupId],
                role: m.role,
                score: m.score,
                draftPosition: m.draftPosition,
                finalScoreGuess: m.finalScoreGuess,
                nitWinnerGuess: m.nitWinnerGuess,
                joinedAt: new Date(m.joinedAt)
            }
        })
    }

    console.log("Migrating Game Results...")
    for (const r of results) {
        await prisma.gameResult.create({
            data: {
                tournamentId: tourneyMap[r.tournamentId],
                round: r.round,
                winnerId: r.winnerId ? teamMap[r.winnerId] : null,
                loserId: r.loserId ? teamMap[r.loserId] : null,
                createdAt: new Date(r.createdAt),
                updatedAt: new Date(r.updatedAt)
            }
        })
    }

    console.log("Migrating Draft Picks...")
    for (const p of picks) {
        await prisma.draftPick.create({
            data: {
                groupId: groupMap[p.groupId],
                userId: userMap[p.userId],
                teamId: teamMap[p.teamId],
                round: p.round,
                pickNumber: p.pickNumber,
                createdAt: new Date(p.createdAt)
            }
        })
    }

    await prisma.$disconnect()
    console.log("Migration finished successfully.")
}

migrate().catch(e => {
    console.error(e)
    process.exit(1)
})
