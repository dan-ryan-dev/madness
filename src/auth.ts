import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { authConfig } from "./auth.config"
import prisma from "@/lib/prisma"

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

// Production Diagnostics
if (process.env.NODE_ENV === 'production') {
    console.log("[Auth] Production Node Version:", process.version);
    console.log("[Auth] NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    console.log("[Auth] AUTH_URL:", process.env.AUTH_URL);
    console.log("[Auth] VERCEL_URL:", process.env.VERCEL_URL);
    const hasSecret = !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
    console.log("[Auth] Has AUTH_SECRET:", hasSecret);
    if (!hasSecret) {
        console.error("[Auth] CRITICAL: AUTH_SECRET is missing in production!");
    }
    if (!process.env.EMAIL_SERVER_HOST) {
        console.warn("[Auth] EMAIL_SERVER_HOST is missing - Magic Links will NOT send.");
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    trustHost: true,
    adapter: isBuildTime ? undefined : PrismaAdapter(prisma) as any,
    providers: [
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST || "localhost",
                port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
                auth: {
                    user: process.env.EMAIL_SERVER_USER || "user",
                    pass: process.env.EMAIL_SERVER_PASSWORD || "pass",
                },
            },
            from: process.env.EMAIL_FROM || "noreply@example.com",
            ...(process.env.EMAIL_SERVER_HOST ? {} : {
                async sendVerificationRequest({ identifier: email, url }) {
                    console.log(`[NextAuth] Login Link for ${email}: ${url}`)
                }
            })
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "admin@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                })

                if (!user || !user.password) {
                    // Fallback for mock admin if DB user doesn't exist yet
                    if (credentials.email === "admin@example.com" && credentials.password === "admin") {
                        return {
                            id: "mock-admin-id",
                            name: "Super Admin",
                            email: "admin@example.com",
                            role: "SUPER_ADMIN" as const,
                            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
                        }
                    }
                    return null
                }

                const isPasswordCorrect = await require("bcryptjs").compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordCorrect) return null

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role as "SUPER_ADMIN" | "GROUP_ADMIN" | "PLAYER",
                    image: user.image,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile }) {
            console.log("[Auth] JWT Callback Start", {
                hasToken: !!token,
                hasUser: !!user,
                hasAccount: !!account,
                email: token.email
            });

            // Merge with Edge logic
            if (user) {
                console.log("[Auth] User found in callback", { id: user.id, role: user.role });
                token.role = user.role
                token.id = user.id as string
            }

            // DB Check (Node only)
            if (!token.role && token.email) {
                try {
                    console.log("[Auth] Falling back to DB for user role", { email: token.email });
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email },
                    })
                    if (dbUser) {
                        console.log("[Auth] User found in DB", { id: dbUser.id, role: dbUser.role });
                        token.role = dbUser.role as "SUPER_ADMIN" | "GROUP_ADMIN" | "PLAYER"
                        token.id = dbUser.id
                    } else {
                        console.warn("[Auth] User NOT found in DB");
                    }
                } catch (e) {
                    console.error("[Auth] DB Check failed", e);
                }
            }

            console.log("[Auth] JWT Callback End", { id: token.id, role: token.role });
            return token
        },
        async session({ session, token }) {
            console.log("[Auth] Session Callback Start", { hasToken: !!token });
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as "SUPER_ADMIN" | "GROUP_ADMIN" | "PLAYER"
            }
            console.log("[Auth] Session Callback End", { userId: session.user?.id });
            return session
        },
    },
})
