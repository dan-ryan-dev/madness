# Madness Draft Pool 2026 - Sprint 2.5 Walkthrough (Bulk Importer)

I have successfully implemented the **Bulk Team Importer** and improved the **Tournament Creation Workflow**.

## Highlights

### 1. New Tournament Workflow
-   **Page**: `/admin/tournaments/new`
-   **Flow**: Creating a tournament (e.g., "Madness 2026") now automatically redirects the Super Admin to the **Import Teams** screen.
-   **Validation**: Ensures unique tournament names and requires a year.

### 2. Bulk Team Importer
-   **Page**: `/admin/tournaments/[ID]/import`
-   **Features**:
    -   **CSV Input**: Accepts `Name, Seed, Region` format.
    -   **Preview**: Parses and displays the teams in a table before committing.
    -   **AI Prompt**: Includes a copy-paste prompt to generate the correct CSV format using LLMs (ChatGPT/Gemini).
    -   **Validation**: Enforces valid seeds (1-16) and regions (East, West, South, Midwest).

### 3. Server-Side Logic
-   **Actions**: `src/app/actions/tournament.ts`
-   **Transactions**: Uses `prisma.$transaction` to ensure atomic inserts.
-   **Compatibility**: Optimized for SQLite (using `Promise.all` + `create` instead of `createMany`) to ensure local development compatibility.

## Verification
1.  **Create Tournament**:
    -   Go to `/admin/tournaments/new`.
    -   Enter a name and year.
    -   Click "Create & Import".
2.  **Import Teams**:
    -   On the import page, paste a valid CSV (or use the AI prompt to get one).
    -   Click "Preview" to verify.
    -   Click "Confirm Import".
3.  **Result**:
    -   Success message confirms 64 teams imported.
    -   Database reflects the new teams associated with the tournament.
