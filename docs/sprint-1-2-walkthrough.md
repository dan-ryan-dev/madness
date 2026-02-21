# Madness Draft Pool 2026 - Sprint 1.2 Walkthrough (Authentication)

I have successfully implemented the Authentication system using Auth.js (NextAuth v5), Prisma, and Role-Based Access Control (RBAC).

## Highlights
- **Tech Stack**: Next.js 14, Tailwind CSS v4, Prisma 5.10.2 (Downgraded for stability), Auth.js Beta.
- **Authentication**:
  - **Providers**: Google OAuth and Credentials (Mock for Dev).
  - **Adapter**: `@auth/prisma-adapter` connected to SQLite.
  - **Session**: JWT strategy with role persistence.
- **Role-Based Access Control (RBAC)**:
  - **Roles**: `SUPER_ADMIN`, `GROUP_ADMIN`, `PLAYER`.
  - **Middleware**: Protects `/admin`, `/draft`, `/dashboard`.
    - `/admin` restricted to `SUPER_ADMIN`.
- **UI Components**:
  - **Navbar**: Dynamic state (Sign In vs User Menu).
  - **UserMenu**: Dropdown with profile link and Admin Panel link (if authorized).
  - **Sign In/Out**: Server Actions integrated.

## Verification
- **Build**: `npm run build` passes successfully.
- **Start**: Run `npm run dev`.
- **Test Login**:
  - Click "Sign In".
  - Use **Credentials** provider for mock login:
    - **Admin**: `admin@example.com` / `admin` -> Access to `/admin`.
    - **Player**: `player@example.com` / `player` -> Redirected from `/admin`.

## Database Configuration
- **Prisma Path Resolution**: Standardized `DATABASE_URL` in `.env` to use an **absolute path** (`file:/Users/dan/Developer/madness-2026/prisma/dev.db`).
  - **Issue Resolved**: Previously, relative paths were causing a conflict where separate database files were created at `prisma/dev.db` and `prisma/prisma/dev.db`, leading to missing columns after migrations.
  - **Stability**: Standardizing on the absolute path ensures that both the Next.js dev server and the Prisma CLI (when running `db push` or `migrate`) target the same physical file.

## Changes
- Downgraded `prisma` and `@prisma/client` to v5.10.2 to resolve configuration issues with v7.
- Updated `schema.prisma` to include Auth models and `Role` enum.
- Created `src/auth.ts`, `src/middleware.ts`, and auth components.

## Next Steps (Sprint 2)
- **The Heart (Draft Logic)**:
  - Implement `PlayerQueue` and `TeamGrid`.
  - Connect UI to real data (teams, players).
  - Implement Snake Draft logic.
