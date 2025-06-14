-- AlterTable
ALTER TABLE "Sjekkpunkt" ADD COLUMN     "systemId" INTEGER;

-- CreateTable
CREATE TABLE "SjekkpunktSystemer" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "ikon" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "rekkefølge" INTEGER,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SjekkpunktSystemer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FørerkortKlasser" (
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

    CONSTRAINT "FørerkortKlasser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedDataConfig" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "beskrivelse" TEXT,
    "sist_oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeedDataConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SjekkpunktSystemer_navn_key" ON "SjekkpunktSystemer"("navn");

-- CreateIndex
CREATE INDEX "SjekkpunktSystemer_aktiv_idx" ON "SjekkpunktSystemer"("aktiv");

-- CreateIndex
CREATE INDEX "SjekkpunktSystemer_rekkefølge_idx" ON "SjekkpunktSystemer"("rekkefølge");

-- CreateIndex
CREATE UNIQUE INDEX "FørerkortKlasser_kode_key" ON "FørerkortKlasser"("kode");

-- CreateIndex
CREATE INDEX "FørerkortKlasser_aktiv_idx" ON "FørerkortKlasser"("aktiv");

-- CreateIndex
CREATE INDEX "FørerkortKlasser_kategori_idx" ON "FørerkortKlasser"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "SeedDataConfig_type_key" ON "SeedDataConfig"("type");

-- CreateIndex
CREATE INDEX "SeedDataConfig_type_idx" ON "SeedDataConfig"("type");

-- CreateIndex
CREATE INDEX "Sjekkpunkt_systemId_idx" ON "Sjekkpunkt"("systemId");

-- AddForeignKey
ALTER TABLE "Sjekkpunkt" ADD CONSTRAINT "Sjekkpunkt_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "SjekkpunktSystemer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
