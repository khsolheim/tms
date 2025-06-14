/*
  Warnings:

  - A unique constraint covering the columns `[hovedbrukerId]` on the table `Bedrift` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bedrift" ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "epost" TEXT,
ADD COLUMN     "hovedbrukerId" INTEGER,
ADD COLUMN     "orgNr" TEXT,
ADD COLUMN     "postnummer" TEXT,
ADD COLUMN     "poststed" TEXT,
ADD COLUMN     "telefon" TEXT;

-- CreateTable
CREATE TABLE "Ansatt" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "telefon" TEXT,
    "bedriftId" INTEGER NOT NULL,

    CONSTRAINT "Ansatt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ansatt_epost_key" ON "Ansatt"("epost");

-- CreateIndex
CREATE UNIQUE INDEX "Bedrift_hovedbrukerId_key" ON "Bedrift"("hovedbrukerId");

-- AddForeignKey
ALTER TABLE "Bedrift" ADD CONSTRAINT "Bedrift_hovedbrukerId_fkey" FOREIGN KEY ("hovedbrukerId") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ansatt" ADD CONSTRAINT "Ansatt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
