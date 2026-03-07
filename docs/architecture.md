# 🏗 Architecture & Environment Map

This document serves as the "Source of Truth" for how madness-2026 is architected and how different environments connect to their respective databases.

## 🗺 High-Level Map

| Environment | Config File | Database (Provider) | Purpose |
| :--- | :--- | :--- | :--- |
| **Local Development** | `.env.local` | **`madness-dev`** (Supabase) | Local coding and schema testing. |
| **Local Fallback** | `.env` | **`madness-prod`** (Supabase) | *Caution:* Used if `.env.local` is missing. Contains Prod creds. |
| **Production** | Vercel Env Vars | **`madness-prod`** (Supabase) | Live application for users. |

> [!IMPORTANT]
> Your local `DATABASE_URL` in `.env.local` should point to the **Dev** Supabase project (`uhwszvkoukjtgjblsmms`). The production project ID is `bnqmmdafysfrxlbujtvw`.

---

## 🛠 Database Management

We use **Prisma ORM** with **PostgreSQL** hosted on Supabase.

### Local Development Flow
1. Start local server: `npm run dev`
2. Modify schema: Edit `prisma/schema.prisma`
3. Sync Dev DB: `npx prisma db push`
4. Inspect data: `npx prisma studio`

### Production Syncing
Schema changes are **not** automatically applied to Production by Vercel. To sync the Production database:
```bash
# Temporarily override DATABASE_URL to push to Prod
DATABASE_URL="your_prod_url" npx prisma db push
```
*Note: Only do this after verifying changes work perfectly in the Dev environment.*

---

## 🔍 Troubleshooting Connection Issues

If you see database connection errors locally:
1. **Check `.env.local`**: Ensure `DATABASE_URL` is present and correct.
2. **IP Whitelisting**: Supabase requires your current IP to be whitelisted if you aren't using the connection pooler.
3. **Prisma Client**: Run `npx prisma generate` to ensure the client is up-to-date with your schema.

For more detailed workflow steps, see the [Workflow Guide](./workflow-guide.md).
