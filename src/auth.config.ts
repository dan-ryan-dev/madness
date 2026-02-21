import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [],
    callbacks: {
        // Simple pass-through for Edge. 
        // Real logic happens in auth.ts (Node) which writes the token.
        jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id as string
            }
            return token
        },
        session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string
                session.user.role = token.role as "SUPER_ADMIN" | "GROUP_ADMIN" | "PLAYER"
            }
            return session
        }
    },
    session: { strategy: "jwt" },
    pages: {
        signIn: "/auth/login",
    },
} satisfies NextAuthConfig
