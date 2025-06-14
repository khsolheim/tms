-- CreateTable
CREATE TABLE "Kjoretoy" (
    "id" SERIAL NOT NULL,
    "registreringsnummer" TEXT NOT NULL,
    "merke" TEXT NOT NULL,
    "modell" TEXT NOT NULL,
    "aarsmodell" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "forerkortklass" TEXT[],
    "bedriftId" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kjoretoy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kjoretoy_registreringsnummer_key" ON "Kjoretoy"("registreringsnummer");

-- AddForeignKey
ALTER TABLE "Kjoretoy" ADD CONSTRAINT "Kjoretoy_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
