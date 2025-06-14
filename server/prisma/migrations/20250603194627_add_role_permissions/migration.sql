/*
  Warnings:

  - You are about to drop the column `passord` on the `Ansatt` table. All the data in the column will be lost.
  - You are about to drop the column `telefon` on the `Ansatt` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orgNummer]` on the table `Bedrift` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `oppdatert` to the `Ansatt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passordHash` to the `Ansatt` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rolle` on the `Ansatt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `oppdatert` to the `Bedrift` table without a default value. This is not possible if the table is not empty.
  - Made the column `orgNummer` on table `Bedrift` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Ansatt" DROP CONSTRAINT "Ansatt_bedriftId_fkey";

-- AlterTable
ALTER TABLE "Ansatt" DROP COLUMN "passord",
DROP COLUMN "telefon",
ADD COLUMN     "oppdatert" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "passordHash" TEXT NOT NULL,
ADD COLUMN     "tilganger" TEXT[],
ALTER COLUMN "bedriftId" DROP NOT NULL,
DROP COLUMN "rolle",
ADD COLUMN     "rolle" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Bedrift" ADD COLUMN     "oppdatert" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "orgNummer" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Ansatt_bedriftId_idx" ON "Ansatt"("bedriftId");

-- CreateIndex
CREATE UNIQUE INDEX "Bedrift_orgNummer_key" ON "Bedrift"("orgNummer");

-- AddForeignKey
ALTER TABLE "Ansatt" ADD CONSTRAINT "Ansatt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
