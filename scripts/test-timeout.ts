import { createGroupWithPlayers } from '../src/app/actions/group'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Starting test group creation...")
    const start = Date.now()
    
    // We need to mock auth() from the server action. 
    // Wait, the action expects auth() to return a session. Since we are in a node script out of context, it will fail.
    // I should just use the exact logic of the transaction in the script to test the timing.
    
    console.log("Testing transaction time...")
    
    const tournament = await prisma.tournament.findFirst()
    const adminUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } })
    
    if (!tournament || !adminUser) throw new Error("Missing basics")
    
    const players = Array.from({length: 8}, (_, i) => ({
        name: `Automated Player ${i}`,
        email: `test${i}@madness.com`
    }))
    
    try {
        const txResult = await prisma.$transaction(async (tx) => {
            const group = await tx.group.create({
                data: {
                    name: "Performance Test Group",
                    tournamentId: tournament.id,
                    adminId: adminUser.id,
                }
            })
            
            const playersToEmail = []
            for (let i = 0; i < players.length; i++) {
                const player = players[i]
                let user = await tx.user.findUnique({ where: { email: player.email } })
                let isExisting = true
                if (!user) {
                    isExisting = false
                    user = await tx.user.create({
                        data: { name: player.name, email: player.email, role: "PLAYER" }
                    })
                }
                
                await tx.groupMembership.create({
                    data: {
                        userId: user.id,
                        groupId: group.id,
                        role: "MEMBER",
                        draftPosition: i + 1
                    }
                })
                playersToEmail.push({ email: player.email, name: player.name, isExisting })
            }
            return { group, playersToEmail }
        }, { timeout: 15000, maxWait: 15000 })
        
        const end = Date.now()
        console.log(`Transaction success inside ${end - start}ms!`)
        console.log(`Mocking magic link generation for ${txResult.playersToEmail.length} users...`)
        
    } catch(err) {
        console.error("Test failed:", err)
    }
}

main()
