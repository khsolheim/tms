/*
  Warnings:

  - You are about to drop the column `orgNr` on the `Bedrift` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bedrift" DROP COLUMN "orgNr",
ADD COLUMN     "orgNummer" TEXT;
