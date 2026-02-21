import { UpsetCalculator } from "./UpsetCalculator"
import { Trophy, Users, Zap, Info } from "lucide-react"

export function HowItWorks() {
    return (
        <section className="w-full max-w-6xl mx-auto py-12 px-6 space-y-16">
            <div className="text-center space-y-8">
                <p className="text-xl text-brand-blue font-bold italic max-w-3xl mx-auto leading-relaxed">
                    &ldquo;Between the shock and awe of the Super Bowl and the incomparable atmosphere of a tradition unlike any other The Masters - comes the frenetic drama of the one shining moment - Krazy Kevy&apos;s March Madness&rdquo;
                </p>
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-brand-blue uppercase tracking-tight">HOW IT WORKS</h2>
                    <p className="text-xl text-gray-600 font-medium">The Madness Draft Pool: Forget Brackets. Draft Strategy.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
                <Step
                    number="1"
                    icon={<Users className="w-6 h-6" />}
                    title="The Draft"
                    description="Forget brackets. Here, you draft teams. In a classic snake draft, you and your group members will each select 8 teams from the field of 64. Once a team is drafted, they are yours—and only yours—for the entire tournament."
                />
                <Step
                    number="2"
                    icon={<Trophy className="w-6 h-6" />}
                    title="Progressive Scoring"
                    description="Every time one of your teams wins a game, you earn points. The further they go, the more each win is worth. Base points increase as the stakes get higher in the later rounds."
                />
                <Step
                    number="3"
                    icon={<Zap className="w-6 h-6" />}
                    title="The Upset Bonus"
                    description="This is where the game is won. To reward picking gutsy underdogs, we use a Seed Bracket system. If your team beats a team from a 'higher' bracket, you earn the difference in bracket points as a bonus."
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-brand-blue border-l-4 border-brand-orange pl-4 italic">
                            1. BASE SCORING
                        </h3>
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-left bg-white">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-black">
                                    <tr>
                                        <th className="px-6 py-4">Tournament Round</th>
                                        <th className="px-6 py-4">Points Per Win</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-bold text-brand-dark">
                                    <tr>
                                        <td className="px-6 py-4">Round of 64 & 32</td>
                                        <td className="px-6 py-4">1 Point</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4">Sweet 16 & Elite 8</td>
                                        <td className="px-6 py-4">2 Points</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4">Final Four & Championship</td>
                                        <td className="px-6 py-4 text-brand-orange">3 Points</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-brand-blue border-l-4 border-brand-orange pl-4 italic uppercase">
                            2. The Seed Brackets
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <BracketCard num="1" seeds="1-3" />
                            <BracketCard num="2" seeds="4-6" />
                            <BracketCard num="3" seeds="7-9" />
                            <BracketCard num="4" seeds="10-12" />
                            <BracketCard num="5" seeds="13-15" />
                            <BracketCard num="6" seeds="16" highlight />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-brand-blue border-l-4 border-brand-orange pl-4 italic uppercase">
                            3. The Math
                        </h3>
                        <div className="bg-brand-dark text-white p-8 rounded-2xl shadow-2xl space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap className="w-24 h-24" />
                            </div>
                            <div className="text-brand-orange font-black text-sm uppercase tracking-widest">The Formula</div>
                            <div className="text-xl md:text-2xl font-mono">
                                Total = Base + (Winner Bracket - Loser Bracket)
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Note: Bonus points only apply if the Winner's Bracket number is higher than the Loser's.
                                High risk, massive reward.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-brand-blue/20 p-6 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-brand-blue font-black uppercase text-sm">
                            <Info className="w-5 h-5" />
                            Pro-Tip: The Cinderella Run
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            Your <span className="font-bold">#14 Seed</span> (Bracket 5) upsets a <span className="font-bold">#3 Seed</span> (Bracket 1) in the First Round.
                        </p>
                        <div className="flex gap-4 items-center">
                            <div className="text-xs text-gray-500 font-bold">1 Base + 4 Bonus =</div>
                            <div className="text-2xl font-black text-brand-blue font-mono">5 POINTS</div>
                        </div>
                        <p className="text-xs text-brand-blue italic font-medium">
                            One upset can be worth as much as winning five standard games!
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                <div className="text-center">
                    <h3 className="text-3xl font-black text-brand-blue italic uppercase">Test the Math</h3>
                    <p className="text-gray-500 font-medium">Simulate any matchup to see your potential point haul.</p>
                </div>
                <UpsetCalculator />
            </div>
        </section>
    )
}

function Step({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="space-y-4 flex flex-col items-center text-center">
            <div className="relative">
                <div className="w-16 h-16 bg-brand-blue rounded-2xl flex items-center justify-center text-white transform rotate-3 hover:rotate-0 transition-transform shadow-lg">
                    {icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white font-black text-sm border-4 border-white">
                    {number}
                </div>
            </div>
            <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight">{title}</h3>
            <p className="text-gray-600 leading-relaxed text-sm font-medium">{description}</p>
        </div>
    )
}

function BracketCard({ num, seeds, highlight }: { num: string, seeds: string, highlight?: boolean }) {
    return (
        <div className={`p-4 rounded-xl border-2 ${highlight ? 'bg-orange-50 border-brand-orange' : 'bg-white border-gray-100'} flex flex-col items-center`}>
            <div className={`text-xs font-black uppercase ${highlight ? 'text-brand-orange' : 'text-gray-400'}`}>Bracket</div>
            <div className={`text-2xl font-black ${highlight ? 'text-brand-orange' : 'text-brand-blue'}`}>{num}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Seeds {seeds}</div>
        </div>
    )
}
