-- AlterTable
ALTER TABLE "Ansatt" ADD COLUMN     "aktiv" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sisteInnlogging" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SystemConfig" ADD COLUMN     "emailFrom" TEXT,
ADD COLUMN     "emailReplyTo" TEXT,
ADD COLUMN     "emailVarsler" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "epost" TEXT,
ADD COLUMN     "fakturaForfall" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "fakturaPrefix" TEXT,
ADD COLUMN     "fakturaRente" DOUBLE PRECISION NOT NULL DEFAULT 8.5,
ADD COLUMN     "fakturaStartNummer" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "loginUtløpstid" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "maksAntallAnsatte" INTEGER,
ADD COLUMN     "maksAntallElever" INTEGER,
ADD COLUMN     "organisasjonsnummer" TEXT,
ADD COLUMN     "postnummer" TEXT,
ADD COLUMN     "smtpHost" TEXT,
ADD COLUMN     "smtpPort" INTEGER;
