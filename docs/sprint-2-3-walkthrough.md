# Madness Draft Pool 2026 - Sprint 2.3 Walkthrough (Group Administration & Onboarding)

I have successfully implemented the Group Creation flow and "Magic Link" onboarding.

## Highlights
- **Group Creation** (`/admin/groups/new`):
  - Form to create a group and invite 8 players by name/email.
  - Generates a unique "Magic Link" for each player (logged to console in dev).
- **Schema**: 
  - Migrated to explicit `GroupMembership` model to support roles and join dates.
  - Updated `prisma/seed.ts` and draft actions to use the new schema.
- **Onboarding** (`/onboarding`):
  - Welcome page for users joining via the magic link.
  - Confirms account verification.
- **Refinements**:
  - **Draft Logic**: Enforced a strict limit of 8 teams per user.
  - **Navigation**: Added "Create Group" buttons to Admin Dashboard and created `/admin/groups` index page.
- **Group Editing** (`/admin/groups/[id]/edit`):
  - **Rename**: Edit group name.
  - **Manage Members**: Remove members (and their picks) or invite new ones via magic link.

## Verification
1. **Create Group**:
   - Log in as Admin.
   - Go to `/admin/groups/new`.
   - Enter Group Name and at least one player (Name + Email).
   - Click "Create".
   - **Check Console**: Look for `[EMAIL MOCK] To: ... | Link: ...`.
2. **Join Group**:
   - Copy the link from the console.
   - Open it in an Incognito window (or logout first).
   - Verify you are logged in as the new user and land on `/onboarding`.
3. **Verify DB**:
   - Run `npx prisma studio`.
   - Check `GroupMembership` table to see the link between User and Group.
4. **Draft Logic**:
   - Verify that users cannot pick more than 8 teams (error message appears).
   - Turns cycle correctly when multiple users are in the group (test with Incognito window).
5. **Edit Group**:
   - Go to `/admin/groups`, click "Edit".
   - **Rename**: Change name, save, verify update.
   - **Remove**: Click trash icon next to a member, verify they are removed.
   - **Invite**: Add a new player, verify the email link in console.

## Changes
- `prisma/schema.prisma`: Added `GroupMembership`.
- `src/app/actions/group.ts`: Added `createGroupWithPlayers`.
- `src/app/admin/groups/new/page.tsx`: New Admin Page.
- `src/app/admin/groups/[id]/edit/page.tsx`: New Edit Group Page.
- `src/components/admin/EditGroupForm.tsx`: New Client Component.
- `src/components/admin/MemberRow.tsx`: New Client Component.
- `src/app/onboarding/page.tsx`: New Onboarding Page.
- `src/app/onboarding/page.tsx`: New Onboarding Page.
- `src/components/admin/ResetDraftForm.tsx`: Refactored client component.

## Next Steps (Sprint 3)
- **Scoring & Leaderboards**:
  - Implement actual scoring logic.
  - Build the Leaderboard UI.
