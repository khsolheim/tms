-- CreateEnum
CREATE TYPE "KontraktStatus" AS ENUM ('UTKAST', 'GODKJENT', 'SIGNERT', 'AKTIV', 'AVSLUTTET', 'KANSELLERT');

-- CreateTable
CREATE TABLE "Kontrakt" (
    "id" SERIAL NOT NULL,
    "elevId" INTEGER,
    "elevFornavn" TEXT NOT NULL,
    "elevEtternavn" TEXT NOT NULL,
    "elevPersonnummer" TEXT NOT NULL,
    "elevTelefon" TEXT NOT NULL,
    "elevEpost" TEXT NOT NULL,
    "elevGate" TEXT NOT NULL,
    "elevPostnr" TEXT NOT NULL,
    "elevPoststed" TEXT NOT NULL,
    "harFakturaansvarlig" BOOLEAN NOT NULL DEFAULT false,
    "fakturaansvarligFornavn" TEXT,
    "fakturaansvarligEtternavn" TEXT,
    "fakturaansvarligPersonnummer" TEXT,
    "fakturaansvarligTelefon" TEXT,
    "fakturaansvarligEpost" TEXT,
    "fakturaansvarligGate" TEXT,
    "fakturaansvarligPostnr" TEXT,
    "fakturaansvarligPoststed" TEXT,
    "lan" INTEGER NOT NULL,
    "lopetid" INTEGER NOT NULL,
    "rente" DOUBLE PRECISION NOT NULL,
    "etableringsgebyr" INTEGER NOT NULL,
    "termingebyr" INTEGER NOT NULL,
    "terminerPerAr" INTEGER NOT NULL DEFAULT 12,
    "inkludererGebyrerILan" BOOLEAN NOT NULL DEFAULT false,
    "effektivRente" DOUBLE PRECISION NOT NULL,
    "renterOgGebyr" INTEGER NOT NULL,
    "terminbelop" INTEGER NOT NULL,
    "totalRente" INTEGER NOT NULL,
    "totalBelop" INTEGER NOT NULL,
    "status" "KontraktStatus" NOT NULL DEFAULT 'UTKAST',
    "bedriftId" INTEGER NOT NULL,
    "opprettetAv" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kontrakt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Kontrakt_bedriftId_idx" ON "Kontrakt"("bedriftId");

-- CreateIndex
CREATE INDEX "Kontrakt_elevId_idx" ON "Kontrakt"("elevId");

-- CreateIndex
CREATE INDEX "Kontrakt_status_idx" ON "Kontrakt"("status");

-- AddForeignKey
ALTER TABLE "Kontrakt" ADD CONSTRAINT "Kontrakt_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kontrakt" ADD CONSTRAINT "Kontrakt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kontrakt" ADD CONSTRAINT "Kontrakt_opprettetAv_fkey" FOREIGN KEY ("opprettetAv") REFERENCES "Ansatt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
