import Link from "next/link";
import { Trophy, Users, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <div className="space-y-6">
        <h1 className="text-6xl md:text-8xl font-black text-brand-blue tracking-tighter">
          MADNESS
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
          The ultimate draft-style tournament pool. No brackets, just strategy.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/leaderboard"
            className="bg-brand-orange text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-orange-600 transition-transform hover:scale-105 shadow-lg"
          >
            Leaderboard
          </Link>
          <Link
            href="/about"
            className="bg-white text-brand-blue border-2 border-brand-blue px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            How it Works
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-5xl w-full">
        <FeatureCard
          icon={<Users className="w-12 h-12 text-brand-blue" />}
          title="Draft Your Squad"
          description="Snake draft 8 teams with your friends. No busted brackets after day one."
        />
        <FeatureCard
          icon={<BarChart3 className="w-12 h-12 text-brand-orange" />}
          title="Live Scoring"
          description="Track points in real-time. Bonus points for upsets and Cinderella runs."
        />
        <FeatureCard
          icon={<Trophy className="w-12 h-12 text-brand-blue" />}
          title="Legendary Status"
          description="Compete for the title and a spot in the permanent Hall of Fame."
        />
      </div>
    </div>
  );
}


function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center space-y-4">
      <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
      <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
