# Madness Draft Pool 2026 - Sprint 2.4 Walkthrough (The War Room)

I have successfully implemented the **Admin-Controlled Snake Draft** interface, allowing Group Admins to execute the draft on behalf of all players.

## Highlights

### 1. The "War Room" (`/groups/[id]/draft`)
A specialized interface designed for high-speed drafting:
-   **Left Sidebar**: Shows the **Snake Draft Order** (1-8, then 8-1). The current picker is highlighted in **Orange**.
-   **Main Board**: A dense, clickable grid of all 64 tournament teams.
    -   **Admin Controls**: Admins see "Assign Pick" buttons (Royal Blue) for *any* available team, identifying them as the "Commissioner".
    -   **Visuals**: Taken teams are "ghosted" (grayscale) to immediately show availability.
-   **Bottom Tray**: A sticky footer showing each player's roster progress (e.g., "3/8 teams filled") at a glance.

### 2. Admin Dashboard Integration (`/admin/groups`)
-   **Smart Links**:
    -   **"Play" Icon**: Links to the Draft Room if the draft is *In Progress*.
    -   **"Dashboard" Icon**: Links to the Group Dashboard if the draft is *Complete* (64 picks).
-   **Status Indicators**: Clearly shows "Not Started", "In Progress (X/64)", or "Complete".

### 3. Logic & Security
-   **Server-Side Validation**:
    -   Updated `pickTeam` action to allow Group Admins to bypass "turn" checks.
    -   **Sticky Picker Fix**: Ensured picks are recorded for the *Target Player* (the one on the clock), not the Admin clicking the button.
    -   **Transactional Integrity**: All pick operations (check turn -> check availability -> create pick) are wrapped in a database transaction to prevent race conditions.
-   **Dynamic Routing**:
    -   Moved from hardcoded `/draft` to dynamic `/groups/[GROUP_ID]/draft` and `/groups/[GROUP_ID]/dashboard`.

### 4. Group Dashboard (`/groups/[id]/dashboard`)
-   Displays all 8 rosters.
-   **Sorted by Draft Order**: Players are listed in the order they picked (Pick 1, Pick 2, etc.), matching the "Snake" sequence.

## Verification
1.  **Login as Admin**: Go to `/admin/groups`.
2.  **Enter War Room**: Click the "Play" icon for a group.
3.  **Execute Draft**:
    -   Click a team. Verify it assigns to Player 1.
    -   Click another. Verify it assigns to Player 2.
    -   Observe the "Snake" reversal at Pick 8 -> Pick 9.
4.  **Completion**: Once 64 picks are made, go back to Admin Dashboard and click the "Dashboard" icon to view the final rosters.
