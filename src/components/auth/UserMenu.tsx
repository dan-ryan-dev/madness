import { auth } from "@/auth"
import Image from "next/image"
import { SignOut } from "./SignOut"
import Link from "next/link"
import { User, Shield } from "lucide-react"

export async function UserMenu() {
    const session = await auth()

    if (!session?.user) return null

    return (
        <div className="flex items-center gap-4 group relative">
            <div className="flex items-center gap-2 cursor-pointer">
                {session.user.image ? (
                    <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full border border-gray-200"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-blue">
                        <User className="w-4 h-4" />
                    </div>
                )}
                <span className="hidden md:inline font-medium text-sm text-white/90">
                    {session.user.name}
                </span>
            </div>

            {/* Dropdown - Simple CSS hover for MVP */}
            <div className="absolute top-full right-0 pt-2 w-48 hidden group-hover:block z-50">
                <div className="bg-white rounded-md shadow-lg border border-gray-100 py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {session.user.role.replace("_", " ")}
                        </p>
                    </div>

                    <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-orange"
                    >
                        Profile
                    </Link>

                    {session.user.role === "SUPER_ADMIN" && (
                        <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-orange flex items-center gap-2"
                        >
                            <Shield className="w-3 h-3" />
                            Admin Console
                        </Link>
                    )}

                    <div className="border-t border-gray-100 mt-1">
                        <SignOut />
                    </div>
                </div>
            </div>
        </div>
    )
}
