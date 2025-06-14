-- CreateIndex
CREATE INDEX "Kontrakt_opprettet_idx" ON "Kontrakt"("opprettet");

-- CreateIndex
CREATE INDEX "Kontrakt_opprettetAv_idx" ON "Kontrakt"("opprettetAv");

-- CreateIndex
CREATE INDEX "Kontrakt_elevFornavn_elevEtternavn_idx" ON "Kontrakt"("elevFornavn", "elevEtternavn");

-- CreateIndex
CREATE INDEX "Kontrakt_oppdatert_idx" ON "Kontrakt"("oppdatert");
