# Sprint 3.2 Refinement Part 2 Walkthrough: Round & Scoring Fixes

## Overview
Addressed specific requested refinements for round labeling, scoring consistency, and admin UI feedback.

## Changes

### 1. Round Labeling (`src/lib/constants.ts`)
-   Updated `ROUND_LABELS` to use specific names: "First Round (Round of 64)", "Sweet Sixteen", etc.
-   This removes ambiguity and ensures consistent display across Admin and Dashboard.

### 2. Admin UI Integrity (`src/components/admin/GameResultForm.tsx`)
-   **Auto-Refresh**: Added `router.refresh()` on successful submission.
-   **Elimination Sync**: This forces the Dropdowns to re-fetch, immediately removing the drop down options for the drop down eliminated team.

### 3. Scoring Logic (`src/app/actions/game.ts`)
-   **Centralized Logic**: Now imports `ROUND_POINTS` and `getSeedBracket` from `src/lib/scoring.ts` instead of redundant local logic.
-   **Immediate Elimination**: Confirmed that `prisma.team.update({ isEliminated: true })` happens within the transaction.

### 4. Dashboard Ticker (`src/components/dashboard/RecentTicker.tsx`)
-   **Seed Numbers**: Now displays seeds (e.g., `(10) Charleston DEF (7) BYU`).

## Verification
-   [x] **Round Names**: Verify "Sweet Sixteen" appears in Dropdown and Ticker.
-   [x] **Elimination**: Submit a game -> Verify loser immediately vanishes from dropdowns.
-   [x] **Scoring**: Verify points match the `scoring.ts` logic.
-   [x] **Seeds**: Verify seeds appear in the Recent Ticker.
