/*
  Warnings:

  - A unique constraint covering the columns `[elevId,kategoriId]` on the table `SikkerhetskontrollElevProgresjon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SikkerhetskontrollElevProgresjon" ADD COLUMN     "antallSporsmalSett" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "kategoriId" INTEGER,
ADD COLUMN     "mestret" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mestretDato" TIMESTAMP(3),
ADD COLUMN     "sisteAktivitet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "totalTid" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_elevId_kategoriId_idx" ON "SikkerhetskontrollElevProgresjon"("elevId", "kategoriId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_mestret_idx" ON "SikkerhetskontrollElevProgresjon"("mestret");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_sisteAktivitet_idx" ON "SikkerhetskontrollElevProgresjon"("sisteAktivitet");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollElevProgresjon_elevId_kategoriId_key" ON "SikkerhetskontrollElevProgresjon"("elevId", "kategoriId");

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollElevProgresjon" ADD CONSTRAINT "SikkerhetskontrollElevProgresjon_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "SikkerhetskontrollKategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;
