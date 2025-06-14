-- CreateEnum
CREATE TYPE "KontrollType" AS ENUM ('FYSISK', 'VISUELL');

-- CreateTable
CREATE TABLE "Sjekkpunkt" (
    "id" SERIAL NOT NULL,
    "tittel" TEXT NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "bildeUrl" TEXT,
    "videoUrl" TEXT,
    "konsekvens" TEXT NOT NULL,
    "rettVerdi" TEXT,
    "typeKontroll" "KontrollType" NOT NULL,
    "system" TEXT NOT NULL,
    "intervallKm" INTEGER,
    "intervallTid" INTEGER,

    CONSTRAINT "Sjekkpunkt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bedrift" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,

    CONSTRAINT "Bedrift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedriftsKlasse" (
    "id" SERIAL NOT NULL,
    "klassekode" TEXT NOT NULL,
    "bedriftId" INTEGER NOT NULL,

    CONSTRAINT "BedriftsKlasse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BedriftsKlasse" ADD CONSTRAINT "BedriftsKlasse_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
