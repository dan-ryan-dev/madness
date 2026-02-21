# Madness Draft Pool 2026 - Sprint 1 Walkthrough (MVP Setup)

I have successfully scaffolded the Next.js application, set up the database schema, and implemented the core MVP feature stubs.

## Highlights
- **Tech Stack**: Next.js 14, Tailwind CSS v4, Prisma (SQLite), TypeScript.
- **Database**: Schema defined with `User`, `Tournament`, `Team`, `Group`, `DraftPick`, and `GameResult` models. Migration applied to `dev.db`.
- **Styling**: Configured brand colors (Basketball Orange, Royal Blue) in Tailwind theme.
- **Layout**: Implemented `BaseLayout` and responsive `Navbar`.
- **Features**:
  - **Splash Page**: Landing page with hero section.
  - **Admin Dashboard**: Stubbed interface for managing tournaments.
  - **Draft Interface**: Stubbed snake draft UI.
  - **User Dashboard**: Stubbed view for rosters and standings.
- **Legacy Logic**: Ported scoring logic (including upset bonuses) to `src/lib/scoring.ts`.

## Verification
- Run `npm run dev` to see the app in action.
- Visit `http://localhost:3000` for the Splash Page.
- Visit `http://localhost:3000/admin`, `/draft`, and `/dashboard` to see the feature stubs.
- Run `npx prisma studio` to inspect the database.

## Next Steps (Sprint 2)
- Implement authentication (e.g., Supabase or NextAuth).
- Connect the UI stubs to the database.
- Implement the actual draft logic.
