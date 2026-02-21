import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
    const isDraftRoute = req.nextUrl.pathname.startsWith("/draft")
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard")

    // Allow auth routes
    if (isAuthRoute) {
        return NextResponse.next()
    }

    // Redirect unauthenticated users
    if (!isLoggedIn && (isAdminRoute || isDraftRoute || isDashboardRoute)) {
        return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl))
    }

    // Role-based access control
    if (isLoggedIn && isAdminRoute) {
        const userRole = req.auth?.user?.role
        if (userRole !== "SUPER_ADMIN") {
            // Redirect unauthorized users to dashboard
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
        }
    }

    return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
