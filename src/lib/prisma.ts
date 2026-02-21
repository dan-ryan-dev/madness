import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Lazy initialization to prevent crashes during build-time module imports
const getPrisma = () => {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return null as any;
    }
    if (!globalThis.prisma) {
        globalThis.prisma = prismaClientSingleton()
    }
    return globalThis.prisma
}

const prisma = getPrisma()

export default prisma
