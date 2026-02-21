import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Lazy Proxy to prevent ANY initialization during build-time module imports
const prisma = new Proxy({} as ReturnType<typeof prismaClientSingleton>, {
    get(target, prop, receiver) {
        // Skip initialization if we're in the build phase
        if (process.env.NEXT_PHASE === 'phase-production-build') {
            console.warn(`Prisma: Blocked access to "${String(prop)}" during build phase.`);
            return undefined;
        }

        if (!globalThis.prisma) {
            globalThis.prisma = prismaClientSingleton()
        }

        const value = Reflect.get(globalThis.prisma, prop, receiver);
        if (typeof value === 'function') {
            return value.bind(globalThis.prisma);
        }
        return value;
    }
});

export default prisma
