# Sprint 4.2 Walkthrough: Navigation & Unified Leaderboard

## Overview
This sprint focused on simplifying the application navigation and creating a premium "Unified Leaderboard" experience, acting as the new central hub for players.

## Changes

### 1. Navigation Refactor
-   **Simplified Navbar**: Removed "Draft" and "Dashboard" links.
-   **New Links**:
    -   **Leaderboard**: Points to the new global standings page.
    -   **My Group**: Dynamically links to the user's primary group dashboard.
-   **Mobile Nav**: Updated to match desktop parity, including dynamic group links and Admin Console access.

### 2. Unified Leaderboard (`/leaderboard`)
-   **Dual-Pane Layout**:
    -   **Left Pane (Global Standings)**: Displays the Top 10 players across *all* groups, fostering global competition.
    -   **Right Pane (Group Standings)**: Displays the full standings for the user's specific group.
-   **Data Logic**:
    -   Fetches `GroupMembership` sorted by `score` descending.
    -   Calculates "Teams Alive" dynamically for the group view.
-   **Design**:
    -   "Royal Blue" headers with "Basketball Orange" accents.
    -   Responsive design that stacks panels on mobile devices.

## Verification
-   [x] **Navigation**: Click "Leaderboard" -> Lands on `/leaderboard`.
-   [x] **My Group**: Logs in -> Click "My Group" -> Lands on `/groups/[id]/dashboard`.
-   [x] **Global Standings**: Verifies Top 10 list is populated.
-   [x] **Mobile View**: Verifies hamburger menu works and links are correct.

## Screenshots
*(Add screenshots here if applicable)*
