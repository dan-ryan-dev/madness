"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Trophy, ChartBar, Shield, Star } from "lucide-react"

interface MobileNavProps {
    myGroupId: string | null | undefined
    isAdmin: boolean
}

export function MobileNav({ myGroupId, isAdmin }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-brand-orange transition-colors">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-brand-blue border-t border-brand-orange p-4 flex flex-col gap-4 shadow-xl z-50">
                    <Link
                        href="/leaderboard"
                        className="flex items-center gap-2 text-white hover:text-brand-orange py-2 font-bold"
                        onClick={() => setIsOpen(false)}
                    >
                        <ChartBar className="w-4 h-4" />
                        Leaderboard
                    </Link>

                    <Link
                        href="/hall-of-fame"
                        className="flex items-center gap-2 text-white hover:text-brand-orange py-2 font-bold"
                        onClick={() => setIsOpen(false)}
                    >
                        <Trophy className="w-4 h-4" />
                        Hall of Fame
                    </Link>

                    {myGroupId && (
                        <Link
                            href={`/groups/${myGroupId}/dashboard`}
                            className="flex items-center gap-2 text-white hover:text-brand-orange py-2 font-bold"
                            onClick={() => setIsOpen(false)}
                        >
                            <Star className="w-4 h-4" />
                            My Group
                        </Link>
                    )}

                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-white hover:text-brand-orange py-2 font-bold border-t border-white/10 pt-4 mt-2"
                            onClick={() => setIsOpen(false)}
                        >
                            <Shield className="w-4 h-4" />
                            Admin Console
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
