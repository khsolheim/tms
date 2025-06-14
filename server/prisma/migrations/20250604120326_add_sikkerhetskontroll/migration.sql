/*
  Warnings:

  - Changed the type of `rolle` on the `Ansatt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `bedriftId` on table `Ansatt` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GodkjentAv" AS ENUM ('LÆRER', 'ELEV', 'BEGGE');

-- DropForeignKey
ALTER TABLE "Ansatt" DROP CONSTRAINT "Ansatt_bedriftId_fkey";

-- DropIndex
DROP INDEX "Ansatt_bedriftId_idx";

-- AlterTable
ALTER TABLE "Ansatt" ADD COLUMN     "telefon" TEXT,
ALTER COLUMN "passordHash" DROP DEFAULT,
DROP COLUMN "rolle",
ADD COLUMN     "rolle" "Rolle" NOT NULL,
ALTER COLUMN "bedriftId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Sikkerhetskontroll" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "bedriftId" INTEGER NOT NULL,
    "opprettetAvId" INTEGER NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sikkerhetskontroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollPunkt" (
    "id" SERIAL NOT NULL,
    "sikkerhetskontrollId" INTEGER NOT NULL,
    "sjekkpunktId" INTEGER NOT NULL,
    "rekkefølge" INTEGER NOT NULL,
    "kanGodkjennesAv" "GodkjentAv" NOT NULL DEFAULT 'LÆRER',
    "påkrevd" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SikkerhetskontrollPunkt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizSporsmal" (
    "id" SERIAL NOT NULL,
    "tekst" TEXT NOT NULL,
    "svaralternativer" TEXT[],
    "riktigSvar" INTEGER NOT NULL,
    "bildeUrl" TEXT,
    "forklaring" TEXT,
    "klasser" TEXT[],
    "kategoriId" INTEGER,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizSporsmal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BildeLibrary" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "filnavn" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storrelse" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bredde" INTEGER,
    "hoyde" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BildeLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollPunkt_sikkerhetskontrollId_sjekkpunktId_key" ON "SikkerhetskontrollPunkt"("sikkerhetskontrollId", "sjekkpunktId");

-- CreateIndex
CREATE INDEX "QuizSporsmal_kategoriId_idx" ON "QuizSporsmal"("kategoriId");

-- CreateIndex
CREATE INDEX "QuizSporsmal_klasser_idx" ON "QuizSporsmal"("klasser");

-- CreateIndex
CREATE INDEX "BildeLibrary_tags_idx" ON "BildeLibrary"("tags");

-- AddForeignKey
ALTER TABLE "Sikkerhetskontroll" ADD CONSTRAINT "Sikkerhetskontroll_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sikkerhetskontroll" ADD CONSTRAINT "Sikkerhetskontroll_opprettetAvId_fkey" FOREIGN KEY ("opprettetAvId") REFERENCES "Ansatt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollPunkt" ADD CONSTRAINT "SikkerhetskontrollPunkt_sikkerhetskontrollId_fkey" FOREIGN KEY ("sikkerhetskontrollId") REFERENCES "Sikkerhetskontroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollPunkt" ADD CONSTRAINT "SikkerhetskontrollPunkt_sjekkpunktId_fkey" FOREIGN KEY ("sjekkpunktId") REFERENCES "Sjekkpunkt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ansatt" ADD CONSTRAINT "Ansatt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSporsmal" ADD CONSTRAINT "QuizSporsmal_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "QuizKategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;
