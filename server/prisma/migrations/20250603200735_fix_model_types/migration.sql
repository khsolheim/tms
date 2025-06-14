/*
  Warnings:

  - You are about to drop the `ansatt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bedrift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `bedrifts_klasse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ansatt" DROP CONSTRAINT "ansatt_bedrift_id_fkey";

-- DropForeignKey
ALTER TABLE "bedrift" DROP CONSTRAINT "bedrift_hovedbruker_id_fkey";

-- DropForeignKey
ALTER TABLE "bedrifts_klasse" DROP CONSTRAINT "bedrifts_klasse_bedrift_id_fkey";

-- DropTable
DROP TABLE "ansatt";

-- DropTable
DROP TABLE "bedrift";

-- DropTable
DROP TABLE "bedrifts_klasse";

-- CreateTable
CREATE TABLE "Bedrift" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "orgNummer" TEXT NOT NULL DEFAULT '',
    "adresse" TEXT,
    "postnummer" TEXT,
    "poststed" TEXT,
    "telefon" TEXT,
    "epost" TEXT,
    "hovedbrukerId" INTEGER,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bedrift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ansatt" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "passordHash" TEXT NOT NULL DEFAULT '',
    "rolle" TEXT NOT NULL DEFAULT 'TRAFIKKLARER',
    "tilganger" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bedriftId" INTEGER,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ansatt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedriftsKlasse" (
    "id" SERIAL NOT NULL,
    "klassekode" TEXT NOT NULL,
    "bedriftId" INTEGER NOT NULL,

    CONSTRAINT "BedriftsKlasse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bedrift_orgNummer_key" ON "Bedrift"("orgNummer");

-- CreateIndex
CREATE UNIQUE INDEX "Bedrift_hovedbrukerId_key" ON "Bedrift"("hovedbrukerId");

-- CreateIndex
CREATE UNIQUE INDEX "Ansatt_epost_key" ON "Ansatt"("epost");

-- CreateIndex
CREATE INDEX "Ansatt_bedriftId_idx" ON "Ansatt"("bedriftId");

-- AddForeignKey
ALTER TABLE "Bedrift" ADD CONSTRAINT "Bedrift_hovedbrukerId_fkey" FOREIGN KEY ("hovedbrukerId") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ansatt" ADD CONSTRAINT "Ansatt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedriftsKlasse" ADD CONSTRAINT "BedriftsKlasse_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
