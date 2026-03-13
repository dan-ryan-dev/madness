# Post-MVP Feature Backlog

This document tracks planned improvements and feature requests for future development cycles after the 2026 Tournament Launch.

## 1. War Room Enhancements
- **Dynamic Sorting Toggle**: Implement a toggle in the Draft Room (War Room) to switch between:
    - **Alphabetical**: Standard A-Z list of available teams.
    - **Seed-Based**: Sort available teams by their tournament seed (Highest to Lowest).
- **Draft Status Indicator**: Clearer visual indicators for whose turn is next, especially for high-speed drafting.

## 2. Live Player Participation
- **Player Draft Access**: Evaluate and implement access for users with the `PLAYER` role to enter the War Room.
- **Self-Selection**: Allow players to click and confirm their own picks live when it is their turn in the draft order.
- **Draft Notification System**: Real-time alerts (WebSockets/Push) when a player's turn is approaching.

## 3. Administration & Cleanup
- **Practice Group Auto-Cleanup**: Automated system to purge "Test" or "Practice" groups after a certain date or upon tournament start.
- **Bulk User Management**: Tools for Super Admins to manage large groups of users more efficiently (e.g., bulk role updates or password resets).

## 4. Scoring Refinements
- **Late Group Logic**: Refine how groups created after the first round has started are scored, potentially including point penalties or restricted team pools.
- **Enhanced Leaderboards**: More granular filtering (e.g., by region, seed performance, or historical accuracy).
## 5. Tournament Lifecycle & Statuses
- **Status Definitions**: Formally define system behavior based on `TournamentStatus`:
    - **`SETUP`**: Internal preparation. Visibility restricted to Admins.
    - **`DRAFTING`**: Groups can be created and drafts can be run. If a group is added after scores have been recorded (e.g., scoring starts early), the group should automatically synchronize with existing scores.
    - **`LIVE`**: Drafts are locked. Groups can no longer be created or modified for this tournament. Scoring is ongoing.
    - **`COMPLETED`**: Final standings locked. Archive view only.
- **State Enforcement**: Implementation of guards to prevent drafting actions once a tournament moves to `LIVE`.

## 6. Auto-Draft Logic
- **Smart Auto-Picks**: Build an algorithm for missing players or quick drafts:
    - **Seed Priority**: Default to the highest available seed.
    - **Bracket Conflict Check**: Double-check that the auto-picked team is not scheduled to play against a team already on the player's roster in the upcoming round.
    - **Diversity Logic**: Ensure even distribution across regions if seeds are tied.

## 7. External Integrations & Betting
- **Polymarket Integration**: Explore API integration with Polymarket to show live odds for tournament winners or specific game outcomes directly within the app (Leaderboard or Group Dashboards).
- **Contextual Betting**: Provide direct links to specific prediction markets based on active tournament matchups or team performance.
