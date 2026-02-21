import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { authConfig } from "./auth.config"
import prisma from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
            async sendVerificationRequest({ identifier: email, url }) {
                console.log(`[NextAuth] Login Link for ${email}: ${url}`)
            }
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
        async jwt({ token, user, trigger, session }) {
            // Merge with Edge logic
            if (user) {
                token.role = user.role
                token.id = user.id as string
            }

            // DB Check (Node only)
            if (!token.role && token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                })
                if (dbUser) {
                    token.role = dbUser.role as "SUPER_ADMIN" | "GROUP_ADMIN" | "PLAYER"
                    token.id = dbUser.id
                }
            }

            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as "SUPER_ADMIN" | "GROUP_ADMIN" | "PLAYER"
            }
            return session
        },
    },
})
