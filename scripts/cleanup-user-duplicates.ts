import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const duplicateId = 'cmlzotdzc0000f5uhe54s66os' // kblair@wattrust.com (Double T)
    const activeId = 'cmlxzq5vu000oune99n5nqy5k'    // kblair@watrust.com (Single T)

    console.log('--- User Cleanup Starting ---')

    // 1. Delete the empty duplicate
    try {
        const deletedUser = await prisma.user.delete({
            where: { id: duplicateId }
        })
        console.log(`Successfully deleted empty duplicate: ${deletedUser.email}`)
    } catch (e: any) {
        console.error('Error deleting duplicate (it may already be gone):', e.message)
    }

    // 2. Normalize the active account name
    try {
        const updatedUser = await prisma.user.update({
            where: { id: activeId },
            data: {
                name: 'Kevin Blair' // Remove trailing space
            }
        })
        console.log(`Successfully normalized name for: ${updatedUser.email} -> "${updatedUser.name}"`)
    } catch (e: any) {
        console.error('Error updating active account:', e.message)
    }

    console.log('--- Cleanup Complete ---')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
