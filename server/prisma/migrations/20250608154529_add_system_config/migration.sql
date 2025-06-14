-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" SERIAL NOT NULL,
    "bedriftId" INTEGER NOT NULL,
    "dagerForfallFaktura" INTEGER NOT NULL DEFAULT 14,
    "purregebyr" INTEGER NOT NULL DEFAULT 100,
    "forsinkelsesrente" DOUBLE PRECISION NOT NULL DEFAULT 8.5,
    "kontonummer" TEXT,
    "standardRente" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "standardEtableringsgebyr" INTEGER NOT NULL DEFAULT 1900,
    "standardTermingebyr" INTEGER NOT NULL DEFAULT 50,
    "standardLopetid" INTEGER NOT NULL DEFAULT 24,
    "sendKvitteringTilElev" BOOLEAN NOT NULL DEFAULT true,
    "sendKopiTilBedrift" BOOLEAN NOT NULL DEFAULT true,
    "standardAvsenderEpost" TEXT,
    "standardAvsenderNavn" TEXT,
    "varsleNyKontrakt" BOOLEAN NOT NULL DEFAULT true,
    "varsleStatusendring" BOOLEAN NOT NULL DEFAULT true,
    "varsleForfall" BOOLEAN NOT NULL DEFAULT true,
    "dagerForVarslingForfall" INTEGER NOT NULL DEFAULT 7,
    "visPersonnummerILister" BOOLEAN NOT NULL DEFAULT false,
    "tillateElevregistrering" BOOLEAN NOT NULL DEFAULT true,
    "kreverGodkjenningElevSoknad" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_bedriftId_key" ON "SystemConfig"("bedriftId");

-- AddForeignKey
ALTER TABLE "SystemConfig" ADD CONSTRAINT "SystemConfig_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
