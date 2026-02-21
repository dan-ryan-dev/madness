# Sprint 3.2 Refinement Part 3 Walkthrough: UI Polish & Points Display

## Overview
Enhanced the Admin Console's "Recent Results" feed to display the calculated points awarded for each game. This provides immediate feedback to admins on how the scoring engine is interpreting the results.

## Changes

### 1. Admin Recent Results (`src/app/admin/tournaments/[id]/games/page.tsx`)
-   **Points Calculation**: Implemented on-the-fly score calculation using the centralized `scoring.ts` logic.
-   **Visual Display**: Added a "pill" below the game result showing:
    -   Total Points (e.g., "**3 pts awarded**")
    -   Breakdown (e.g., "(1 base + 2 upset)") only if an upset occurred.

## Verification
-   [x] **Points Display**: Verify that points appear correctly for standard games (e.g., 1 pt for R64).
-   [x] **Upset Breakdown**: Verify that strictly upset games show the breakdown (e.g., 1 base + X upset).
