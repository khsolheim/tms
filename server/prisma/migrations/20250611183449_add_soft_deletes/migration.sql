-- AlterTable
ALTER TABLE "Ansatt" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Bedrift" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "BildeLibrary" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Elev" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ElevSoknad" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Kjoretoy" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Kontrakt" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "QuizKategori" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "QuizSporsmal" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "userId" INTEGER,
    "changes" JSONB NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "emne" TEXT NOT NULL,
    "innhold" TEXT NOT NULL,
    "variabler" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kategori" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "systemMal" BOOLEAN NOT NULL DEFAULT false,
    "beskrivelse" TEXT,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "mottakerId" INTEGER NOT NULL,
    "tittel" TEXT NOT NULL,
    "melding" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "lest" BOOLEAN NOT NULL DEFAULT false,
    "lestTidspunkt" TIMESTAMP(3),
    "lenke" TEXT,
    "metadata" JSONB,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAttachment" (
    "id" SERIAL NOT NULL,
    "originalName" TEXT NOT NULL,
    "filnavn" TEXT NOT NULL,
    "filsti" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storrelse" INTEGER NOT NULL,
    "sjekksumMD5" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "opploadetAv" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kategori" TEXT NOT NULL,
    "relatertId" INTEGER,
    "relatertTabell" TEXT,
    "virussjekket" BOOLEAN NOT NULL DEFAULT false,
    "godkjent" BOOLEAN NOT NULL DEFAULT false,
    "offentlig" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FileAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" SERIAL NOT NULL,
    "kontraktId" INTEGER NOT NULL,
    "referanse" TEXT NOT NULL,
    "belop" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "forfallsdato" TIMESTAMP(3) NOT NULL,
    "betalingsdato" TIMESTAMP(3),
    "transaksjonsId" TEXT,
    "betalingsmetode" TEXT,
    "feilmelding" TEXT,
    "metadata" JSONB,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" SERIAL NOT NULL,
    "mottaker" TEXT NOT NULL,
    "emne" TEXT NOT NULL,
    "templateId" INTEGER,
    "status" TEXT NOT NULL,
    "messageId" TEXT,
    "feilmelding" TEXT,
    "sendeforsoker" INTEGER NOT NULL DEFAULT 1,
    "sistForsokt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendt" TIMESTAMP(3),
    "lest" BOOLEAN NOT NULL DEFAULT false,
    "klikket" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_tableName_recordId_idx" ON "AuditLog"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_tableName_timestamp_idx" ON "AuditLog"("tableName", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_navn_key" ON "EmailTemplate"("navn");

-- CreateIndex
CREATE INDEX "EmailTemplate_kategori_idx" ON "EmailTemplate"("kategori");

-- CreateIndex
CREATE INDEX "EmailTemplate_aktiv_idx" ON "EmailTemplate"("aktiv");

-- CreateIndex
CREATE INDEX "EmailTemplate_systemMal_idx" ON "EmailTemplate"("systemMal");

-- CreateIndex
CREATE INDEX "EmailTemplate_isDeleted_idx" ON "EmailTemplate"("isDeleted");

-- CreateIndex
CREATE INDEX "EmailTemplate_deletedAt_idx" ON "EmailTemplate"("deletedAt");

-- CreateIndex
CREATE INDEX "Notification_mottakerId_lest_idx" ON "Notification"("mottakerId", "lest");

-- CreateIndex
CREATE INDEX "Notification_opprettet_idx" ON "Notification"("opprettet");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_kategori_idx" ON "Notification"("kategori");

-- CreateIndex
CREATE INDEX "Notification_mottakerId_opprettet_idx" ON "Notification"("mottakerId", "opprettet");

-- CreateIndex
CREATE INDEX "FileAttachment_opploadetAv_idx" ON "FileAttachment"("opploadetAv");

-- CreateIndex
CREATE INDEX "FileAttachment_kategori_relatertId_idx" ON "FileAttachment"("kategori", "relatertId");

-- CreateIndex
CREATE INDEX "FileAttachment_opprettet_idx" ON "FileAttachment"("opprettet");

-- CreateIndex
CREATE INDEX "FileAttachment_mimeType_idx" ON "FileAttachment"("mimeType");

-- CreateIndex
CREATE INDEX "FileAttachment_godkjent_idx" ON "FileAttachment"("godkjent");

-- CreateIndex
CREATE INDEX "FileAttachment_relatertTabell_relatertId_idx" ON "FileAttachment"("relatertTabell", "relatertId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_referanse_key" ON "PaymentTransaction"("referanse");

-- CreateIndex
CREATE INDEX "PaymentTransaction_kontraktId_idx" ON "PaymentTransaction"("kontraktId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_forfallsdato_idx" ON "PaymentTransaction"("forfallsdato");

-- CreateIndex
CREATE INDEX "PaymentTransaction_type_idx" ON "PaymentTransaction"("type");

-- CreateIndex
CREATE INDEX "PaymentTransaction_referanse_idx" ON "PaymentTransaction"("referanse");

-- CreateIndex
CREATE INDEX "PaymentTransaction_betalingsdato_idx" ON "PaymentTransaction"("betalingsdato");

-- CreateIndex
CREATE INDEX "PaymentTransaction_kontraktId_status_idx" ON "PaymentTransaction"("kontraktId", "status");

-- CreateIndex
CREATE INDEX "EmailLog_mottaker_idx" ON "EmailLog"("mottaker");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_opprettet_idx" ON "EmailLog"("opprettet");

-- CreateIndex
CREATE INDEX "EmailLog_templateId_idx" ON "EmailLog"("templateId");

-- CreateIndex
CREATE INDEX "EmailLog_sendt_idx" ON "EmailLog"("sendt");

-- CreateIndex
CREATE INDEX "EmailLog_sistForsokt_idx" ON "EmailLog"("sistForsokt");

-- CreateIndex
CREATE INDEX "Ansatt_isDeleted_idx" ON "Ansatt"("isDeleted");

-- CreateIndex
CREATE INDEX "Ansatt_deletedAt_idx" ON "Ansatt"("deletedAt");

-- CreateIndex
CREATE INDEX "Bedrift_isDeleted_idx" ON "Bedrift"("isDeleted");

-- CreateIndex
CREATE INDEX "Bedrift_deletedAt_idx" ON "Bedrift"("deletedAt");

-- CreateIndex
CREATE INDEX "BildeLibrary_isDeleted_idx" ON "BildeLibrary"("isDeleted");

-- CreateIndex
CREATE INDEX "BildeLibrary_deletedAt_idx" ON "BildeLibrary"("deletedAt");

-- CreateIndex
CREATE INDEX "Elev_isDeleted_idx" ON "Elev"("isDeleted");

-- CreateIndex
CREATE INDEX "Elev_deletedAt_idx" ON "Elev"("deletedAt");

-- CreateIndex
CREATE INDEX "ElevSoknad_isDeleted_idx" ON "ElevSoknad"("isDeleted");

-- CreateIndex
CREATE INDEX "ElevSoknad_deletedAt_idx" ON "ElevSoknad"("deletedAt");

-- CreateIndex
CREATE INDEX "Kjoretoy_isDeleted_idx" ON "Kjoretoy"("isDeleted");

-- CreateIndex
CREATE INDEX "Kjoretoy_deletedAt_idx" ON "Kjoretoy"("deletedAt");

-- CreateIndex
CREATE INDEX "Kontrakt_isDeleted_idx" ON "Kontrakt"("isDeleted");

-- CreateIndex
CREATE INDEX "Kontrakt_deletedAt_idx" ON "Kontrakt"("deletedAt");

-- CreateIndex
CREATE INDEX "QuizKategori_isDeleted_idx" ON "QuizKategori"("isDeleted");

-- CreateIndex
CREATE INDEX "QuizKategori_deletedAt_idx" ON "QuizKategori"("deletedAt");

-- CreateIndex
CREATE INDEX "QuizSporsmal_isDeleted_idx" ON "QuizSporsmal"("isDeleted");

-- CreateIndex
CREATE INDEX "QuizSporsmal_deletedAt_idx" ON "QuizSporsmal"("deletedAt");

-- AddForeignKey
ALTER TABLE "Bedrift" ADD CONSTRAINT "Bedrift_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kjoretoy" ADD CONSTRAINT "Kjoretoy_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizKategori" ADD CONSTRAINT "QuizKategori_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizSporsmal" ADD CONSTRAINT "QuizSporsmal_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BildeLibrary" ADD CONSTRAINT "BildeLibrary_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Elev" ADD CONSTRAINT "Elev_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kontrakt" ADD CONSTRAINT "Kontrakt_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_mottakerId_fkey" FOREIGN KEY ("mottakerId") REFERENCES "Ansatt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_opploadetAv_fkey" FOREIGN KEY ("opploadetAv") REFERENCES "Ansatt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_kontraktId_fkey" FOREIGN KEY ("kontraktId") REFERENCES "Kontrakt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
