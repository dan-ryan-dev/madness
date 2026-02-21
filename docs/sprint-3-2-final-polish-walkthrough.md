# Sprint 3.2 Final Polish Walkthrough: Round Locking & Filtering

## Overview
Implemented strict round management logic to prevent errors and improve the admin workflow. The "Manage Games" page now behaves like a focused tool for the specific round being played.

## Changes

### 1. Results by Round (`src/app/admin/tournaments/[id]/games/page.tsx`)
-   **URL Filtering**: The page now respects a `?round=X` query parameter.
-   **Filtered Feed**: The "Results for [Round Name]" box only shows games from the selected round.
-   **Empty State**: Shows "No results recorded for this round" if empty.

### 2. Smart Team Selection (`src/app/admin/tournaments/[id]/games/page.tsx`)
-   **Dropdown Logic**: The "Team A" and "Team B" dropdowns now **exclude** any team that has already won in the selected round.
-   **Workflow**: Once you record a win for a team in Round 1, they vanish from the Round 1 dropdowns but are available for Round 2.

### 3. Safety Validation (`src/app/actions/game.ts`)
-   **Server-Side Check**: `processGameResult` now explicitly checks if the `winnerId` has an existing `GameResult` in the current `round`.
-   **Error Message**: Returns "This team has already advanced from this round" if checked.

### 4. Form Sync (`src/components/admin/GameResultForm.tsx`)
-   **Round Sync**: Changing the "Round" dropdown immediately updates the URL (`router.push`) to filter the page.
-   **Auto-Refresh**: Continues to refresh the page on success to update the filtered lists.

## Verification
1.  **Select Round**: Go to "Round of 64". Verify URL is `?round=1`.
2.  **Record Win**: Team A beats Team B.
3.  **Verify Feed**: The game appears in the list.
4.  **Verify Dropdown**: Team A is no longer in the dropdown for "Round of 64".
5.  **Change Round**: Switch to "Round of 32". Verify feed is empty (or only shows R32 games) and Team A is available.
