# Sprint 4.4 Walkthrough: Leaderboard Enhancements

## Overview
Improved the Leaderboard experience with a more compact design, better navigation, and a full Global Standings view with filtering.

## Changes

### 1. Leaderboard Page (`/leaderboard`)
-   **Compact Layout**: Reduced padding to show more players "above the fold".
-   **Improved Row Design**: Moved Group Name to the right of the Player Name for better readability on mobile.
-   **Group Links**: Fixed the Group Name to link directly to `/groups/[id]/dashboard`.
-   **Global Filter**: Added a dropdown to filter the "Global Top 10" widget by specific groups.
-   **"See More" Link**: Added a link to the bottom of the Global widget pointing to the full `/leaderboard/global` page.

### 2. Global Leaderboard (`/leaderboard/global`)
-   **New Page**: Displays top 100 players globally.
-   **Filtering**: Includes the same Group Filter to narrow down the list.
-   **Design**: Reuses the compact row styling for consistency.

## Verification
-   [x] **Global Widget**:
    -   Verify top 10 list is compact.
    -   Verify Group Name links to dashboard.
    -   Test Group Filter -> List updates.
    -   Click "See Full Standings" -> Navigates to `/leaderboard/global`.
-   [x] **Global Page**:
    -   Verify list shows more than 10 players (if available).
    -   Test "Back to Standings" link.
