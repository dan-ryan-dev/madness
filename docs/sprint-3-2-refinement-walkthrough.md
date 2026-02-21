# Sprint 3.2 Refinement Walkthrough: Logic, Scoring & Revert

## Overview
Refined the game result recording process to prevent errors and added a "Revert" capability to undo mistakes.

## Changes

### 1. Scoring Logic & Revert (`src/app/actions/game.ts`)
-   **Validation**: Ensures Winner and Loser are different teams.
-   **Calculated Upset**: Implemented dynamic seed-based upset bonus (`Math.max(0, winnerBracket - loserBracket)`).
-   **Revert Action**: Added `revertGameResult` which:
    1.  Un-eliminates the loser.
    2.  Calculates points that *were* awarded.
    3.  Decrements scores for all users who picked the winner.
    4.  Deletes the game result record.

### 2. Admin UI (`/admin/tournaments/[id]/games`)
-   **Eliminated Filter**: The `GameResultForm` now only receives teams where `isEliminated: false`.
-   **Round Labels**: Used consistent "Round of 64", "Sweet 16", etc. labels via `ROUND_LABELS`.
-   **Revert Button**: Added a trash icon to recent results to trigger the revert action.

### 3. Shared Constants (`src/lib/constants.ts`)
-   Centralized round labeling logic.

## Verification
-   [x] **Points**: Record a result -> Check leaderboard score increments.
-   [x] **Elimination**: Record a result -> Loser disappears from dropdowns.
-   [x] **Revert**: Click Trash icon -> Result removed, loser reappears in dropdown, scores successfully decremented.
-   [x] **Labels**: Verified "Sweet 16" etc. appear correctly in tickers and feeds.
