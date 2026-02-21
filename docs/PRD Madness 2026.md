# Product Requirements Document (PRD)

### **Product Requirements Document (PRD): Madness Draft Pool 2026**

**Version:** 2.0 (Prototype Specification for Lovable/Vercel V0)

**Role:** Sr. Product Manager

**Platform Focus:** Low-code/Next.js/React (Lovable, Vercel V0)

---

## 1\. Product Overview

**Product Name (Working):** March Madness Draft Pool

**Summary:**  
A web-based, mobile-responsive application that enables casual friend groups to run an NCAA Men's Basketball March Madness *draft-style* tournament pool. The product replaces spreadsheet-based administration with automated scoring, real-time standings, and an intuitive draft experience, dramatically reducing admin burden and increasing participant engagement.

The product is designed as a portfolio-quality demonstration of end-to-end product management, from structured requirements through MVP launch, with a clear path to future automation and scale.  The product is intended to be usedIn March with 64 to 128 Players 

## 2\. Goals & Success Criteria

**Primary Goals**

* Eliminate manual spreadsheet management for draft pools  
* Increase participant engagement via mobile-friendly, real-time access  
* Streamline the Draft process and save time for the group Admins   
* Showcase strong product management fundamentals (PRD, user flows, metrics, MVP scoping)

**Success Criteria (MVP)**

* Successfully run a full March Madness tournament cycle with real users  
* Admin time reduced from 3–5 hours to \<30 minutes total  
* 90%+ of participants check standings at least once per tournament round  
* Zero scoring errors reported

## 3\. Target Users

**Primary Users**

**Casual friend groups** running March Madness pools

**User Personas**

**3.1. Super Admin**

* Sets up the tournament structure and teams and fees  
* Sets up group admins  
* Scores the tournament  
* Oversees multiple groups (groups)  
* Wants reliability and minimal maintenance

**3.2. Group Admin**

* Runs one or more groups  
* Organizes players via text/group chat  
* Invites users using the tool  
* Wants fast setup, easy draft management, and zero manual scoring

**3.3. Participant (Player)**

* Drafts teams and competes for points  
* Primarily mobile user  
* Wants instant access to rosters, scores, and standings

## 4\. Problem Statement

Friend groups currently manage March Madness draft pools using spreadsheets, creating:

* Heavy administrative burden (manual roster entry, game tracking, scoring)  
* Poor mobile accessibility and engagement  
* High risk of scoring errors  
* Reduced willingness to run pools year over year

The lack of a purpose-built, mobile-friendly tool turns a social, competitive experience into an operational chore.

## 5\. Key Use Cases, User Stories & User Experiences

### 5.1 Admin Stories

* As a Super Admin, I want to create the tournament annually so all groups share the  same bracket.  
* As a Super Admin, I want to score the tournament with 100% accuracy  
* As a Super Admin, I want to see the winners of each group and overall  
* As a Group Admin, I want to easily create a group and invite players.  
* As a Group Admin, I want to run a live or remote snake draft without manual tracking.  
* As a Group Admin, I want game results to automatically update scores (or be entered manually).  
* As a Group Admin I want the instructions to be simple and available on the screens

### 5.2 Player Stories

* As a player, I want to see my roster and points instantly.  
* As a player, I want to check standings anytime on mobile.  
* As a player, I want to know when my team wins a game via the app or a push text.

### 5.3 The Player Journey \- First Arrival

**Splash Page:** A high-energy "Madness 2026" landing page featuring a "Quick Sign-In" (Magic Link or Google Auth).  
**User Dashboard (The Home Screen):** Once logged in, the player sees:

* **My Pods:** A list of active groups they are competing in.  
* **My Roster:** A quick-view card of their 8 drafted teams and their current status (In/Out).  
* **The Widget:** A "sticky" component on the right (desktop) or bottom (mobile) showing the **Global Top 10**. This drives the "bragging rights" engagement goal in the PRD..

### 5.4 Group Admin: The Draft Orchestrator

The Group Admin facilitates the "emotional core" of the tool: the Snake Draft.

* **Draft Setup:** Admin randomizes the player list to create the 8-round snake sequence.  
* **Live Admin-Assisted Draft Screen:**  
  * **Left Pane (The Players):** Displays the current "On the Clock" player and the upcoming pick order.  
  * **Right Pane (The Teams):** A searchable grid of all 64 teams.  
  * **The Action:** Admin clicks a player $\\rightarrow$ clicks a team $\\rightarrow$ **Confirm Pick**.  
  * **Real-Time Diminishing Returns:** As teams are drafted, they are instantly "dimmed" and disabled globally via a database-level uniqueness constraint.

### 6.3 Security & Role-Based Logic

6.3.1 Authentication

