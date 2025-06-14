-- CreateIndex
CREATE INDEX "Ansatt_opprettet_idx" ON "Ansatt"("opprettet");

-- CreateIndex
CREATE INDEX "Ansatt_rolle_idx" ON "Ansatt"("rolle");

-- CreateIndex
CREATE INDEX "Ansatt_fornavn_etternavn_idx" ON "Ansatt"("fornavn", "etternavn");

-- CreateIndex
CREATE INDEX "Bedrift_navn_idx" ON "Bedrift"("navn");

-- CreateIndex
CREATE INDEX "Bedrift_opprettet_idx" ON "Bedrift"("opprettet");

-- CreateIndex
CREATE INDEX "Bedrift_orgNummer_idx" ON "Bedrift"("orgNummer");

-- CreateIndex
CREATE INDEX "BildeLibrary_mimeType_idx" ON "BildeLibrary"("mimeType");

-- CreateIndex
CREATE INDEX "BildeLibrary_navn_idx" ON "BildeLibrary"("navn");

-- CreateIndex
CREATE INDEX "BildeLibrary_opprettet_idx" ON "BildeLibrary"("opprettet");

-- CreateIndex
CREATE INDEX "Elev_fornavn_etternavn_idx" ON "Elev"("fornavn", "etternavn");

-- CreateIndex
CREATE INDEX "Elev_klassekode_idx" ON "Elev"("klassekode");

-- CreateIndex
CREATE INDEX "Elev_opprettet_idx" ON "Elev"("opprettet");

-- CreateIndex
CREATE INDEX "Elev_sistInnlogget_idx" ON "Elev"("sistInnlogget");

-- CreateIndex
CREATE INDEX "KontrollMal_opprettet_idx" ON "KontrollMal"("opprettet");

-- CreateIndex
CREATE INDEX "KontrollMal_offentlig_aktiv_idx" ON "KontrollMal"("offentlig", "aktiv");

-- CreateIndex
CREATE INDEX "KontrollMal_navn_idx" ON "KontrollMal"("navn");

-- CreateIndex
CREATE INDEX "QuizKategori_navn_idx" ON "QuizKategori"("navn");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_opprettet_idx" ON "Sikkerhetskontroll"("opprettet");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_opprettetAvId_idx" ON "Sikkerhetskontroll"("opprettetAvId");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_basertPåMalId_idx" ON "Sikkerhetskontroll"("basertPåMalId");
