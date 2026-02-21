-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SETUP',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "region" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Group_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Group_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DraftPick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "pickNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DraftPick_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DraftPick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DraftPick_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GameResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "round" INTEGER NOT NULL,
    "winnerId" TEXT,
    "loserId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GameResult_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GameResult_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GameResult_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_GroupPlayers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GroupPlayers_A_fkey" FOREIGN KEY ("A") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GroupPlayers_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_name_key" ON "Tournament"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_tournamentId_name_key" ON "Team"("tournamentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "DraftPick_groupId_teamId_key" ON "DraftPick"("groupId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftPick_groupId_round_pickNumber_key" ON "DraftPick"("groupId", "round", "pickNumber");

-- CreateIndex
CREATE UNIQUE INDEX "_GroupPlayers_AB_unique" ON "_GroupPlayers"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupPlayers_B_index" ON "_GroupPlayers"("B");
