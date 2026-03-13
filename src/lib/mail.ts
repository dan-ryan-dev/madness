import nodemailer from "nodemailer"
import { createHash, randomUUID } from "crypto"
import { getBaseUrl } from "./utils"

// Standardized transporter configuration
export const transporter = nodemailer.createTransport(
    (process.env.EMAIL_SERVER_HOST
        ? {
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        }
        : {
            jsonTransport: true,
        }) as any
)

/**
 * Generates a magic link and saves the verification token to the database.
 * This helper ensures that the token hashing logic is 100% consistent with Auth.js.
 */
export async function generateMagicLink(email: string, callbackUrl: string = "/onboarding") {
    // 1. Generate unique token
    const token = randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const host = getBaseUrl()
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || ""

    if (!secret) {
        console.warn("[Mail] WARNING: No AUTH_SECRET or NEXTAUTH_SECRET found. Magic links may fail verification.")
    }

    // 2. Hash token exactly as Auth.js v5 expects
    // Auth.js v5 uses sha256 with the secret appended to the token
    const hashedToken = createHash("sha256")
        .update(`${token}${secret}`)
        .digest("hex")

    // 3. Save to database using the global prisma instance
    // We assume prisma is available globally or can be imported
    // To avoid circular dependency, we use the global instance if possible, 
    // or import it here if we know the path.
    const prisma = (await import("@/lib/prisma")).default
    
    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token: hashedToken,
            expires: expires
        }
    })

    // 4. Construct the callback URL
    // Format: [host]/api/auth/callback/nodemailer?token=[token]&email=[email]&callbackUrl=[callbackUrl]
    const magicLink = `${host}/api/auth/callback/nodemailer?token=${token}&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`

    return { magicLink, token }
}
