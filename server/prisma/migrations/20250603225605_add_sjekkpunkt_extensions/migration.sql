/*
  Warnings:

  - The `konsekvens` column on the `Sjekkpunkt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Sjekkpunkt" ADD COLUMN     "forerkortklass" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "kjoretoyRegNr" TEXT,
ADD COLUMN     "kjoretoyklass" TEXT,
ADD COLUMN     "kjoretoymerke" TEXT,
ADD COLUMN     "kjoretoytype" TEXT,
ADD COLUMN     "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unikForKjoretoyklass" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unikForMerke" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unikForRegnr" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unikForType" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "konsekvens",
ADD COLUMN     "konsekvens" TEXT[] DEFAULT ARRAY[]::TEXT[];
