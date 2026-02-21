import Link from 'next/link';
import { UserMenu } from '@/components/auth/UserMenu';
import { MobileNav } from '@/components/layout/MobileNav';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { Trophy, ChartBar, Shield, Star } from 'lucide-react';

export async function Navbar() {
    let session = null;
    let myGroupId = null;
    let isAdmin = false;
    let errorOccurred = false;

    try {
        if (!process.env.DATABASE_URL) {
            console.warn("Navbar: DATABASE_URL missing, skipping DB query.");
        } else {
            session = await auth();
            if (session?.user?.id) {
                const membership = await prisma.groupMembership.findFirst({
                    where: { userId: session.user.id },
                    orderBy: { joinedAt: 'asc' }
                });
                myGroupId = membership?.groupId;
            }
            isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'GROUP_ADMIN';
        }
    } catch (error) {
        console.error("Navbar Initialization Error:", error);
        errorOccurred = true;
    }

    return (
        <nav className="bg-brand-blue text-white p-4 sticky top-0 z-50 shadow-md backdrop-blur-md bg-opacity-90">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-xl font-black flex items-center gap-2 tracking-tighter hover:text-brand-orange transition-colors">
                        🏀 MADNESS
                    </Link>

                    {/* Desktop Center Links */}
                    <div className="hidden md:flex items-center gap-6 ml-4">
                        <Link
                            href="/leaderboard"
                            className="flex items-center gap-2 font-bold text-sm text-gray-200 hover:text-white transition-colors"
                        >
                            <ChartBar className="w-4 h-4 text-brand-orange" />
                            Leaderboard
                        </Link>

                        <Link
                            href="/hall-of-fame"
                            className="flex items-center gap-2 font-bold text-sm text-gray-200 hover:text-white transition-colors"
                        >
                            <Trophy className="w-4 h-4 text-brand-orange" />
                            Hall of Fame
                        </Link>

                        {myGroupId && (
                            <Link
                                href={`/groups/${myGroupId}/dashboard`}
                                className="flex items-center gap-2 font-bold text-sm text-gray-200 hover:text-white transition-colors"
                            >
                                <Star className="w-4 h-4 text-brand-orange" />
                                My Group
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {errorOccurred && (
                        <div className="text-[10px] bg-red-500/20 text-red-200 px-2 py-0.5 rounded border border-red-500/30 animate-pulse font-bold">
                            DB Error
                        </div>
                    )}
                    {/* Admin Link (Desktop) */}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="hidden md:flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-all border border-white/10"
                        >
                            <Shield className="w-3 h-3" />
                            Admin Console
                        </Link>
                    )}

                    {session ? (
                        <UserMenu />
                    ) : (
                        <div className="hidden md:block">
                            <Link href="/api/auth/signin" className="text-sm font-bold bg-brand-orange px-4 py-2 rounded hover:bg-orange-600 transition-colors">
                                Sign In
                            </Link>
                        </div>
                    )}
                    <MobileNav myGroupId={myGroupId} isAdmin={isAdmin} />
                </div>
            </div>
        </nav>
    );
}
