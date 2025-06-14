-- CreateEnum
CREATE TYPE "ElevStatus" AS ENUM ('AKTIV', 'INAKTIV', 'PENDING');

-- CreateEnum
CREATE TYPE "ElevSoknadStatus" AS ENUM ('PENDING', 'GODKJENT', 'AVVIST');

-- CreateTable
CREATE TABLE "Elev" (
    "id" SERIAL NOT NULL,
    "fornavn" TEXT NOT NULL,
    "etternavn" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "gate" TEXT NOT NULL,
    "postnummer" TEXT NOT NULL,
    "poststed" TEXT NOT NULL,
    "personnummer" TEXT NOT NULL,
    "klassekode" TEXT NOT NULL,
    "larer" TEXT,
    "status" "ElevStatus" NOT NULL DEFAULT 'AKTIV',
    "sistInnlogget" TIMESTAMP(3),
    "bedriftId" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Elev_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElevSoknad" (
    "id" SERIAL NOT NULL,
    "fornavn" TEXT NOT NULL,
    "etternavn" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "gate" TEXT NOT NULL,
    "postnummer" TEXT NOT NULL,
    "poststed" TEXT NOT NULL,
    "personnummer" TEXT NOT NULL,
    "klassekode" TEXT NOT NULL,
    "larer" TEXT,
    "status" "ElevSoknadStatus" NOT NULL DEFAULT 'PENDING',
    "bedriftId" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElevSoknad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Elev_epost_key" ON "Elev"("epost");

-- CreateIndex
CREATE UNIQUE INDEX "Elev_personnummer_key" ON "Elev"("personnummer");

-- CreateIndex
CREATE INDEX "Elev_bedriftId_idx" ON "Elev"("bedriftId");

-- CreateIndex
CREATE INDEX "Elev_epost_idx" ON "Elev"("epost");

-- CreateIndex
CREATE INDEX "Elev_personnummer_idx" ON "Elev"("personnummer");

-- CreateIndex
CREATE INDEX "ElevSoknad_bedriftId_idx" ON "ElevSoknad"("bedriftId");

-- CreateIndex
CREATE INDEX "ElevSoknad_status_idx" ON "ElevSoknad"("status");

-- AddForeignKey
ALTER TABLE "Elev" ADD CONSTRAINT "Elev_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElevSoknad" ADD CONSTRAINT "ElevSoknad_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
