import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: "SUPER_ADMIN" | "GROUP_ADMIN" | "PLAYER"
        } & DefaultSession["user"]
    }

    interface User {
        role: "SUPER_ADMIN" | "GROUP_ADMIN" | "PLAYER"
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: "SUPER_ADMIN" | "GROUP_ADMIN" | "PLAYER"
        id: string
    }
}
