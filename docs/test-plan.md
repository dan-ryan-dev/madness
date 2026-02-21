# Madness 2026 - Production Test Plan

This plan ensures the application is reliable, data-driven, and free of mock data lingering from the prototype phase.

## 1. Data Integrity & Mock Data Purge
**Goal**: Confirm the system is strictly driven by the database and no 2025 data remains.

- [ ] **Verify Clean Slate**: Ensure `Tournament` table only contains 2026 entries.
- [ ] **String Search**: Run `grep -rn "2025" .` and `grep -rn "Kansas" src` (should return 0 source code hits).
- [ ] **Prisma Singleton**: Check `src/lib/prisma.ts` is the *only* place `new PrismaClient()` is called.

## 2. Empty State & Initialization (The "New Season" Flow)
**Goal**: Smooth experience for the first admin login of the season.

- [ ] **Empty DB State**: Temporary rename `dev.db` to trigger the empty state.
- [ ] **Admin Dashboard**: Verify "No 2026 Tournament Found" message appears.
- [ ] **Initialize Button**: Click "Initialize" and verify it redirects to `/admin/tournaments/new`.
- [ ] **Create Flow**: Complete tournament creation and verify it appears in the list immediately.

## 3. Core Workflow: Draft & Results
**Goal**: Verify the "Happy Path" for active tournament management.

- [ ] **Bulk Import**: Import a 64-team CSV and verify seeds/regions are correct.
- [ ] **The War Room**: Execute a partial draft and verify "Taken" status persists after refresh.
- [ ] **Result Entry**: Record a Round 1 win. Verify points calculate correctly (Base: 1 + Upset Bonus).
- [ ] **Result Revert**: Revert a game and verify the winner returns to the "Available" dropdown.

## 4. Security & Roles (RBAC)
**Goal**: Ensure limited access to administrative tools.

- [ ] **Super Admin Only**: Verify `/admin/setup` and `/admin/tournaments` redirect non-admins.
- [ ] **Group Admin**: Verify they can only access the "War Room" for their assigned group.
- [ ] **Player Access**: Verify players can see the leaderboard and their own roster but cannot submit scores.

---
> [!TIP]
> Use `npx prisma studio` to monitor table state in real-time during these tests.
