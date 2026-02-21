# Madness Draft Pool 2026 - Sprint 2.1 Walkthrough (Mock Data & Draft Foundations)

I have successfully implemented the database seeding, draft logic, and admin setup tools.

## Highlights
- **Database Seeding**:
  - Created `prisma/seed.ts` script.
  - Configured `npx prisma db seed` in `package.json`.
  - Populated DB with **64 Mock Teams** (seeds 1-16 in East, West, South, Midwest) and a "Madness 2026" Tournament.
- **Draft Logic**:
  - Created `src/lib/draft-logic.ts`.
  - Implemented `getCurrentPicker(pickNumber, totalPlayers)` using the standard **Snake Draft** algorithm (1-10, 10-1, etc.).
- **Admin Tools**:
  - Created Protected Route: `/admin/setup` (Accessible only to Super Admins).
  - Implemented **Reset Draft** Server Action to clear all draft picks.

## Verification
- **Check Seeding**: Run `npx prisma studio` and verify 64 rows in the `Team` table.
- **Check Admin UI**: 
  1. Log in as Super Admin.
  2. Navigate to `/admin/setup`.
  3. Verify the "Reset Draft" button is visible and functional.

## Changes
- `prisma/seed.ts`: New file.
- `package.json`: Added `prisma.seed` config and `ts-node` dependency.
- `src/lib/draft-logic.ts`: New file.
- `src/app/admin/setup/page.tsx`: New file.
- `src/app/actions/admin.ts`: New file.

## Next Steps (Sprint 2.2)
- **The Draft Room**:
  - Connect the Draft UI (`/draft`) to the live `Team` data.
  - Implement real-time picking logic.
