-- AlterTable
ALTER TABLE "Member"
ADD COLUMN "conflictExplicit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "energyExplicit" BOOLEAN NOT NULL DEFAULT false;