* **Authentication:** Integration with Supabase Auth (common for Lovable).  
* **Conditional Rendering:** \* If `User.role == 'GroupAdmin'`, show the **"Add Group"** button.  
  * If `User.role == 'Player'`, show the **"View My Roster"** and **"Standings"** tabs only.  
  * On Admin Screen If `User.role == 'SuperAdmin'`, show all buttons (Create Tournament, Create Group, Group Admins, Scoring.  
* 6.3.1 

**Forgot Password:** Standard implementation via a "Reset Password" email that sends a secure token.

**Forgot Username:** Since your system uses **Email** as the primary identifier, a "Forgot Username" isn't strictly necessary—the email *is* the username.  

**Google Auth (OAuth):** To further reduce friction, you can allow players to sign in with Google. If their Google email matches the email the Admin entered, they are automatically linked to their drafted teams

---

## 6\. Functional Requirements (MVP)

**6.1 Admin Tab \- Tournament & Pool Setup**

* Create NCAA 64-team tournament structure  
* Play in games must be represented as 2 teams e.g. Iona/Michigan because the tournament must start before the play in games are finished and the field must be \= 64 teams  
* Support multiple groups tied to the same tournament  
* Role-based access: Super Admin, Group Admin, Player

**6.2 Admin Tab \- Group Management**

* Create/edit groups  
* Assign Group Admins  
* Add players manually (name \+ email)  
* Search for players that were entered the year before and are in the database

**6.3 Admin \- Draft Experience**

* Snake draft logic (8 players x 8 rounds)  
* Draft board with available teams  
* Live draft state (current pick, upcoming picks)  
* Manual pick selection by admin or player (MVP)

#### **Group Admin: The Draft Orchestrator**

The Group Admin facilitates the "emotional core" of the tool: the Snake Draft.

* **Draft Setup:** Admin randomizes the player list to create the 8-round snake sequence.  
* **Live Admin-Assisted Draft Screen:**  
  * **Left Pane (The Players):** Displays the current "On the Clock" player and the upcoming pick order.  
  * **Right Pane (The Teams):** A searchable grid of all 64 teams.  
  * **The Action:** Admin clicks a player $\\rightarrow$ clicks a team $\\rightarrow$ **Confirm Pick**.  
  * **Real-Time Diminishing Returns:** As teams are drafted, they are instantly "dimmed" and disabled globally via a database-level uniqueness constraint.

### Logic

#### **The "Snake Draft" Interactive Component**

To make the Group Admin’s life easier, this module must handle the "diminishing list" logic.

* **State Management:** Create a remainingTeams state that filters out any TeamID present in the DraftPicks table.  
* **Pick Logic:** \* **Round 1:** Player 1→8.  
  * **Round 2:** Player 8→1.  
  * **Logic formula:** If Round is Even, Direction \= Reverse; If Round is Odd, Direction \= Forward.  
* **UI Layout:** \* **Left Column:** A "Queue" showing the current picker in **Basketball Orange** and the next 3 pickers in **Light Gray**.  
  * **Right Column:** A searchable grid of Team Cards. When a card is clicked, it triggers a "Confirm Selection" modal to prevent "fat-finger" errors on mobile.

**6.4 Admin Tab \- Scoring System**

Points are awarded to a player whenever one of their 8 drafted teams wins a game. Scoring rewards both tournament progression and upset victories based on seed brackets.

**Base Points by Tournament Round:**

| Tournament Round | Points Per Win |
| ----- | ----- |
| First Round (Round of 64\) | 1 Point |
| Second Round (Round of 32\) | 1 Point |
| Sweet Sixteen | 2 Points |
| Elite Eight | 2 Points |
| Final Four | 3 Points |
| Championship Game | 3 Points |

**Upset Bonus Points (Bracket System)**

In addition to base win points, upset bonus points are awarded when a lower-seeded team defeats a higher-seeded team.

**Seed Brackets**

Teams are grouped into six seed brackets:

| Bracket | Seeds |
| ----- | ----- |
| Bracket 1 | Seeds 1-3 |
| Bracket 2 | Seeds 4-6 |
| Bracket 3 | Seeds 7-9 |
| Bracket 4 | Seeds 10-12 |
| Bracket 5 | Seeds 13-15 |
| Bracket 6 | Seed 16 |

**Upset Rules**

* An upset occurs when a team from a lower bracket number defeats a team from a higher bracket number.  
* 1 bonus point is awarded for each bracket jumped.  
* No upset points are awarded when a higher-seeded team defeats a lower-seeded team.

**Examples**

* A \#10 seed (Bracket 4\) defeats a \#7 seed (Bracket 3\) in Round 1:  
  * 1 point for the win  
  * 1 upset bonus point (jumped 1 bracket)  
  * Total: 2 points  
* A \#16 seed (Bracket 6\) defeats a \#1 seed (Bracket 1\) in Round 1:  
  * 1 point for the win  
  * 5 upset bonus points (jumped 5 brackets)  
  * Total: 6 points  
* A \#2 seed (Bracket 1\) defeats a \#15 seed (Bracket 5):  
  * 1 point for the win  
  * 0 upset bonus points  
  * Total: 1 point

**6.5 Tie-Breaker Rules (Applied in Order)**

1. Picking the **NIT Tournament Winner**  
2. **Primary tie-breaker** (Unique legacy rule used by the group historically, captured during Selection Sunday / tournament setup)  
3. **Total Combined Points Scored in the NCAA Championship Game** (Closest prediction wins, used only if the NIT tie-breaker does not resolve the tie)

**6.6 Standings & Leaderboards**

The application provides both **group-level** and **global** visibility into player performance to increase competition and engagement across all groups.  The standings and leaderboard are the critical “dashboard” that the players see in their workflow after sign in.  

**Leaderboard Types**

**1\. Overall Leaderboard (Global)**

* Aggregates all players across all groups/groups  
* Displays ranked list by total points  
* **Top 3 players overall are visually highlighted** (e.g., groupium or medal styling)  
* Designed to create cross-group competition and bragging rights  
* Filter should be added to see filter by group

**2\. Group Leaderboard**

* Displays rankings limited to a single group  
* Clearly highlights the **current leader of the group**  
* Default view when a user enters their group

**Leaderboard Data Displayed (Per Player)**

* Player Name  
* Group / group Name  
* Total Points  
* Remaining Teams Count  
* **Top Remaining Team (Lowest Seed Number)**  
  * Represents the strongest remaining team on the player's roster  
  * Serves as a quick indicator of upside potential

**Filtering & Controls**

* Toggle or filter control allowing users to switch between:  
  * **Overall Leaderboard**  
  * **Group-Specific Leaderboard**  
* Group Admins can configure the default view for their players

**UX Considerations**

* Mobile-first leaderboard layout with clear visual hierarchy  
* Persistent visual indicators for:  
  * Top 3 overall players  
  * Current group leader  
* Sticky or pinned row for the logged-in user so they can always see their rank

**6.7 Hall of Fame**  
The application maintains a **Hall of Fame** to preserve historical results and reinforce long-term engagement across tournament years.

**Purpose**

* Celebrate past winners  
* Create continuity and tradition across annual tournaments  
* Increase repeat usage and long-term bragging rights

**Hall of Fame Records**

Each completed tournament has a permanent record containing:

* Tournament Year  
* Winning Player Name  
* Winning Team (National Champion)  
* Total Points Scored (Winner)  
* Group / group (optional, configurable)

**Access & Visibility**

* Read-only for all users  
* CRUD for Super Admin with an edit button for each line  
* Visible globally across the application  
* Accessible from the **main navigation**, **overall leaderboard**, and **home dashboard**

**UX Enhancements**

* Highlight the **most recent champion** at the top of the Hall of Fame  
* Tap/click on a player name to navigate to their profile (future enhancement)

**Defending Champion Indicator (future enhancement)**

* If a past winner is participating in the current tournament, display a **“Defending Champion” badge**:  
  * On the leaderboard  
  * On the player's profile  
  * In group views (subtle iconography)

**Data Persistence**

* Hall of Fame entries are immutable once the tournament concludes  
* Designed to support multi-year history as the product scales

**6.8 User Profiles (New)**

User profiles provide lightweight identity, performance visibility, and long-term continuity across tournaments while remaining simple for MVP scope.

**Profile Scope (MVP)**

Each user has a read-only profile page containing:

* Player Name  
* Current Group(s) / group(s)  
* Current Tournament Status:  
  * Total Points  
  * Current Rank (Overall \+ Group)  
  * Remaining Teams Count  
  * Top Remaining Team (Lowest Seed)  
* Badges:  
  * **Defending Champion** (if applicable)

**Historical Performance (Read-Only)**

* Hall of Fame appearances (wins by year)  
* Total lifetime tournament wins  
* Total lifetime points (aggregate across tournaments)

**Access & Navigation**

* Profiles are accessible by tapping/clicking a player name from:  
  * Overall Leaderboard  
  * Group Leaderboard  
  * Hall of Fame  
* Profiles are public within the application (no privacy controls in MVP)

**Editing & Identity (MVP Constraints)**

* Player name is editable only by Group Admin or Super Admin  
* No avatars, bios, or social features in MVP  
* Email is optional and used only for future notification support and is not displayed

**Future Enhancements (Post-MVP)**

* Profile customization (avatar, nickname)  
* Historical finishes  
* Seasonal summaries and trends  
* Notification preferences tied to profile

**6.9  Admin Section Tab \- Financial & Payout Management**

This section outlines how the application supports financial tracking and payout calculation, reducing the administrative burden on the Super Admin while remaining non-invasive for MVP.

**Entry Fees**

* Standard entry fee: **$40 per player** (configurable)  
* Entry fees are informational only in MVP (no in-app payments)  
* The system calculates the total pot size automatically based on the number of players and groups

**group-Level Payouts**

* Each group consists of 8 players ($320 total)  
* **50% of group funds ($160)** allocated to the group winner  
* The group payout amount is calculated and displayed automatically

**Central Pot (Overall Competition)**

* Remaining 50% of each group's funds roll into a central pot managed by the Super Admin  
* Central pot aggregates across all groups

**Overall Winner Payout Structure**

* Default payout distribution (configurable):  
  * 1st place overall: 35-40%  
  * 2nd place overall: \~25%  
  * 3rd-5th place: remaining percentage split  
* Application automatically calculates dollar amounts per placement

**Payout Calculator (MVP)**

* Read-only Payout Calculator view for Super Admins  
* Displays:  
  * Total pot size  
  * group payouts  
  * Central pot size  
  * Suggested payouts per overall rank

**Integrations (Future / Placeholder)**

* Venmo / PayPal integration placeholders  
* Export payout summary (CSV)  
* Payment status tracking (paid / unpaid)

*Note: Financial features are designed to reduce manual math and coordination, not to handle funds directly in MVP.*

**6.9 MVP vs Post-MVP Roadmap (New)**

The roadmap below clearly distinguishes **launch-critical MVP functionality** from **planned post-MVP enhancements**, demonstrating disciplined scoping and long-term vision.

| Area | MVP (Launch) | Post-MVP (Future) |
| ----- | ----- | ----- |
| Platform | Responsive web app | Native iOS / Android apps |
| Tournament Data | Manual game result entry | Live NCAA API integration |
| Draft Experience | Live, admin-assisted snake draft | Async draft, auto-pick timers |
| Leaderboards | Group \+ Overall leaderboards | Rank movement animations, trends |
| Notifications | None | Push \+ email notifications |
| User Profiles | Read-only profiles | Custom avatars, stats, rivalries |
| Hall of Fame | Global historical winners | Player-centric Hall of Fame views |
| Scoring Rules | Fixed scoring | Configurable scoring per group |
| Analytics | Basic usage metrics | Advanced engagement dashboards |

**6.10 Draft UX Flow**

The draft experience is designed to support **live in-person drafts** and remote (Zoom-based) drafts, prioritizing clarity, speed, and robust error prevention informed by historical failure modes.

**Draft Phases**

**6.1. Pre-Draft Setup**

### **6.1.1. The Group Setup Logic (Database & Backend)**

When the Group Admin adds the eight players, the system should follow an "upsert" (update or insert) logic to handle existing vs. new users.  RULE \- you cannot have more than 8 players in a group.  The screen should how existing players on the top rows and additional rows to add more players… not exceeding 8  

The group page should have add, edit and del functions for each row (player) in the group

The group page should have a button for adding a new group. The admin page should have a section for groups and a link to each group and a button that says Create New Group

* **Database Check:** For each email entered, the system queries the `Users` table.    
  * **If Email Exists:** The system retrieves the existing `UserID` and creates a record in a "GroupMembers" or `Pods` table to link that user to the new group.    
  * **If Email Does Not Exist:** A new record is created in the `Users` table with the provided name and email, and the default role is set to `PLAYER`.    
* **Trigger Event:** Once the group is saved, a background job should be triggered to send invitations only to the "newly created" users.  
    
  6.1.2 The draft order is randomized and visible to all players  
  6.1.3 Draft rules, scoring rules, and tie-breakers are clearly displayed  
  6.1.4 Passwordless Magic Link Notification  
  Upon finalizing the setup of the Group.  The app sends the following notifications  
1.  To existing users it sends a hello notification that they have been added to a group with a link to the group.  If the draft is not complete the link dynamically goes to the draft room. If the draft is complete the link dynamically goers to the group page  
2.  **New Player Flow:**  
1. New players receive an email: *"Madness Admin has added you to the Madness 2026 Draft Pool\!"*  
2. The email contains a unique, one-time-use **Magic Link**.  
3. Clicking the link automatically authenticates them and directs them to a **Welcome/Profile Setup** page.  
4. On this page, they can set their permanent password and confirm their display name before being dropped into the [Draft Lobby](https://docs.google.com/document/d/1t64qN27X7Kqg092nMwKh4mV7n76wG6L0zO-hy7IPF-A/edit?tab=t.0).    
5. **Why it's better:** It eliminates the "forgot password" friction for the first login and ensures the email address is verified immediately.

**2\. Draft Lobby**

* All players enter a shared draft page  
* Draft board displays:  
  * 8 players in draft order  
  * All 64 teams  
  * Drafted vs available status  
  * Current pick and upcoming picks  
  * Each player much choose a winner of the NIT and have it added to the database  
  * Each player must choose a total final score of the NCAA mens Final Four Final Game.  This mist be added to the database  
  * The draft is not complete until all 8 players have finished adding the tie breaker information.   
* Mobile-first layout with sticky draft status bar

**Live Admin-Assisted Draft Screen:**

* **Left Pane (The Players):** Displays the current "On the Clock" player and the upcoming pick order.  
* **Right Pane (The Teams):** A searchable grid of all 64 teams. Presented in alphabetical order by team name  
* **The Action:** Admin clicks a player $\\rightarrow$ clicks a team $\\rightarrow$ **Confirm Pick**.  
* **Real-Time Diminishing Returns:** As teams are drafted, they are instantly "dimmed" and disabled globally via a database-level uniqueness constraint

**3\. Active Pick Flow**

* Current player (or admin on their behalf) selects a team  
* System validates:  
  * Team availability/uniqueness  
  * Correct draft turn  
* Pick is instantly reflected on the draft board and player rosters

**4\. Snake Logic Handling**

* Draft direction reverses at the end of each round  
* Clear visual indicator of draft direction and round number

**5\. Error Prevention & Edge Case Handling (Critical for MVP)**

* **Duplicate Picks:** A team can only be drafted once per group. Drafted teams are immediately locked and disabled across all clients. Database-level uniqueness constraint enforces one draft pick per team per group.  
* **Play-In Games:** Play-in games do not award points. If a drafted team participates in a play-in game, the drafting player automatically receives the play-in winner, and the team is treated as advancing into the First Round (Round of 64). Scoring begins at the First Round. This behavior is explicitly documented in the scoring logic and admin documentation.  
* **Correcting Results (Manual Overrides):** Super Admins can access the Manual Override tool. Allows correction of incorrectly entered game results, incorrect round assignments, or incorrect point totals. Overrides automatically trigger score recalculation and leaderboard updates. All overrides are logged for transparency.

**6\. Draft Completion**

* Confirmation screen showing full rosters for all players  
* Draft automatically locks  
* Transition CTA to view leaderboards and rosters

**6.11 Draft UX Wireframe Annotations (Text-Only)**

The following describes the primary draft screens and key UI elements to guide design and implementation.

**Screen 1: Draft Lobby**

* **Header:** group name, round number, pick number  
* **Status Bar (Sticky):** Current picker, draft direction, countdown placeholder (future)  
* **Main Panel:** Draft board grid of 64 teams  
  * Visual states: Available, Drafted (grayed out), Recently Drafted (highlight)  
* **Side Panel (or bottom drawer on mobile):**  
  * Draft order list with current pick highlighted  
  * Quick access to scoring rules

**Screen 2: Active Pick Modal**

* **Title:** “You're on the clock” / “Admin selecting for Player X”  
* **Team Selector:** Search or scroll list of remaining teams  
* **Team Metadata:** Seed, region, record (optional)  
* **Primary CTA:** Confirm Pick  
* **Secondary CTA:** Cancel

**Screen 3: Draft Board (Mid-Draft State)**

* Visual indicator showing draft progressing round by round  
* Recently drafted teams briefly animate or highlight  
* User's drafted teams pinned or visually grouped

**Screen 4: Draft Complete Summary**

* Full roster table for all players  
* Ability to toggle between players  
* CTA: “View Group Leaderboard”

UX Principles:

* One primary action per screen  
* Avoid hidden state; always show whose turn it is  
* Optimize for thumb-friendly interactions on mobile

## 7\. Key Product Tradeoffs (New)

This section highlights intentional tradeoffs made during product design to balance usability, scope, and long-term scalability.

| Decision Area | Tradeoff Made | Rationale |
| ----- | ----- | ----- |
| Draft Control | Admin-assisted draft vs fully self-service | Reduced risk of errors and complexity in MVP while supporting live/Zoom drafts |
| Platform Scope | Web-only MVP | Faster development, broader device support, portfolio focus |
| Scoring Updates | Manual entry first | Ensures reliability and control before API dependency |
| Profiles | Read-only profiles | Identity and continuity without social complexity |
| Notifications | Deferred | Avoid premature optimization before engagement is validated |
| Custom Rules | Fixed scoring | Simplifies UX and prevents fragmentation in early usage |

These tradeoffs demonstrate a bias toward **shipping a reliable MVP**, validating core engagement, and deferring complexity until user value is proven.

**7\. Non-Functional Requirements**

* Mobile-responsive (mobile-first design)  
* Fast load times (\<2s on mobile)  
* Error prevention (no duplicate team drafts)  
* Secure role-based permissions

## 8\. Data & Integrations

**MVP**

* Internal database for teams, groups, drafts, scores  
* Manual result entry UI

**Future State (Post-MVP)**

* NCAA game data API integration  
* Automatic score updates  
* Push notifications  
* "What-if" scenario simulations

| Entity | Attributes | Rationale |
| :---- | :---- | :---- |
| **User** | ID, Email, Name, Role (Super/Group/Player) | Enables personalized dashboards and permissions. |
| **Tournament** | ID, Name, Fee, Year (2026), Status (Drafting/Live/Complete) | Separates different tournament cycles. |
| **Team** | ID, Name, Seed (1-16), Region, TournamentID | Tracks team metadata for bracket jump bonuses. |
| **Group** | ID, Name, AdminID, TournamentID | Groups players into specific competitions. |
| **DraftPick** | ID, PodID, UserID, TeamID, Round, PickNumber | Enforces snake logic and team uniqueness per pod. |
| **GameResult** | ID, WinnerTeamID, LoserTeamID, Round, TournamentID | Primary source for automated scoring. |

## 9\. Metrics & Analytics

**Admin Metrics**

* Time to create group  
* Time to complete draft  
* Manual actions required per tournament

**Engagement Metrics**

* DAU during tournament  
* Standings views per user  
* Mobile vs desktop usage

**Quality Metrics**

* Scoring accuracy  
* Draft error rate

## 10\. Out of Scope (MVP)

* Team and Scoring API’s  
* Native mobile apps  
* Payments or buy-ins  
* Public pools / discovery  
* Bracket-style (non-draft) pools

## 11\. Risks & Mitigations

| Risk | Mitigation |
| ----- | ----- |
| Draft complexity | Start with admin-controlled draft MVP |
| API reliability | Hybrid manual fallback |
| Scope creep | Strict MVP feature gating |

## 12\. Launch Plan

* Internal testing with 2025 data and 2025 actual groups  
* Beta with 2–3 groups  
* Full rollout for tournament start

## 13\. Future Enhancements

* Fully automated live scoring  
* Push notifications  
* Async draft mode  
* Historical stats and archives  
* Custom scoring rules

## 14\. Portfolio Narrative

This product demonstrates:

* User-centered problem discovery rooted in real-world workflows  
* Clear MVP definition with intentional tradeoffs  
* Scalable architecture (hybrid scoring, global vs group views)  
* Metrics-driven success criteria tied to admin efficiency and engagement  
* Long-term retention thinking through features like the **Hall of Fame** and **Defending Champion badge**  
* Product intuition beyond core mechanics (social competition, bragging rights, and tradition)

Together, these decisions showcase an ability to think holistically about **usability, scalability, and long-term product value**, not just feature delivery.

## 15\. 1–2 Minute Product Pitch (New)

**Problem:**  
Every March, casual friend groups run draft-style March Madness pools—but most still rely on spreadsheets. This creates hours of manual admin work, frequent errors, and a poor mobile experience that kills engagement after the first weekend.

**Solution:**  
March Madness Draft Pool is a web-based, mobile-responsive app purpose-built for draft-style tournament pools. It replaces spreadsheets with a clean draft experience, automated scoring, real-time leaderboards, and historical records—so organizers can run pools effortlessly and players stay engaged throughout the tournament.

**How It Works:**  
A Super Admin sets up the tournament once. Group Admins create groups, invite friends, and run a live or Zoom-friendly snake draft. Players draft teams, earn points as their teams win games, and track progress through group and overall leaderboards—all optimized for mobile.

**Why It’s Better:**

* Reduces admin time from hours to minutes  
* Eliminates scoring errors  
* Increases engagement with real-time standings and cross-group competition

**Differentiation:**  
Unlike traditional bracket pools, this product uses a draft-based model that rewards both strategy and deep tournament runs. Features like an overall leaderboard, Hall of Fame, and defending champion badges create long-term bragging rights and repeat usage.

**MVP Focus & Vision:**  
The MVP intentionally launches web-only with manual score entry to ensure reliability and speed. The platform is architected to support future automation, notifications, and native apps—allowing the product to scale without rework.

**Outcome:**  
This product demonstrates end-to-end product thinking: identifying a real user pain point, shipping a disciplined MVP, and designing for long-term engagement and scalability.

## 16\. Brand Kit – MADNESS

This brand kit defines the visual identity for **MADNESS**, ensuring consistency across the web app, presentations, and portfolio materials.

**Brand Personality**

* Competitive but fun  
* Clean and modern  
* Social and high-energy  
* Confident, not gimmicky

The brand should feel like a **serious product for friends**, not a casino app or cartoon sports game.

**Color Palette**

**Primary Colors**

* **Basketball Orange** – \#F58220  
  * Used for CTAs, highlights, active states, and key moments  
* **Royal Blue** – \#143278  
  * Used for headers, navigation, primary text, and structure

**Secondary / Neutral Colors**

* **White** – \#FFFFFF  
  * Primary background  
* **Light Gray** – \#F3F4F6  
  * Section backgrounds, dividers, tables  
* **Dark Gray** – \#1F2933  
  * Body text, secondary labels

*Accessibility note: All primary text/background combinations meet WCAG AA contrast standards.*

**Typography**

**Primary Typeface**

* **Inter** (or system UI fallback)  
  * Clean, modern, highly readable

## 

## 17\.  **Modular Development Roadmap (Sprints)**

**Strategic Summary:** We utilize a modular, sprint-based approach to ensure **Iterative Testing**, where core logic is validated before UI complexity is added. This maintains **Data Consistency** by establishing the database schema as the "source of truth" early, and increases **Efficiency** by allowing Lovable to focus its context window on specific functional blocks rather than the entire application at once.

---

### Sprint 1: The Foundation (Infrastructure & Auth)

* **Goal:** Establish the database and security roles.  Name the database madness.db  
* **Component Specs:** \* **Auth Wrapper:** A high-level component that checks `User.role` (Super Admin, Group Admin, Player).  
  * **DB Schema:** Tables for `Users`, `Tournaments`, `Teams`, `Pods`, and `DraftPicks`.  
* **State Logic:** \* Initialize a global `UserContext` to store the logged-in user’s role and assigned `PodID`.

### Sprint 2: The Heart (The Snake Draft)

* **Goal:** Build the Create Group function and interactive draft engine.  
* **Component Specs:** \* **Player Queue:** A vertical list showing the 8-player sequence with a "Now Picking" indicator.  
  * **Team Grid:** A searchable display of 64 team cards.  
* **State Logic:** \* **Snake Reversal:** `if (round % 2 == 0) reverse(playerOrder)`.  
  * **Real-Time Lock:** When a `TeamID` is written to `DraftPicks`, that team card state becomes `disabled = true` for all users in that Pod.

### Sprint 3: The Admin Command Center

* **Goal:** Enable Super Admins and Group Admins to manage the tournament.  
* **Component Specs:** \* **Bulk Importer:** A textarea for CSV team data (`Name, Seed, Region`).  
  * **Game Result Entry:** A form to record winners/losers by round.  
* **State Logic:** \* **Score Recalculation Trigger:** On saving a `GameResult`, trigger the `calculate_player_score` function across all players in the associated tournament.

### Sprint 4: The Player Experience (Personalized Dashboard)

* **Goal:** Mobile-first view for the individual competitor.  
* **Component Specs:** \* **Roster Card:** Shows the 8 drafted teams and their tournament status (Live/Eliminated).  
  * **Global Widget:** A filtered view of the top 10 players by points.  
* **State Logic:** \* **Conditional Views:** If the draft is active, show the "Live Draft" CTA; if the tournament is live, show "Live Scores".

### Sprint 5: Engagement & Hall of Fame

* **Goal:** Long-term retention and social competition.  
* **Component Specs:** \* **Historical Archive:** A table of past winners and their total points.  
  * **Defending Champion Badge:** A persistent icon next to past winners' names.  
* **State Logic:** \* **Immutable Records:** Once a tournament status is `Complete`, lock all scoring and roster data for that year.

## 

## 18\. Gamma Slide Deck Outline (PRD → Presentation)

This outline maps the PRD and product pitch into a concise, interview-ready slide deck suitable for Gamma, with recommended **visual style** and **speaker notes**.

**Global Look & Feel (Gamma Settings)**

* **Primary Colors:** Basketball Orange \+ Royal Blue  
* **Secondary Accents:** White backgrounds, light gray dividers  
* **Theme:** Modern sports analytics / March Madness energy  
* **Typography:** Bold headers, clean sans-serif body text  
* **Visual Elements:** Subtle basketball textures, bracket-inspired lines, card-based layouts  
* **Tone:** Confident, clean, and product-focused (not flashy)

**Slide 1: Title**

**Content:**

* March Madness Draft Pool  
* Replacing spreadsheets with a modern draft-based tournament experience  
* Your name – Product Manager

**Speaker Notes:**  
“This is a product I designed end to end to solve a real problem my friend groups face every March.”

**Slide 2: The Problem**

**Content:**

* Spreadsheet-based draft pools  
* Manual tracking across 67 games  
* Poor mobile experience

**Speaker Notes:**  
“Most draft pools still run on spreadsheets, which creates hours of admin work and kills engagement—especially on mobile.”

**Slide 3: The Opportunity**

**Content:**

* Highly social, time-bound event  
* Existing tools focus on brackets  
* Draft-style pools underserved

**Speaker Notes:**  
“March Madness is perfect for repeat engagement, but draft-style pools are largely ignored by existing products.”

**Slide 4: The Solution**

**Content:**

* Web-based, mobile-first app  
* Draft-style pools  
* Automated scoring and standings

**Speaker Notes:**  
“This product is purpose-built for draft pools—fast to run, easy to follow, and engaging throughout the tournament.”

**Slide 5: How It Works**

**Content:**

* Super Admin sets up tournament  
* Group Admins create groups  
* Players draft teams and compete

**Speaker Notes:**  
“We separate responsibilities cleanly so setup happens once and scales across groups.”

**Slide 6: Core User Personas**

**Content:**

* Super Admin  
* Group Admin  
* Player

**Speaker Notes:**  
“Each persona has different needs, so the product is role-based from day one.”

**Slide 7: Draft Experience**

**Content:**

* Snake draft (8x8)  
* Live \+ Zoom-friendly  
* Error prevention

**Speaker Notes:**  
“The draft is the emotional core—so clarity and speed matter more than complexity.”

**Slide 8: Scoring System**

**Content:**

* Points double each round  
* Rewards deep runs  
* Clear tie-breakers

**Speaker Notes:**  
“This scoring model balances strategy and excitement, especially late in the tournament.”

**Slide 9: Leaderboards & Competition**

**Content:**

* Group leaderboard  
* Overall leaderboard  
* Highlight top performers

**Speaker Notes:**  
“We intentionally added cross-group competition to drive engagement beyond a single group.”

**Slide 10: Engagement & Retention**

**Content:**

* Hall of Fame  
* Defending Champion badges  
* User profiles

**Speaker Notes:**  
“These features create tradition and give players a reason to come back year after year.”

**Slide 11: MVP Scope**

**Content:**

* Web-only  
* Manual scoring  
* Admin-assisted draft

**Speaker Notes:**  
“We scoped aggressively to ship something reliable before investing in automation.”

**Slide 12: Key Product Tradeoffs**

**Content:**

* Speed vs automation  
* Simplicity vs customization

**Speaker Notes:**  
“These tradeoffs reflect a bias toward learning and shipping over building everything at once.”

**Slide 13: Roadmap**

**Content:**

* Live game API  
* Notifications  
* Async drafts

**Speaker Notes:**  
“The architecture supports these features without rework once engagement is proven.”

**Slide 14: Success Metrics**

**Content:**

* Admin time saved  
* Engagement  
* Accuracy

**Speaker Notes:**  
“We measure success by reduced effort for admins and sustained engagement for players.”

**Slide 15: Why This Matters**

**Content:**

* Turns work into fun  
* Scales socially

**Speaker Notes:**  
“This product removes friction from something people already love doing.”

**Slide 16: Closing**

**Content:**

* Real problem  
* Shipped MVP  
* Clear vision

**Speaker Notes:**  
“This project demonstrates how I approach product: start with real pain, ship a focused MVP, and design for scale.”

* Excellent for data-heavy UIs

**Usage Guidelines**

* Page titles: Bold / Semi-bold  
* Section headers: Medium / Semi-bold  
* Body text: Regular  
* Numbers & stats: Medium (emphasis without clutter)

*Avoid decorative or script fonts.*

**Logo Usage**

**Primary Logo**

* Basketball icon \+ "MADNESS" wordmark  
* Preferred on light backgrounds

**Icon-Only Logo**

* Basketball mark without text  
* Used for:  
  * App favicon  
  * Mobile header  
  * Loading states

**Clear Space**

* Maintain padding equal to the height of the basketball icon around the logo

**Do Not:**

* Stretch or distort the logo  
* Change colors outside the defined palette  
* Add drop shadows or outlines

**UI Components Style**

**Buttons**

* Primary: Royal Blue background, white text  
* Secondary: White background, Royal Blue border  
* Destructive: Orange accent with clear confirmation

**Cards & Tables**

* Rounded corners (8–12px)  
* Subtle shadow or light border  
* Clear visual hierarchy for data

**Leaderboards**

* Top 3 players highlighted with Orange accents  
* Current user row subtly emphasized

**Iconography & Visual Motifs**

* Line-based icons (Lucide / Heroicons style)  
* Basketball-inspired shapes (circles, arcs)  
* Bracket-style lines used as subtle dividers  
* Avoid overly literal basketball graphics

**Motion & Interaction (Lightweight)**

* Fast, subtle transitions (150–200ms)  
* Highlight changes in leaderboard rank  
* Brief emphasis animation for draft picks

*Motion should reinforce clarity, not distract.*

**Tone & Voice**

**Product Voice:**

* Clear  
* Friendly  
* Competitive but respectful

**Examples:**

* "You're on the clock"  
* "Draft complete"  
* "Defending Champion"

*Avoid slang or trash talk in MVP.*

**Brand Application Examples**

* App UI (draft room, leaderboards)  
* Gamma presentation deck  
* Portfolio screenshots  
* GitHub README header

This brand system is intentionally simple to support fast iteration while maintaining a professional, cohesive identity.

# 19\. Antigravity Vibe Coding

This section is dedicated to collecting and documenting the specific prompts used in the **Antigravity Vibe Coding** process. Following the detailed plan laid out in the Modular Development Roadmap (Section 17), these prompts are designed to guide the Antigravity system in generating and refining the functional components for each sprint, ensuring the resulting code aligns precisely with the PRD requirements and the established data structure.

## Sprint 1: The Foundation (Infrastructure & Auth) Prompts

| Sub-Component | Prompt (Antigravity Vibe Coding) |
| :---- | :---- |
| **Sprint 1.1 Initialize the Vibe** | "I'm starting a fresh build for my March Madness app based on my PRD. We are in Sprint 1: Database & Auth. Scaffold a Next.js project with TypeScript and Tailwind CSS. Create a Prisma schema for the 'Groups', 'Users', and 'DraftPicks' tables. I have legacy scoring logic in `~/Developer/legacy-madness`, but for now, just focus on the infrastructure."  |
| **Mission: Sprint 1.2 \- Authentication & Role-Based Access** | **Goal:** Implement a robust authentication system using Auth.js (NextAuth) that integrates with our existing Prisma SQLite database and supports the three user roles defined in the PRD. **Requirements: Setup Auth.js:** Install and configure `@auth/prisma-adapter` and `next-auth@beta`. **Provider:** For now, implement **Google OAuth** (since this is for a private group) and a **Credentials provider** for testing purposes. **Role Logic:** \> \* Update the `User` model in `schema.prisma` to include a `role` enum: `PLAYER` (default), `GROUP_ADMIN`, and `SUPER_ADMIN`. Implement a session callback so the `role` is accessible on the client-side `session` object. **Middleware:** Create a `middleware.ts` file to protect the `/admin` and `/draft` routes. `/admin` should be restricted to `SUPER_ADMIN`. `/draft` should require a logged-in user. **UI Integration:** Update the existing `Navbar` to show a "Sign In" button when logged out and a User Profile/Sign Out button when logged in. **Reference:** Use the scoring logic in `src/lib/scoring.ts` to ensure that when a user is created, they are ready to be linked to `DraftPicks`. *Please generate a Task Plan for this sprint before writing any code.* |

## Sprint 2: The Heart (The Snake Draft) Prompts

| Sub-Component | Prompt (Antigravity Vibe Coding) |
| :---- | :---- |
| Mission: Sprint 2.1 \- Mock Data and Draft Foundations | **Goal:** Now that I'm a `SUPER_ADMIN`, let's set up the data we need to test the draft. **Instructions: Seed Data:** Create a `prisma/seed.ts` file that populates the `Team` table with 64 mock NCAA teams (assign them random regions and seeds 1-16). **Draft Logic:** Create a new library file `src/lib/draft-logic.ts`. Write a function that determines the "Current Picker" based on a **Snake Draft** algorithm (1-10, 10-1, etc.). **Admin View:** Create a protected page at `/admin/setup` where I can click a button to "Reset Draft" or "Randomize Draft Order." **Run Seed:** After creating the file, help me run `npx prisma db seed` to get those teams into my `dev.db`. **Reference:** Use the brand colors (Basketball Orange/Royal Blue) for the Admin UI elements.  |
| **Mission: Sprint 2.2 \- The Interactive Draft Board**  | **Goal:** Create a real-time (simulated) draft interface where players can select teams. **Instructions: Draft Page:** Create `/draft/page.tsx`. This should display: **The Big Board:** A grid of all 64 teams, grayed out if already picked. **Current Status:** A "Now Picking" header showing the name and avatar of the current user. **My Roster:** A sidebar showing the teams I have personally drafted. **Selection Logic:** Implement a Server Action `pickTeam(teamId)` that: Checks if it is actually that user's turn. Creates a `DraftPick` record in the DB. Updates the team status to "Unavailable." **The "Vibe":** Use the "Basketball Orange" for the "Pick" button and a nice "Royal Blue" for the selected team cards. **Constraint:** If I am NOT the current picker, the "Pick" buttons should be disabled for me.  |
| **Mission: Sprint 2.3 \- Multi-User Group Onboarding & Magic Links** | **Goal: Build the "Group Creation" flow for Group Admins that handles user upserting and triggers passwordless onboarding. 1\. Database Updates: Update schema.prisma to include a Group model and a many-to-many relationship between User and Group (e.g., a GroupMembership table). Ensure the User model supports passwordless auth (fields for emailVerified). 2\. Group Creation Action (The "Upsert" Engine): Create a Server Action createGroupWithPlayers that accepts a Group Name and an array of 8 Player objects (name/email). Logic:Create the Group.For each email: upsert the User: If email exists, connect them to the Group. If not, create a new User with the PLAYER role. Generate a unique VerificationToken for new users. 3\. Modern Onboarding (Magic Links):Configure Auth.js (NextAuth) Resend Provider (or similar) to handle Magic Link emails. The Flow: When a new user is created, trigger an email: "Dan has added you to the Madness 2026 Draft Pool\! Click here to join." Destination: Clicking the link should authenticate them and land them on /onboarding, where they can confirm their display name. 4\. UI \- The "Group Manager" Form:Create a page at /admin/groups/new. Build a dynamic form that allows the Admin to input the group name and 8 player rows. Include basic validation to ensure no duplicate emails are entered in the same form. 5\. Security:Ensure only users with SUPER\_ADMIN or GROUP\_ADMIN roles can access this form.** |
| **Mission: Sprint 2.4 \- High Integrity Admin-Controlled Snake Draft Board** | **Mission: Sprint 2.4 \- High-Integrity Admin Draft Board Goal:** Build an Admin-controlled "War Room" for an 8-player Snake Draft where the database strictly dictates the picker sequence. **1\. Data-Driven Logic (The Backend): Atomic Server Action:** Create `submitPick(teamId, groupId)`. **Transaction Logic:** Inside a `prisma.$transaction`: **Count:** Fetch the current number of `DraftPicks` for this group to determine the `currentPickNumber`. **Resolve:** Pass that count into `getCurrentPicker(count + 1, 8)` to identify the `playerIndex`. **Target:** Fetch the `GroupMembership` at that index to get the specific `userId`. **Execute:** Create the `DraftPick` and link it to that `userId`. **Validation:** Throw an error if the `teamId` is already taken or if the total picks exceed 64\. **2\. Command Center UI (The Frontend): The Left Roster:** List all 8 players. Dynamically highlight the "On the Clock" player based on the *actual* pick count from the DB. **The Team Grid:** Display the 64 seeded teams. Only show the "Draft" button if the logged-in user is a `SUPER_ADMIN` or `GROUP_ADMIN`. **The Bottom Roster Tray:** Create a horizontal section showing each player's drafted teams. This must refresh automatically after every pick. **3\. Visual Feedback: Snake Indicator:** Add a "Directional Arrow" in the sidebar that flips direction when the `roundIndex` changes (e.g., pointing Down for Round 1, pointing Up for Round 2). **Optimistic UI:** Use `useOptimistic` so that when the Admin clicks "Draft," the team card immediately moves to the player's tray while the server processes the transaction. **4\. Constraints:** Do not hardcode array indices. Ensure the "Snake Turn" (e.g., Pick 8 and 9\) correctly assigns back-to-back picks to the same `userId`.  **4\. Data Polish:** \> \* Ensure the Bottom Tray updates instantly so the Admin can see at a glance how many teams each player has (e.g., "Brady: 3/8 Teams"). **Vibe:** Use the "Basketball Orange" for the current picker's highlight and "Royal Blue" for the Admin control buttons.  |

## Sprint 3: The Admin Command Center Prompts

| Sub-Component | Prompt (Antigravity Vibe Coding) |
| :---- | :---- |
| Mission: Sprint 3.1 \- Bulk Team Importer & Command Center | **Goal:** Create a Super Admin utility to bulk-load the 64 tournament teams via CSV. **1\. The Importer Component:** Create a Super Admin-only component `BulkTeamImporter.tsx`. **Interface:** Include a large `textarea` for CSV input and a dropdown to select the `Tournament` the teams belong to. **Expected CSV Format:** `Name, Seed, Region` (e.g., `Gonzaga, 1, West`). **2\. Server Action (`importTeams`):** Implement a Server Action that parses the CSV string. **Logic:** Use `prisma.team.createMany` to batch-insert the records. **Validation:** Ensure the `Seed` is an integer (1-16) and the `Region` matches your defined Enum (East, West, South, Midwest). **3\. Tournament Creation Integration:** Update the "Create Tournament" function so that after a tournament is named (e.g., "Madness 2026"), the Admin is immediately directed to this Importer to "Fill the Bracket." **4\. Safety:** Wrap the import in a transaction. If one row is malformed (e.g., "Kentucky, Two, South"), roll back the entire import so you don't end up with a partial bracket of 43 teams. **Vibe:** Add a "Preview" table that shows the parsed teams before the Admin hits "Confirm Import."  |
| **Mission: Sprint 3.2 \- Game Result Form & Scoring Engine** | **Mission: Sprint 3.2 \- Game Result Form & Scoring Engine Goal:** Build a robust Admin form to record specific game outcomes and automatically calculate player points. **1\. The GameResultForm (Admin Only):** Create a component GameResultForm.tsx. **Interface:** \> \* **Round Dropdown:** (Round 64, Round 32, Sweet 16, etc.). **Team Selectors:** Two dropdowns to select the competing teams (Team A vs. Team B). **Winner Toggle:** A simple way to mark which of those two teams won. **2\. The "Atomic" Server Action:** Create a Server Action processGameResult. **Logic (Inside a Transaction): Record:** Write the result to the GameResult table. **Eliminate:** Update the losing team's record to isEliminated: true. **Score:** Identify the owner of the winning team and increment their total score in GroupMembership. **Calculation:** Points \= $2^{(\\text{RoundNumber} \- 1)}$. **3\. Public Standings Page:** Build /standings to show the 8 players ranked by their new live scores. Display a "Roster Status" for each player (e.g., "6/8 Teams Still Alive"). **Vibe:** Use a "Scoreboard" aesthetic—clean, bold numbers and a "Last Updated" timestamp so players know the standings are current.  |
| **Mission: Sprint 3.3 \- Upset Logic & Public Dashboard Polish** | "Antigravity: Write a database function (or Supabase Edge Function) named `calculate_player_score(tournamentID)`. This function must execute the full scoring logic (Base Points \+ Upset Bonus) based on all `GameResult` records for the tournament and update a derived `PlayerScore` table." |

## Sprint 4: The Player Experience Prompts

| Sub-Component | Prompt (Antigravity Vibe Coding) |
| :---- | :---- |
| **Roster Card Component** | "Antigravity: Develop a `MyRosterCard` component for the Player Dashboard. It should fetch the user's 8 `DraftPicks` and display the Team Name, Seed, and current tournament status (e.g., Live, R32, Eliminated). Prioritize mobile-first layout." |
| **Global Top 10 Widget** | "Antigravity: Generate a `GlobalLeaderboardWidget` component. This sticky component must display the top 10 players overall, showing Player Name and Total Points. Ensure it has fast, real-time data fetching for the `PlayerScore` table." |
| **Leaderboard Component** | "Antigravity: Create the main `Leaderboard` component. It must support a toggle/filter for 'Overall' and 'Group' views. For each player, display Name, Group, Total Points, Remaining Teams, and Top Remaining Team (Lowest Seed)." |

## Sprint 5: Engagement & Hall of Fame Prompts

| Sub-Component | Prompt (Antigravity Vibe Coding) |
| :---- | :---- |
| **Hall of Fame Archive** | "Antigravity: Design a `HallOfFameArchive` component. It should display a table of all past tournament winners, including Year, Winning Player Name, and Total Points. The data must be read-only for all users." |
| **Defending Champion Logic** | "Antigravity: Create a utility function that checks if the logged-in user is the winner of the most recent *Completed* tournament. Use this to render a `DefendingChampionBadge` component next to their name on the Leaderboard." |
| **Profile Page** | "Antigravity: Generate a read-only `PlayerProfile` page accessible by clicking a player's name. It must display the user's name, current points/rank, and a list of their Hall of Fame appearances/wins." |

