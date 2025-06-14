/*
  Warnings:

  - A unique constraint covering the columns `[klassekode,bedriftId]` on the table `BedriftsKlasse` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[filnavn]` on the table `BildeLibrary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `BildeLibrary` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personnummer,bedriftId]` on the table `ElevSoknad` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[navn,klasse]` on the table `QuizKategori` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "BedriftsKlasse" DROP CONSTRAINT "BedriftsKlasse_bedriftId_fkey";

-- DropForeignKey
ALTER TABLE "ElevSoknad" DROP CONSTRAINT "ElevSoknad_bedriftId_fkey";

-- DropForeignKey
ALTER TABLE "Kjoretoy" DROP CONSTRAINT "Kjoretoy_bedriftId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_mottakerId_fkey";

-- CreateTable
CREATE TABLE "IntegrationProvider" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "apiBaseUrl" TEXT,
    "dokumentasjon" TEXT,
    "logoUrl" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "tilgjengelig" BOOLEAN NOT NULL DEFAULT true,
    "versjon" TEXT,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationConfiguration" (
    "id" SERIAL NOT NULL,
    "bedriftId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "navn" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT false,
    "autoSync" BOOLEAN NOT NULL DEFAULT false,
    "syncInterval" INTEGER,
    "lastSync" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "konfigurasjonsdata" JSONB NOT NULL,
    "syncKunder" BOOLEAN NOT NULL DEFAULT true,
    "syncFakturaer" BOOLEAN NOT NULL DEFAULT true,
    "syncProdukter" BOOLEAN NOT NULL DEFAULT false,
    "syncKontrakter" BOOLEAN NOT NULL DEFAULT true,
    "feltMapping" JSONB DEFAULT '{}',
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryInterval" INTEGER NOT NULL DEFAULT 5,
    "feilVarsling" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opprettetAv" INTEGER NOT NULL,

    CONSTRAINT "IntegrationConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationLog" (
    "id" SERIAL NOT NULL,
    "bedriftId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "konfigurasjonsId" INTEGER,
    "operasjon" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "melding" TEXT,
    "feildetaljer" TEXT,
    "metadata" JSONB,
    "starttid" TIMESTAMP(3) NOT NULL,
    "sluttid" TIMESTAMP(3),
    "varighet" INTEGER,
    "relatertTabell" TEXT,
    "relatertId" INTEGER,
    "eksternReferanse" TEXT,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationSyncJob" (
    "id" SERIAL NOT NULL,
    "konfigurasjonsId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "prioritet" INTEGER NOT NULL DEFAULT 5,
    "planlagtTid" TIMESTAMP(3) NOT NULL,
    "starttid" TIMESTAMP(3),
    "sluttid" TIMESTAMP(3),
    "varighet" INTEGER,
    "totalOppgaver" INTEGER,
    "ferdigeOppgaver" INTEGER NOT NULL DEFAULT 0,
    "feiledOppgaver" INTEGER NOT NULL DEFAULT 0,
    "progressMelding" TEXT,
    "resultatSammendrag" JSONB,
    "feilmelding" TEXT,
    "forsoker" INTEGER NOT NULL DEFAULT 0,
    "maksForsok" INTEGER NOT NULL DEFAULT 3,
    "nesteForsoket" TIMESTAMP(3),
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationSyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationProvider_navn_key" ON "IntegrationProvider"("navn");

-- CreateIndex
CREATE INDEX "IntegrationProvider_type_idx" ON "IntegrationProvider"("type");

-- CreateIndex
CREATE INDEX "IntegrationProvider_aktiv_idx" ON "IntegrationProvider"("aktiv");

-- CreateIndex
CREATE INDEX "IntegrationProvider_type_aktiv_idx" ON "IntegrationProvider"("type", "aktiv");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_bedriftId_idx" ON "IntegrationConfiguration"("bedriftId");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_providerId_idx" ON "IntegrationConfiguration"("providerId");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_aktiv_idx" ON "IntegrationConfiguration"("aktiv");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_autoSync_idx" ON "IntegrationConfiguration"("autoSync");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_lastSync_idx" ON "IntegrationConfiguration"("lastSync");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_bedriftId_aktiv_idx" ON "IntegrationConfiguration"("bedriftId", "aktiv");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConfiguration_bedriftId_providerId_key" ON "IntegrationConfiguration"("bedriftId", "providerId");

-- CreateIndex
CREATE INDEX "IntegrationLog_bedriftId_idx" ON "IntegrationLog"("bedriftId");

-- CreateIndex
CREATE INDEX "IntegrationLog_providerId_idx" ON "IntegrationLog"("providerId");

-- CreateIndex
CREATE INDEX "IntegrationLog_status_idx" ON "IntegrationLog"("status");

-- CreateIndex
CREATE INDEX "IntegrationLog_opprettet_idx" ON "IntegrationLog"("opprettet");

-- CreateIndex
CREATE INDEX "IntegrationLog_operasjon_idx" ON "IntegrationLog"("operasjon");

-- CreateIndex
CREATE INDEX "IntegrationLog_bedriftId_status_idx" ON "IntegrationLog"("bedriftId", "status");

-- CreateIndex
CREATE INDEX "IntegrationLog_providerId_status_idx" ON "IntegrationLog"("providerId", "status");

-- CreateIndex
CREATE INDEX "IntegrationLog_relatertTabell_relatertId_idx" ON "IntegrationLog"("relatertTabell", "relatertId");

-- CreateIndex
CREATE INDEX "IntegrationLog_eksternReferanse_idx" ON "IntegrationLog"("eksternReferanse");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_status_idx" ON "IntegrationSyncJob"("status");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_planlagtTid_idx" ON "IntegrationSyncJob"("planlagtTid");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_prioritet_idx" ON "IntegrationSyncJob"("prioritet");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_konfigurasjonsId_idx" ON "IntegrationSyncJob"("konfigurasjonsId");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_type_idx" ON "IntegrationSyncJob"("type");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_status_planlagtTid_idx" ON "IntegrationSyncJob"("status", "planlagtTid");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_konfigurasjonsId_status_idx" ON "IntegrationSyncJob"("konfigurasjonsId", "status");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_nesteForsoket_idx" ON "IntegrationSyncJob"("nesteForsoket");

-- CreateIndex
CREATE INDEX "BedriftsKlasse_bedriftId_idx" ON "BedriftsKlasse"("bedriftId");

-- CreateIndex
CREATE INDEX "BedriftsKlasse_klassekode_idx" ON "BedriftsKlasse"("klassekode");

-- CreateIndex
CREATE UNIQUE INDEX "BedriftsKlasse_klassekode_bedriftId_key" ON "BedriftsKlasse"("klassekode", "bedriftId");

-- CreateIndex
CREATE UNIQUE INDEX "BildeLibrary_filnavn_key" ON "BildeLibrary"("filnavn");

-- CreateIndex
CREATE UNIQUE INDEX "BildeLibrary_url_key" ON "BildeLibrary"("url");

-- CreateIndex
CREATE INDEX "ElevSoknad_bedriftId_status_idx" ON "ElevSoknad"("bedriftId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ElevSoknad_personnummer_bedriftId_key" ON "ElevSoknad"("personnummer", "bedriftId");

-- CreateIndex
CREATE INDEX "EmailLog_mottaker_status_idx" ON "EmailLog"("mottaker", "status");

-- CreateIndex
CREATE INDEX "EmailLog_status_sistForsokt_idx" ON "EmailLog"("status", "sistForsokt");

-- CreateIndex
CREATE INDEX "EmailTemplate_kategori_aktiv_idx" ON "EmailTemplate"("kategori", "aktiv");

-- CreateIndex
CREATE INDEX "Kjoretoy_merke_modell_idx" ON "Kjoretoy"("merke", "modell");

-- CreateIndex
CREATE INDEX "Kjoretoy_status_idx" ON "Kjoretoy"("status");

-- CreateIndex
CREATE INDEX "Kjoretoy_aarsmodell_idx" ON "Kjoretoy"("aarsmodell");

-- CreateIndex
CREATE INDEX "Notification_mottakerId_type_idx" ON "Notification"("mottakerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "QuizKategori_navn_klasse_key" ON "QuizKategori"("navn", "klasse");

-- CreateIndex
CREATE INDEX "User_epost_idx" ON "User"("epost");

-- CreateIndex
CREATE INDEX "User_rolle_idx" ON "User"("rolle");

-- AddForeignKey
ALTER TABLE "BedriftsKlasse" ADD CONSTRAINT "BedriftsKlasse_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kjoretoy" ADD CONSTRAINT "Kjoretoy_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevSoknad" ADD CONSTRAINT "ElevSoknad_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_mottakerId_fkey" FOREIGN KEY ("mottakerId") REFERENCES "Ansatt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConfiguration" ADD CONSTRAINT "IntegrationConfiguration_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConfiguration" ADD CONSTRAINT "IntegrationConfiguration_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationConfiguration" ADD CONSTRAINT "IntegrationConfiguration_opprettetAv_fkey" FOREIGN KEY ("opprettetAv") REFERENCES "Ansatt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_konfigurasjonsId_fkey" FOREIGN KEY ("konfigurasjonsId") REFERENCES "IntegrationConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationSyncJob" ADD CONSTRAINT "IntegrationSyncJob_konfigurasjonsId_fkey" FOREIGN KEY ("konfigurasjonsId") REFERENCES "IntegrationConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
