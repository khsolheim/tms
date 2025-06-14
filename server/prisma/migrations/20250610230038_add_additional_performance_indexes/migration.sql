-- CreateIndex
CREATE INDEX "Ansatt_bedriftId_rolle_idx" ON "Ansatt"("bedriftId", "rolle");

-- CreateIndex
CREATE INDEX "Ansatt_epost_idx" ON "Ansatt"("epost");

-- CreateIndex
CREATE INDEX "Ansatt_bedriftId_idx" ON "Ansatt"("bedriftId");

-- CreateIndex
CREATE INDEX "BildeLibrary_oppdatert_idx" ON "BildeLibrary"("oppdatert");

-- CreateIndex
CREATE INDEX "Elev_bedriftId_status_idx" ON "Elev"("bedriftId", "status");

-- CreateIndex
CREATE INDEX "ElevSoknad_personnummer_idx" ON "ElevSoknad"("personnummer");

-- CreateIndex
CREATE INDEX "ElevSoknad_epost_idx" ON "ElevSoknad"("epost");

-- CreateIndex
CREATE INDEX "Kjoretoy_bedriftId_idx" ON "Kjoretoy"("bedriftId");

-- CreateIndex
CREATE INDEX "Kjoretoy_bedriftId_status_idx" ON "Kjoretoy"("bedriftId", "status");

-- CreateIndex
CREATE INDEX "Kontrakt_bedriftId_status_idx" ON "Kontrakt"("bedriftId", "status");

-- CreateIndex
CREATE INDEX "Kontrakt_elevPersonnummer_idx" ON "Kontrakt"("elevPersonnummer");

-- CreateIndex
CREATE INDEX "KontrollMal_opprettetAvId_idx" ON "KontrollMal"("opprettetAvId");

-- CreateIndex
CREATE INDEX "KontrollMal_opprettetAvId_aktiv_idx" ON "KontrollMal"("opprettetAvId", "aktiv");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_bedriftId_idx" ON "Sikkerhetskontroll"("bedriftId");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_bedriftId_aktiv_idx" ON "Sikkerhetskontroll"("bedriftId", "aktiv");
