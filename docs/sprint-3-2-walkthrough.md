# Sprint 3.2 Walkthrough: Game Results & Scoring Engine

## Overview
This sprint delivered the core functionality for running the tournament: recording game results and automatically updating player scores. We also built the public-facing Standings page to display the leaderboard.

## Key Features

### 1. Scoring Engine & Schema
- **Schema Updates**:
    - Added `isEliminated` (Boolean) to the `Team` model to track active status.
    - Added `score` (Int) to `GroupMembership` for performant leaderboard querying.
- **Automated Scoring (`processGameResult`)**:
    - A transactional Server Action that handles the entire flow:
        1. Records the `GameResult`.
        2. Marks the losing team as eliminated.
        3. Calculates points based on the round ($2^{\text{Round}-1}$).
        4. Updates the score for every user who drafted the winning team.

### 2. Admin Game Management
- **Game Entry Page (`/admin/tournaments/[id]/games`)**:
    - A dedicated "War Room" for admins to manage the live tournament.
    - **Game Result Form**: Select Round, Team A, and Team B.
    - **Smart Validation**: Dropdowns only show teams that are *not* eliminated, preventing errors.
    - **Recent History**: Displays a feed of recently recorded results.

### 3. Public Standings
- **Group Standings (`/groups/[id]/standings`)**:
    - A polished leaderboard showing Rank, Player, Teams Alive, and Total Score.
    - Sorts players by Score (descending), then by Teams Alive (descending).
    - Accessible via a new "View Standings" button on the Group Dashboard.
- **Global Redirect (`/standings`)**:
    - A convenience route that automatically redirects users to the standings of their most recent group.

## Files Created & Modified

### New Pages & Components
- `src/app/admin/tournaments/[id]/games/page.tsx`: Admin Game Entry page.
- `src/components/admin/GameResultForm.tsx`: Client form for recording results.
- `src/app/groups/[id]/standings/page.tsx`: Group Leaderboard.
- `src/app/standings/page.tsx`: Global redirect.
- `src/app/actions/game.ts`: Scoring logic Server Action.

### Key Updates
- `prisma/schema.prisma`: Schema enhancements.
- `src/app/admin/tournaments/page.tsx`: Added link to Game Management.
- `src/app/groups/[id]/dashboard/page.tsx`: Added link to Standings.

## Verification
1.  **Record a Game**: Go to `/admin/tournaments/[id]/games` and record a result (e.g., Round 1).
2.  **Verify Elimination**: Ensure the losing team no longer appears in the dropdowns.
3.  **Check Scores**: Go to `/groups/[id]/standings` and verify that any player who drafted the winner received 1 point.
