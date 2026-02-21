---
description: How to safely perform database migrations and resets
---

// turbo-all
# Database Management Workflow

Before performing any destructive database actions (e.g., `db push --force-reset`, `migrate reset`, or manual table drops), follow these steps to ensure data integrity.

## 1. Create a timestamped backup
Run this command to create a copy of the current SQLite database:
```bash
cp prisma/dev.db "prisma/dev_backup_$(date +%Y%m%d_%H%M%S).db"
```

## 2. Verify existence of other database files
Check for any nested or duplicated database files that might cause path resolution issues:
```bash
find . -name "*.db" -not -path "*/node_modules/*"
```

## 3. Back up all identified databases
If multiple database files are found, back them all up before proceeding.

## 4. Perform the intended action
Only after step 1 is complete, run your Prisma commands:
- `npx prisma db push --force-reset`
- `npx prisma migrate reset`

## 5. Verify and restore if necessary
Verify the application state. If data is missing that isn't captured in `seed.ts`, use the backup created in step 1 to recover specific table data using `sqlite3` attach/insert commands.
