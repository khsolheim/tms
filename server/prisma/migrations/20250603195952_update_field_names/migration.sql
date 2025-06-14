/*
  Warnings:

  - You are about to drop the `Ansatt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bedrift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BedriftsKlasse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ansatt" DROP CONSTRAINT "Ansatt_bedriftId_fkey";

-- DropForeignKey
ALTER TABLE "Bedrift" DROP CONSTRAINT "Bedrift_hovedbrukerId_fkey";

-- DropForeignKey
ALTER TABLE "BedriftsKlasse" DROP CONSTRAINT "BedriftsKlasse_bedriftId_fkey";

-- DropTable
DROP TABLE "Ansatt";

-- DropTable
DROP TABLE "Bedrift";

-- DropTable
DROP TABLE "BedriftsKlasse";

-- CreateTable
CREATE TABLE "bedrift" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "org_nummer" TEXT NOT NULL DEFAULT '',
    "adresse" TEXT,
    "postnummer" TEXT,
    "poststed" TEXT,
    "telefon" TEXT,
    "epost" TEXT,
    "hovedbruker_id" INTEGER,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bedrift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ansatt" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "passord_hash" TEXT NOT NULL DEFAULT '',
    "rolle" TEXT NOT NULL DEFAULT 'TRAFIKKLARER',
    "tilganger" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bedrift_id" INTEGER,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ansatt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bedrifts_klasse" (
    "id" SERIAL NOT NULL,
    "klassekode" TEXT NOT NULL,
    "bedrift_id" INTEGER NOT NULL,

    CONSTRAINT "bedrifts_klasse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bedrift_org_nummer_key" ON "bedrift"("org_nummer");

-- CreateIndex
CREATE UNIQUE INDEX "bedrift_hovedbruker_id_key" ON "bedrift"("hovedbruker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ansatt_epost_key" ON "ansatt"("epost");

-- CreateIndex
CREATE INDEX "ansatt_bedrift_id_idx" ON "ansatt"("bedrift_id");

-- AddForeignKey
ALTER TABLE "bedrift" ADD CONSTRAINT "bedrift_hovedbruker_id_fkey" FOREIGN KEY ("hovedbruker_id") REFERENCES "ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ansatt" ADD CONSTRAINT "ansatt_bedrift_id_fkey" FOREIGN KEY ("bedrift_id") REFERENCES "bedrift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bedrifts_klasse" ADD CONSTRAINT "bedrifts_klasse_bedrift_id_fkey" FOREIGN KEY ("bedrift_id") REFERENCES "bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
