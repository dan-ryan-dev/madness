# 🏀 Krazy Kevy's March Madness

A premium, high-stakes March Madness Draft Pool application. Forget conventional brackets—this app is built for a strategic draft-style competition with real-time scoring, live draft room functionality, and a dynamic leaderboard system.

## 🚀 Key Features

- **Dynamic Draft Room**: Real-time drafting system with round-tracking and automated pick ordering.
- **Live Scoring Hub**: Instant point calculations based on game results, regions, and seeds.
- **Intelligent Standings**: Global and group-level leaderboards with smart tie-breaker logic (NIT winner and final score guesses).
- **Admin Command Center**: Complete tournament management, team imports (CSV), and game result processing.
- **Multi-Tournament Support**: Built-in architecture to support historical seasons (2025) and active tournaments (2026) with scoped standings.

## 🛠 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with [Supabase](https://supabase.com/) & [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Auth.js (NextAuth.js)](https://authjs.dev/)
- **Styling**: Tailwind CSS & Lucide Icons
- **Deployment**: Optimized for [Vercel](https://vercel.com/)

## 📦 Getting Started

1. **Clone & Install**:
   ```bash
   git clone <your-repo-url>
   cd madness-2026
   npm install
   ```

2. **Environment Setup**:
   Create a `.env.local` file in the root directory and add your `DATABASE_URL`:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres"
   ```
   *Note: See [Architecture Guide](./docs/architecture.md) for project IDs.*

3. **Database Sync**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Dev**:
   ```bash
   npm run dev
   ```

## 📖 Documentation

- [**Architecture & Environments**](./docs/architecture.md) - How local/prod connect to Supabase.
- [**Workflow Guide**](./docs/workflow-guide.md) - How to deploy and manage schema changes.
- [**Prisma Schema**](./prisma/schema.prisma) - The core data model.

## 📈 Portfolio Highlights

This project demonstrates:
- **Full-Stack Architecture**: Complex data relationships between Tournaments, Groups, Teams, and Draft Picks.
- **Real-Time UI**: Responsive states for live draft synchronization.
- **Professional Deployment**: Integrated CI/CD workflows and secure admin-only server actions.

---
*Created with passion for the brackets—built for the draft.*
