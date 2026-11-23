-- CreateTable
CREATE TABLE "Traveler" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "night" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "tent" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Traveler_email_key" ON "Traveler"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Traveler_tent_key" ON "Traveler"("tent");
