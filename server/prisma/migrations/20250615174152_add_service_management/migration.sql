/*
  Warnings:

  - You are about to drop the column `hovedkjøretøy` on the `Ansatt` table. All the data in the column will be lost.
  - You are about to drop the column `kjøretøy` on the `Ansatt` table. All the data in the column will be lost.
  - You are about to drop the column `næringskode` on the `Bedrift` table. All the data in the column will be lost.
  - You are about to drop the column `næringskodeKode` on the `Bedrift` table. All the data in the column will be lost.
  - You are about to drop the column `søkeord` on the `HjelpArtikkel` table. All the data in the column will be lost.
  - You are about to drop the column `visningsrekkkefølge` on the `HjelpArtikkel` table. All the data in the column will be lost.
  - You are about to drop the column `rekkefølge` on the `HjelpKategori` table. All the data in the column will be lost.
  - You are about to drop the column `påkrevd` on the `KontrollMalPunkt` table. All the data in the column will be lost.
  - You are about to drop the column `rekkefølge` on the `KontrollMalPunkt` table. All the data in the column will be lost.
  - You are about to drop the column `basertPåMalId` on the `Sikkerhetskontroll` table. All the data in the column will be lost.
  - You are about to drop the column `rekkefølge` on the `SikkerhetskontrollKategori` table. All the data in the column will be lost.
  - You are about to drop the column `rekkefølge` on the `SikkerhetskontrollKlasse` table. All the data in the column will be lost.
  - You are about to drop the column `rekkefølge` on the `SikkerhetskontrollMedia` table. All the data in the column will be lost.
  - You are about to drop the column `påkrevd` on the `SikkerhetskontrollPunkt` table. All the data in the column will be lost.
  - You are about to drop the column `rekkefølge` on the `SikkerhetskontrollPunkt` table. All the data in the column will be lost.
  - You are about to drop the column `rekkefølge` on the `SikkerhetskontrollSporsmal` table. All the data in the column will be lost.
  - You are about to drop the column `rekkefølge` on the `SjekkpunktSystemer` table. All the data in the column will be lost.
  - You are about to drop the column `loginUtløpstid` on the `SystemConfig` table. All the data in the column will be lost.
  - You are about to drop the `FørerkortKlasser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Økonomipost` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[navn]` on the table `HjelpKategori` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rekkefolge` to the `KontrollMalPunkt` table without a default value. This is not possible if the table is not empty.
  - Made the column `kommentarer` on table `Oppgave` required. This step will fail if there are existing NULL values in that column.
  - Made the column `forbruktBudget` on table `Prosjekt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `milepaler` on table `Prosjekt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `risikofaktorer` on table `Prosjekt` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ledigTid` on table `Ressurs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `antallPersoner` on table `RessursBooking` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `rekkefolge` to the `SikkerhetskontrollPunkt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('HR', 'ECONOMY', 'QUIZ', 'SIKKERHETSKONTROLL', 'FORERKORT', 'KURS', 'RAPPORTER', 'INTEGRASJONER');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DEPRECATED');

-- DropForeignKey
ALTER TABLE "Sikkerhetskontroll" DROP CONSTRAINT "Sikkerhetskontroll_basertPåMalId_fkey";

-- DropForeignKey
ALTER TABLE "Økonomipost" DROP CONSTRAINT "Økonomipost_bedriftId_fkey";

-- DropForeignKey
ALTER TABLE "Økonomipost" DROP CONSTRAINT "Økonomipost_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "Økonomipost" DROP CONSTRAINT "Økonomipost_registrertAv_fkey";

-- DropIndex
DROP INDEX "HjelpKategori_rekkefølge_idx";

-- DropIndex
DROP INDEX "Sikkerhetskontroll_basertPåMalId_idx";

-- DropIndex
DROP INDEX "SikkerhetskontrollKategori_rekkefølge_idx";

-- DropIndex
DROP INDEX "SikkerhetskontrollKlasse_rekkefølge_idx";

-- DropIndex
DROP INDEX "SikkerhetskontrollMedia_rekkefølge_idx";

-- DropIndex
DROP INDEX "SikkerhetskontrollSporsmal_rekkefølge_idx";

-- DropIndex
DROP INDEX "SjekkpunktSystemer_rekkefølge_idx";

-- AlterTable
ALTER TABLE "Ansatt" DROP COLUMN "hovedkjøretøy",
DROP COLUMN "kjøretøy",
ADD COLUMN     "hovedkjoretoy" INTEGER,
ADD COLUMN     "kjoretoy" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "Bedrift" DROP COLUMN "næringskode",
DROP COLUMN "næringskodeKode",
ADD COLUMN     "naeringskode" TEXT,
ADD COLUMN     "naeringskodeKode" TEXT;

-- AlterTable
ALTER TABLE "HjelpArtikkel" DROP COLUMN "søkeord",
DROP COLUMN "visningsrekkkefølge",
ADD COLUMN     "sokeord" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "visningsrekkefolge" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "HjelpKategori" DROP COLUMN "rekkefølge",
ADD COLUMN     "rekkefolge" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "KontrollMalPunkt" DROP COLUMN "påkrevd",
DROP COLUMN "rekkefølge",
ADD COLUMN     "pakrevd" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "rekkefolge" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Oppgave" ALTER COLUMN "kommentarer" SET NOT NULL;

-- AlterTable
ALTER TABLE "Prosjekt" ALTER COLUMN "forbruktBudget" SET NOT NULL,
ALTER COLUMN "milepaler" SET NOT NULL,
ALTER COLUMN "risikofaktorer" SET NOT NULL;

-- AlterTable
ALTER TABLE "Ressurs" ALTER COLUMN "ledigTid" SET NOT NULL;

-- AlterTable
ALTER TABLE "RessursBooking" ALTER COLUMN "antallPersoner" SET NOT NULL;

-- AlterTable
ALTER TABLE "Sikkerhetskontroll" DROP COLUMN "basertPåMalId",
ADD COLUMN     "basertPaMalId" INTEGER;

-- AlterTable
ALTER TABLE "SikkerhetskontrollKategori" DROP COLUMN "rekkefølge",
ADD COLUMN     "rekkefolge" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SikkerhetskontrollKlasse" DROP COLUMN "rekkefølge",
ADD COLUMN     "rekkefolge" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SikkerhetskontrollMedia" DROP COLUMN "rekkefølge",
ADD COLUMN     "rekkefolge" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SikkerhetskontrollPunkt" DROP COLUMN "påkrevd",
DROP COLUMN "rekkefølge",
ADD COLUMN     "pakrevd" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "rekkefolge" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SikkerhetskontrollSporsmal" DROP COLUMN "rekkefølge",
ADD COLUMN     "rekkefolge" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SjekkpunktSystemer" DROP COLUMN "rekkefølge",
ADD COLUMN     "rekkefolge" INTEGER;

-- AlterTable
ALTER TABLE "SystemConfig" DROP COLUMN "loginUtløpstid",
ADD COLUMN     "loginUtlopstid" INTEGER NOT NULL DEFAULT 24;

-- DropTable
DROP TABLE "FørerkortKlasser";

-- DropTable
DROP TABLE "Økonomipost";

-- CreateTable
CREATE TABLE "ForerkortKlasser" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kategori" TEXT,
    "minimumsalder" INTEGER,
    "krav" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForerkortKlasser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Okonomipost" (
    "id" SERIAL NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "belop" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "dato" TIMESTAMP(3) NOT NULL,
    "referanse" TEXT,
    "mottaker" TEXT,
    "konto" TEXT,
    "mva" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'REGISTRERT',
    "relatertTabell" TEXT,
    "relatertId" INTEGER,
    "bedriftId" INTEGER NOT NULL,
    "registrertAv" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Okonomipost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "versjon" TEXT NOT NULL DEFAULT '1.0.0',
    "konfiguration" JSONB DEFAULT '{}',
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedriftService" (
    "id" SERIAL NOT NULL,
    "bedriftId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivatedAt" TIMESTAMP(3),
    "activatedBy" INTEGER NOT NULL,
    "deactivatedBy" INTEGER,
    "konfiguration" JSONB DEFAULT '{}',
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BedriftService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ForerkortKlasser_kode_key" ON "ForerkortKlasser"("kode");

-- CreateIndex
CREATE INDEX "ForerkortKlasser_aktiv_idx" ON "ForerkortKlasser"("aktiv");

-- CreateIndex
CREATE INDEX "ForerkortKlasser_kategori_idx" ON "ForerkortKlasser"("kategori");

-- CreateIndex
CREATE INDEX "Okonomipost_bedriftId_idx" ON "Okonomipost"("bedriftId");

-- CreateIndex
CREATE INDEX "Okonomipost_type_idx" ON "Okonomipost"("type");

-- CreateIndex
CREATE INDEX "Okonomipost_kategori_idx" ON "Okonomipost"("kategori");

-- CreateIndex
CREATE INDEX "Okonomipost_dato_idx" ON "Okonomipost"("dato");

-- CreateIndex
CREATE INDEX "Okonomipost_status_idx" ON "Okonomipost"("status");

-- CreateIndex
CREATE INDEX "Okonomipost_registrertAv_idx" ON "Okonomipost"("registrertAv");

-- CreateIndex
CREATE INDEX "Okonomipost_isDeleted_idx" ON "Okonomipost"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Service_navn_key" ON "Service"("navn");

-- CreateIndex
CREATE INDEX "Service_type_idx" ON "Service"("type");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE INDEX "Service_navn_idx" ON "Service"("navn");

-- CreateIndex
CREATE INDEX "BedriftService_bedriftId_idx" ON "BedriftService"("bedriftId");

-- CreateIndex
CREATE INDEX "BedriftService_serviceId_idx" ON "BedriftService"("serviceId");

-- CreateIndex
CREATE INDEX "BedriftService_isActive_idx" ON "BedriftService"("isActive");

-- CreateIndex
CREATE INDEX "BedriftService_activatedAt_idx" ON "BedriftService"("activatedAt");

-- CreateIndex
CREATE INDEX "BedriftService_bedriftId_isActive_idx" ON "BedriftService"("bedriftId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BedriftService_bedriftId_serviceId_key" ON "BedriftService"("bedriftId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "HjelpKategori_navn_key" ON "HjelpKategori"("navn");

-- CreateIndex
CREATE INDEX "HjelpKategori_rekkefolge_idx" ON "HjelpKategori"("rekkefolge");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_basertPaMalId_idx" ON "Sikkerhetskontroll"("basertPaMalId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKategori_rekkefolge_idx" ON "SikkerhetskontrollKategori"("rekkefolge");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKlasse_rekkefolge_idx" ON "SikkerhetskontrollKlasse"("rekkefolge");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollMedia_rekkefolge_idx" ON "SikkerhetskontrollMedia"("rekkefolge");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollSporsmal_rekkefolge_idx" ON "SikkerhetskontrollSporsmal"("rekkefolge");

-- CreateIndex
CREATE INDEX "SjekkpunktSystemer_rekkefolge_idx" ON "SjekkpunktSystemer"("rekkefolge");

-- AddForeignKey
ALTER TABLE "Sikkerhetskontroll" ADD CONSTRAINT "Sikkerhetskontroll_basertPaMalId_fkey" FOREIGN KEY ("basertPaMalId") REFERENCES "KontrollMal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HjelpArtikkel" ADD CONSTRAINT "HjelpArtikkel_kategori_fkey" FOREIGN KEY ("kategori") REFERENCES "HjelpKategori"("navn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Okonomipost" ADD CONSTRAINT "Okonomipost_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Okonomipost" ADD CONSTRAINT "Okonomipost_registrertAv_fkey" FOREIGN KEY ("registrertAv") REFERENCES "Ansatt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Okonomipost" ADD CONSTRAINT "Okonomipost_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedriftService" ADD CONSTRAINT "BedriftService_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedriftService" ADD CONSTRAINT "BedriftService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedriftService" ADD CONSTRAINT "BedriftService_activatedBy_fkey" FOREIGN KEY ("activatedBy") REFERENCES "Ansatt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedriftService" ADD CONSTRAINT "BedriftService_deactivatedBy_fkey" FOREIGN KEY ("deactivatedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
