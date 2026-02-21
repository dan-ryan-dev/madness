# Walkthrough - Group Creation & Draft Order Refinement (Sprint 5.8)

I have refined the group creation process to ensure absolute clarity and technical alignment for the Snake Draft picking order.

## UI Enhancements

### 1. Removal of Automatic Admin Toggle
The "Include myself as a player" toggle has been removed. Admins now manually enter themselves in the slot where they wish to pick, allowing for full flexibility in pick assignment.

### 2. High-Visibility Instructions
I added a Royal Blue and Light Orange alert box to the top of the player list to emphasize that the entry order dictates the draft order.

### 3. Tie-Breaker Note
A placeholder note clarifies that tie-breaker predictions (Final Score & NIT Winner) will be collected after the draft concludes, keeping the initial setup focused on player entry.

## Backend Improvements

### 1. Explicit Draft Position Indexing
I added a `draftPosition` field to the `GroupMembership` model. The `createGroupWithPlayers` action now strictly assigns a 1-based index (1-8) to each player based on their row position in the form.

### 2. Reliable Sorting
The Draft Page now sorts group members by this `draftPosition` field instead of relying on creation timestamps, ensuring the Snake Draft logic always follows the intended order.

## Verification

I have verified the UI changes and backend logic. Below is a recording of the verification process:

![Group Creation Refinement Verification](file:///Users/dan/.gemini/antigravity/brain/b0cbc0bb-b3f4-4f9a-99a6-651a84a42aba/group_creation_refinement_verification_58_1771183036509.webp)

## Technical Changes
- **Updated Form**: [NewGroupForm.tsx](file:///Users/dan/Developer/madness-2026/src/components/admin/NewGroupForm.tsx)
- **Updated Action**: [group.ts](file:///Users/dan/Developer/madness-2026/src/app/actions/group.ts)
- **Schema Update**: [schema.prisma](file:///Users/dan/Developer/madness-2026/prisma/schema.prisma)
- **Draft Logic Integration**: [draft/page.tsx](file:///Users/dan/Developer/madness-2026/src/app/groups/[id]/draft/page.tsx)
