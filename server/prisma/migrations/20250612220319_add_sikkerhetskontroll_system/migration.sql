-- CreateEnum
CREATE TYPE "SikkerhetskontrollStatus" AS ENUM ('IKKE_SETT', 'SETT', 'VANSKELIG', 'MESTRET');

-- CreateEnum
CREATE TYPE "SikkerhetskontrollVanskelighetsgrad" AS ENUM ('LETT', 'MIDDELS', 'VANSKELIG');

-- CreateEnum
CREATE TYPE "SikkerhetskontrollMediaType" AS ENUM ('BILDE', 'VIDEO', 'INTERAKTIVT_DIAGRAM', 'LYDFIL');

-- CreateEnum
CREATE TYPE "SikkerhetskontrollAchievementType" AS ENUM ('FERDIGHET', 'INNSATS', 'SOSIAL', 'SPESIELL');

-- CreateTable
CREATE TABLE "SikkerhetskontrollKlasse" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "ikonUrl" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "rekkefølge" INTEGER NOT NULL DEFAULT 0,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SikkerhetskontrollKlasse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollKategori" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "ikonUrl" TEXT,
    "farge" TEXT,
    "klasseId" INTEGER NOT NULL,
    "rekkefølge" INTEGER NOT NULL DEFAULT 0,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SikkerhetskontrollKategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollSporsmal" (
    "id" SERIAL NOT NULL,
    "sporsmalTekst" TEXT NOT NULL,
    "svarKort" TEXT NOT NULL,
    "svarDetaljert" TEXT NOT NULL,
    "hvorforderVikreligTekst" TEXT NOT NULL,
    "kategoriId" INTEGER NOT NULL,
    "vanskelighetsgrad" "SikkerhetskontrollVanskelighetsgrad" NOT NULL DEFAULT 'MIDDELS',
    "rekkefølge" INTEGER NOT NULL DEFAULT 0,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SikkerhetskontrollSporsmal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollMedia" (
    "id" SERIAL NOT NULL,
    "sporsmalId" INTEGER NOT NULL,
    "mediaType" "SikkerhetskontrollMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "altTekst" TEXT NOT NULL,
    "tittel" TEXT,
    "storrelse" INTEGER,
    "varighet" INTEGER,
    "bredde" INTEGER,
    "hoyde" INTEGER,
    "rekkefølge" INTEGER NOT NULL DEFAULT 0,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SikkerhetskontrollMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollElevProgresjon" (
    "id" SERIAL NOT NULL,
    "elevId" INTEGER NOT NULL,
    "klasseId" INTEGER,
    "sporsmalId" INTEGER,
    "status" "SikkerhetskontrollStatus" NOT NULL DEFAULT 'IKKE_SETT',
    "antallRiktigeForsok" INTEGER NOT NULL DEFAULT 0,
    "antallGaleForsok" INTEGER NOT NULL DEFAULT 0,
    "sisteInteraksjonDato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "personligNotat" TEXT,
    "vanskelighetsmarkering" "SikkerhetskontrollVanskelighetsgrad",
    "xpOpptjent" INTEGER NOT NULL DEFAULT 0,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SikkerhetskontrollElevProgresjon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollAchievement" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "ikonUrl" TEXT,
    "type" "SikkerhetskontrollAchievementType" NOT NULL,
    "kriteria" JSONB NOT NULL,
    "xpBelonning" INTEGER NOT NULL DEFAULT 50,
    "sjelden" BOOLEAN NOT NULL DEFAULT false,
    "skjult" BOOLEAN NOT NULL DEFAULT false,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SikkerhetskontrollAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollElevAchievement" (
    "id" SERIAL NOT NULL,
    "elevId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "oppnaddDato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SikkerhetskontrollElevAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollBil" (
    "id" SERIAL NOT NULL,
    "elevId" INTEGER NOT NULL,
    "bilNavn" TEXT,
    "monterdeDeler" JSONB NOT NULL DEFAULT '[]',
    "totalProgresjon" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "sisteOppdatering" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SikkerhetskontrollBil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollKlasse_navn_key" ON "SikkerhetskontrollKlasse"("navn");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKlasse_aktiv_idx" ON "SikkerhetskontrollKlasse"("aktiv");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKlasse_rekkefølge_idx" ON "SikkerhetskontrollKlasse"("rekkefølge");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKategori_klasseId_aktiv_idx" ON "SikkerhetskontrollKategori"("klasseId", "aktiv");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKategori_rekkefølge_idx" ON "SikkerhetskontrollKategori"("rekkefølge");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollKategori_navn_klasseId_key" ON "SikkerhetskontrollKategori"("navn", "klasseId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollSporsmal_kategoriId_aktiv_idx" ON "SikkerhetskontrollSporsmal"("kategoriId", "aktiv");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollSporsmal_vanskelighetsgrad_idx" ON "SikkerhetskontrollSporsmal"("vanskelighetsgrad");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollSporsmal_rekkefølge_idx" ON "SikkerhetskontrollSporsmal"("rekkefølge");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollMedia_sporsmalId_idx" ON "SikkerhetskontrollMedia"("sporsmalId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollMedia_mediaType_idx" ON "SikkerhetskontrollMedia"("mediaType");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollMedia_rekkefølge_idx" ON "SikkerhetskontrollMedia"("rekkefølge");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_elevId_klasseId_idx" ON "SikkerhetskontrollElevProgresjon"("elevId", "klasseId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_elevId_sporsmalId_idx" ON "SikkerhetskontrollElevProgresjon"("elevId", "sporsmalId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_status_idx" ON "SikkerhetskontrollElevProgresjon"("status");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_sisteInteraksjonDato_idx" ON "SikkerhetskontrollElevProgresjon"("sisteInteraksjonDato");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollElevProgresjon_elevId_sporsmalId_key" ON "SikkerhetskontrollElevProgresjon"("elevId", "sporsmalId");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollAchievement_navn_key" ON "SikkerhetskontrollAchievement"("navn");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollAchievement_type_idx" ON "SikkerhetskontrollAchievement"("type");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollAchievement_aktiv_idx" ON "SikkerhetskontrollAchievement"("aktiv");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevAchievement_elevId_idx" ON "SikkerhetskontrollElevAchievement"("elevId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevAchievement_oppnaddDato_idx" ON "SikkerhetskontrollElevAchievement"("oppnaddDato");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollElevAchievement_elevId_achievementId_key" ON "SikkerhetskontrollElevAchievement"("elevId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollBil_elevId_key" ON "SikkerhetskontrollBil"("elevId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollBil_totalProgresjon_idx" ON "SikkerhetskontrollBil"("totalProgresjon");

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollKategori" ADD CONSTRAINT "SikkerhetskontrollKategori_klasseId_fkey" FOREIGN KEY ("klasseId") REFERENCES "SikkerhetskontrollKlasse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollSporsmal" ADD CONSTRAINT "SikkerhetskontrollSporsmal_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "SikkerhetskontrollKategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollMedia" ADD CONSTRAINT "SikkerhetskontrollMedia_sporsmalId_fkey" FOREIGN KEY ("sporsmalId") REFERENCES "SikkerhetskontrollSporsmal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollElevProgresjon" ADD CONSTRAINT "SikkerhetskontrollElevProgresjon_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollElevProgresjon" ADD CONSTRAINT "SikkerhetskontrollElevProgresjon_klasseId_fkey" FOREIGN KEY ("klasseId") REFERENCES "SikkerhetskontrollKlasse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollElevProgresjon" ADD CONSTRAINT "SikkerhetskontrollElevProgresjon_sporsmalId_fkey" FOREIGN KEY ("sporsmalId") REFERENCES "SikkerhetskontrollSporsmal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollElevAchievement" ADD CONSTRAINT "SikkerhetskontrollElevAchievement_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollElevAchievement" ADD CONSTRAINT "SikkerhetskontrollElevAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "SikkerhetskontrollAchievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SikkerhetskontrollBil" ADD CONSTRAINT "SikkerhetskontrollBil_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev"("id") ON DELETE CASCADE ON UPDATE CASCADE;
