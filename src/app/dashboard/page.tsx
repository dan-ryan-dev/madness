import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Dashboard() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/api/auth/signin");
    }

    // Auto-redirect to the first group if it exists
    const membership = await prisma.groupMembership.findFirst({
        where: { userId: session.user.id }
    });

    if (membership) {
        redirect(`/groups/${membership.groupId}/dashboard`);
    }

    // Final fallback if no groups exist
    redirect("/");

    // The rest of this is now essentially dead code, but kept for future reference if we want a global dash
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-brand-blue">My Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-brand-dark flex items-center gap-2">
                        My Roster <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">8 Teams</span>
                    </h2>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-8 text-center text-gray-500">
                            Draft has not started yet.
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-brand-dark">Standings</h2>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm">
                                <tr>
                                    <th className="p-3 font-medium">Rank</th>
                                    <th className="p-3 font-medium">Player</th>
                                    <th className="p-3 font-medium text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[1, 2, 3].map((i) => (
                                    <tr key={i}>
                                        <td className="p-3 text-gray-500">{i}</td>
                                        <td className="p-3 font-medium">Player {i}</td>
                                        <td className="p-3 text-right font-mono">0</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
