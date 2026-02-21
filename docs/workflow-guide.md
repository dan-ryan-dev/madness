# 🚀 Development & Deployment Workflow

This guide outlines the professional workflow for maintaining Krazy Kevy's March Madness.

## 1. Local Development
- **Database**: Your laptop uses `.env.local`, which points to the **`madness-dev`** Supabase project.
- **Workflow**: 
  1. Run `npm run dev` to start the local server.
  2. Make your code changes.
  3. Verify them at `http://localhost:3000`.

## 2. Testing Schema Changes
If you add a new field or table to `schema.prisma`:
1. Run `npx prisma db push` locally. This only affects your **Dev** database.
2. Verify the changes in **Prisma Studio** (`npx prisma studio`).

## 3. Deployment to Production
Once you are happy with your changes:

### A. Push Code
```bash
git add .
git commit -m "Your descriptive message"
git push origin main
```
*Vercel will automatically start building your site as soon as the push finishes.*

### B. Sync Production Database
If you changed the database schema, you must apply those changes to the **Prod** database:
1. Temporary change: In your terminal, run:
   ```bash
   DATABASE_URL="your_prod_connection_string_here" npx prisma db push
   ```
   *Note: Use the connection string from your `.env` file (the `madness-prod` one).*

## 4. Vercel Environment Variables
When you set up Vercel for the first time:
1. Go to **Project Settings > Environment Variables**.
2. Add `DATABASE_URL` and paste your **Production** connection string.
3. Add `AUTH_SECRET`, `AUTH_GOOGLE_ID`, etc. (Copy these from your local `.env`).

---
**Safety Tip**: Never run `npx prisma db push` against the Production URL unless you have verified the change works perfectly in the Dev environment!
