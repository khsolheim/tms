-- AlterTable
ALTER TABLE "Sikkerhetskontroll" ADD COLUMN     "basertPåMalId" INTEGER;

-- CreateTable
CREATE TABLE "KontrollMal" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kategori" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "opprettetAvId" INTEGER NOT NULL,
    "offentlig" BOOLEAN NOT NULL DEFAULT true,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "bruktAntall" INTEGER NOT NULL DEFAULT 0,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KontrollMal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KontrollMalPunkt" (
    "id" SERIAL NOT NULL,
    "kontrollMalId" INTEGER NOT NULL,
    "sjekkpunktId" INTEGER NOT NULL,
    "rekkefølge" INTEGER NOT NULL,
    "kanGodkjennesAv" "GodkjentAv" NOT NULL DEFAULT 'LÆRER',
    "påkrevd" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KontrollMalPunkt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KontrollMal_kategori_idx" ON "KontrollMal"("kategori");

-- CreateIndex
CREATE INDEX "KontrollMal_offentlig_idx" ON "KontrollMal"("offentlig");

-- CreateIndex
CREATE INDEX "KontrollMal_tags_idx" ON "KontrollMal"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "KontrollMalPunkt_kontrollMalId_sjekkpunktId_key" ON "KontrollMalPunkt"("kontrollMalId", "sjekkpunktId");

-- AddForeignKey
ALTER TABLE "KontrollMal" ADD CONSTRAINT "KontrollMal_opprettetAvId_fkey" FOREIGN KEY ("opprettetAvId") REFERENCES "Ansatt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontrollMalPunkt" ADD CONSTRAINT "KontrollMalPunkt_kontrollMalId_fkey" FOREIGN KEY ("kontrollMalId") REFERENCES "KontrollMal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontrollMalPunkt" ADD CONSTRAINT "KontrollMalPunkt_sjekkpunktId_fkey" FOREIGN KEY ("sjekkpunktId") REFERENCES "Sjekkpunkt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sikkerhetskontroll" ADD CONSTRAINT "Sikkerhetskontroll_basertPåMalId_fkey" FOREIGN KEY ("basertPåMalId") REFERENCES "KontrollMal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
