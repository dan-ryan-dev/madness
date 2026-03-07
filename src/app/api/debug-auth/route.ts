import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        const diagnosticInfo = {
            hasSession: !!session,
            session: session,
            env: {
                HAS_DATABASE_URL: !!process.env.DATABASE_URL,
                HAS_AUTH_SECRET: !!process.env.AUTH_SECRET,
                HAS_AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
                HAS_AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
                HAS_EMAIL_SERVER: !!process.env.EMAIL_SERVER_HOST,
                AUTH_URL: process.env.AUTH_URL,
                NEXTAUTH_URL: process.env.NEXTAUTH_URL,
                NEXT_PHASE: process.env.NEXT_PHASE,
                VERCEL_ENV: process.env.VERCEL_ENV,
                AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
            },
            timestamp: new Date().toISOString()
        }

        return NextResponse.json(diagnosticInfo)
    } catch (error: any) {
        return NextResponse.json({
            error: "Auth Diagnostic Failed",
            message: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
