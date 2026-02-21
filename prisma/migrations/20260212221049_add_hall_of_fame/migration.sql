/*
  Warnings:

  - You are about to drop the `_GroupPlayers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "_GroupPlayers_B_index";

-- DropIndex
DROP INDEX "_GroupPlayers_AB_unique";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "password" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_GroupPlayers";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GroupMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "GroupMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HallOfFame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "winnerName" TEXT NOT NULL,
    "winningTeam" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "groupName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "isEliminated" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Team" ("id", "name", "region", "seed", "tournamentId") SELECT "id", "name", "region", "seed", "tournamentId" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_tournamentId_name_key" ON "Team"("tournamentId", "name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMembership_userId_groupId_key" ON "GroupMembership"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "HallOfFame_year_key" ON "HallOfFame"("year");
