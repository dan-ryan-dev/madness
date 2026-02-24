import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    // Configuration - UPDATE THESE
    const email = "kblair@watrust.com" // Fixed typo (single T)
    const password = "madness"
    const name = "Kevin Blair"
    const role = "SUPER_ADMIN"

    console.log(`Setting up user: ${email}...`)

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: role,
                name: name
            },
            create: {
                email,
                password: hashedPassword,
                name,
                role: role
            }
        })

        console.log("-----------------------------------------")
        console.log("SUCCESS: User setup complete.")
        console.log(`ID: ${user.id}`)
        console.log(`Email: ${user.email}`)
        console.log(`Role: ${user.role}`)
        console.log("-----------------------------------------")
        console.log("You can now sign in at /auth/login")
    } catch (error) {
        console.error("ERROR: Failed to set up user:", error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
