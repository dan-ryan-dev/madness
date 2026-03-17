# Post-MVP Feature Backlog

This document tracks planned improvements and feature requests for future development cycles after the 2026 Tournament Launch.

## 1. War Room Enhancements
- **Dynamic Sorting Toggle**: Implement a toggle in the Draft Room (War Room) to switch between:
    - **Alphabetical**: Standard A-Z list of available teams.
    - **Seed-Based**: Sort available teams by their tournament seed (Highest to Lowest).
- **Draft Status Indicator**: Clearer visual indicators for whose turn is next, especially for high-speed drafting.
- **Visual Bracket Overlay**: A visual representation of the tournament bracket that gets populated as teams are picked. This overlay would colorize teams and show the name of the player who drafted them, making it easy to see if a player has drafted teams that will knock each other out early in the tournament.
- **Drafted Team Visibility**: When a team is drafted, visually represent the team card moving to the bottom of the list. The card should clearly display the name of the person who drafted it.
- **Available Team Sorting**: Ensure that all remaining available teams automatically move to the top of the draft board and sort themselves clearly based on the selected sorting method (Alphabetical or Seed).

## 2. Live Player Participation
- **Player Draft Access**: Evaluate and implement access for users with the `PLAYER` role to enter the War Room.
- **Self-Selection**: Allow players to click and confirm their own picks live when it is their turn in the draft order.
- **Draft Notification System**: Real-time alerts (WebSockets/Push) when a player's turn is approaching.

## 3. Administration & Cleanup
- **Practice Group Auto-Cleanup**: Automated system to purge "Test" or "Practice" groups after a certain date or upon tournament start.
- **Bulk User Management**: Tools for Super Admins to manage large groups of users more efficiently (e.g., bulk role updates or password resets).
- **Force Password Change**: Implementation of a 'requirePasswordReset' flag for users, compelling them to set a new private password upon their first login after an admin-driven change.

## 4. Scoring Refinements
- **Late Group Logic**: Refine how groups created after the first round has started are scored, potentially including point penalties or restricted team pools.
- **Enhanced Leaderboards**: More granular filtering (e.g., by region, seed performance, or historical accuracy).
## 5. Tournament Lifecycle & Status Workflow

### Current State (2026)
Tournament status (`SETUP`, `DRAFTING`, `LIVE`, `COMPLETED`) exists in the schema and is displayed in the admin UI, but it is **not enforced** across the application. The only gates that exist are partial leaderboard visibility checks. This caused real bugs this year where group managers couldn't see leaderboard data because the tournament was still `SETUP` when the draft and scoring had already started.

**What works today:**
- Status is set to `SETUP` when a tournament is created
- Status is shown as a badge in the Admin Tournaments list
- Admin can manually change it via the Edit Tournament form
- The leaderboard partially gates data by `status === "LIVE"` (now fixed with a membership-based override for 2026)

**What does NOT work today — no enforcement exists for:**
- Creating new groups when the tournament is `LIVE` or `COMPLETED`
- Running the draft when the tournament is not in `DRAFTING`
- Scoring games when the tournament is `SETUP`
- Preventing access to the draft room when the tournament is `LIVE`
- Showing/hiding pages or CTAs based on status for regular users

### Design for Next Year

#### `SETUP`
- **Who sees it:** Admins only. Tournament is not visible on the public leaderboard or landing page.
- **What's allowed:** Team import, bracket setup, creating the tournament structure.
- **What's blocked:** Group creation, drafting, scoring.

#### `DRAFTING`
- **Who sees it:** Everyone — the tournament appears publicly so users can join groups.
- **What's allowed:** Group creation, inviting players, running the draft.
- **What's blocked:** Official scoring (teams cannot be eliminated yet).
- **UX:** Draft Room is accessible. Landing page shows "Draft Mode" CTA.

#### `LIVE`
- **Who sees it:** Everyone.
- **What's allowed:** Scoring, leaderboard updates, viewing results.
- **What's blocked:** New group creation, new draft picks, modifying existing picks.
- **UX:** Draft Room is locked with a "Tournament is Live" message. Landing page shows leaderboard CTA.

#### `COMPLETED`
- **Who sees it:** Everyone, archive/read-only.
- **What's allowed:** Viewing final standings, Hall of Fame eligibility.
- **What's blocked:** Everything mutating — no scores, no picks, no groups.
- **UX:** Banner "Tournament Concluded" across relevant pages.

### Implementation Requirements
- **Server Action Guards**: Each mutating action (`createGroup`, `savePick`, `recordScore`, etc.) should check tournament status before proceeding and return a descriptive error if blocked.
- **Page-Level Guards**: Draft page and group creation page should redirect or show a locked state based on status.
- **Admin Transition Warnings**: When an admin changes status (e.g., `DRAFTING` → `LIVE`), show a confirmation dialog explaining what will be locked.
- **Automatic Status Transitions** _(stretch goal)_: Consider auto-advancing from `DRAFTING` → `LIVE` when the first game score is recorded.

## 6. Auto-Draft Logic
- **Smart Auto-Picks**: Build an algorithm for missing players or quick drafts:
    - **Seed Priority**: Default to the highest available seed.
    - **Bracket Conflict Check**: Double-check that the auto-picked team is not scheduled to play against a team already on the player's roster in the upcoming round.
    - **Diversity Logic**: Ensure even distribution across regions if seeds are tied.

## 7. External Integrations & Betting
- **Polymarket Integration**: Explore API integration with Polymarket to show live odds for tournament winners or specific game outcomes directly within the app (Leaderboard or Group Dashboards).
- **Contextual Betting**: Provide direct links to specific prediction markets based on active tournament matchups or team performance.

## 8. Engagement Notifications & Live Alerts
Increase player engagement during the tournament with real-time and push notifications tied to game results.

- **Game Start Alerts**: Notify players when a team they drafted is about to tip off (e.g., "🏀 Your team Gonzaga tips off in 15 minutes!").
- **Result Notifications**: After a game ends, send a personalized result to each affected player:
    - Win: "🎉 Gonzaga won! You earned 4 points and moved up 3 spots."
    - Loss: "💀 Gonzaga was eliminated. You still have 5 teams alive."
    - Upset win: "🚨 Biggest Upset Yet! You picked the #13 seed to beat Arkansas — you're the only one in your group who saw that coming!"
- **Upset Broadcasts**: When a major upset occurs, flash an app-wide or group-wide alert for all players who had that team, surfacing the shared excitement (e.g., a banner: "UPSET ALERT 🔥 — Villanova just took down #1 Duke!").
- **Group Milestone Alerts**: Notify group members when someone takes the lead or when standings shift dramatically after a round.
- **Delivery Channels**:
    - **In-App**: Toast/banner notifications while browsing the site (WebSocket or polling).
    - **Email**: Digest-style summary after each round completes.
    - **Push Notifications** _(stretch goal)_: Browser push notifications via Web Push API for mobile-friendly alerts.
- **Opt-In Controls**: Players should be able to configure which notification types they receive via their profile settings.
