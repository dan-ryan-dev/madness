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
