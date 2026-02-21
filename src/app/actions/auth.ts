"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createTransport } from "nodemailer"
import { v4 as uuidv4 } from "uuid"

// Transport setup for Nodemailer
const transporter = createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
})

export async function registerUser(prevState: any, formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    if (!email || !password) {
        return { success: false, message: "Email and password are required." }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
        return { success: false, message: "User already exists." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: "PLAYER",
            },
        })
        return { success: true, message: "Account created successfully. You can now sign in." }
    } catch (error) {
        console.error("Registration error:", error)
        return { success: false, message: "Something went wrong. Please try again." }
    }
}

export async function forgotPassword(prevState: any, formData: FormData) {
    const email = formData.get("email") as string

    if (!email) {
        return { success: false, message: "Email is required." }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        // We don't want to reveal if a user exists or not for security reasons
        return { success: true, message: "If an account exists with that email, a reset link has been sent." }
    }

    const token = uuidv4()
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    await prisma.passwordResetToken.upsert({
        where: { email_token: { email, token } },
        update: { token, expires },
        create: { email, token, expires },
    })

    const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    try {
        await transporter.sendMail({
            to: email,
            from: process.env.EMAIL_FROM,
            subject: "Reset your Madness 2026 Password",
            text: `Click the link to reset your password: ${resetLink}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                    <h2 style="color: #143278; text-align: center;">Madness 2026</h2>
                    <p>You requested a password reset for your Madness 2026 account.</p>
                    <p>Click the button below to set a new password. This link is valid for 1 hour.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #F58220; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        })

        return { success: true, message: "If an account exists with that email, a reset link has been sent." }
    } catch (error) {
        console.error("Forgot password error:", error)
        return { success: false, message: "Failed to send reset email. Please try again later." }
    }
}

export async function resetPassword(prevState: any, formData: FormData) {
    const token = formData.get("token") as string
    const password = formData.get("password") as string

    if (!token || !password) {
        return { success: false, message: "Token and password are required." }
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    })

    if (!resetToken || resetToken.expires < new Date()) {
        return { success: false, message: "Invalid or expired token." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await prisma.$transaction([
            prisma.user.update({
                where: { email: resetToken.email },
                data: { password: hashedPassword },
            }),
            prisma.passwordResetToken.delete({
                where: { id: resetToken.id },
            }),
        ])
        return { success: true, message: "Password updated successfully. You can now sign in." }
    } catch (error) {
        console.error("Reset password error:", error)
        return { success: false, message: "Something went wrong. Please try again." }
    }
}

export async function updateProfile(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized." }
    }

    const name = formData.get("name") as string
    const newPassword = formData.get("password") as string

    const updateData: { name?: string; password?: string } = {}
    if (name) updateData.name = name
    if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 10)
    }

    if (Object.keys(updateData).length === 0) {
        return { success: false, message: "No data to update." }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
        })
        return { success: true, message: "Profile updated successfully." }
    } catch (error) {
        console.error("Update profile error:", error)
        return { success: false, message: "Failed to update profile." }
    }
}
