/*
  Warnings:

  - You are about to drop the column `orgNummer` on the `Bedrift` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[organisasjonsnummer]` on the table `Bedrift` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Bedrift_orgNummer_idx";

-- DropIndex
DROP INDEX "Bedrift_orgNummer_key";

-- AlterTable
ALTER TABLE "Bedrift" DROP COLUMN "orgNummer",
ADD COLUMN     "organisasjonsnummer" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Bedrift_organisasjonsnummer_key" ON "Bedrift"("organisasjonsnummer");

-- CreateIndex
CREATE INDEX "Bedrift_organisasjonsnummer_idx" ON "Bedrift"("organisasjonsnummer");
