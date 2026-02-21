# Walkthrough - Global User Management

I have implemented a comprehensive **Global User Management** system within the Admin Console. This allows Super Admins to easily discover users and manage their permissions (Player, Group Admin, or Super Admin).

## Features

### 1. Centralized Management Console
A new page at `/admin/users` lists all registered users with their contact info and join date. It includes a real-time search to find users by name or email.

### 2. Interactive Role Selection
The `UserRoleSelector` component provides an immediate, AJAX-style update for user roles. It features clear visual cues (icons and colors) for different permission levels.

### 3. Dashboard Integration
I've added a new **"User Control"** section to the main Admin Dashboard (visible only to Super Admins) for quick access.

## Verification

### Role Updates
I verified that roles are correctly updated in the database and that the UI reflects changes instantly.

### Security (RBAC)
- **Server-side Protection**: The `/admin/users` page and the `updateUserRole` action are strictly restricted to `SUPER_ADMIN` users.
- **Unauthorized Access**: Users with `PLAYER` or `GROUP_ADMIN` roles are automatically redirected if they attempt to access these management features.

## Technical Details
- **New Component**: [UserRoleSelector.tsx](file:///Users/dan/Developer/madness-2026/src/components/admin/UserRoleSelector.tsx)
- **New Page**: [admin/users/page.tsx](file:///Users/dan/Developer/madness-2026/src/app/admin/users/page.tsx)
- **Updated Action**: [admin.ts](file:///Users/dan/Developer/madness-2026/src/app/actions/admin.ts)
