-- Add CHECK constraints for data integrity

-- Kontraktvalidering
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_positive_loan_amount CHECK (lan > 0);
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_positive_loan_term CHECK (lopetid > 0 AND lopetid <= 120); -- max 10 år
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_valid_interest_rate CHECK (rente >= 0 AND rente <= 50); -- max 50%
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_positive_fees CHECK (etableringsgebyr >= 0 AND termingebyr >= 0);
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_terms_per_year CHECK (terminerPerAr IN (12, 24, 26, 52)); -- månedlig, halvmånedlig, annenhver uke, ukentlig
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_effective_rate CHECK (effektivRente >= 0);
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_total_amounts CHECK (totalBelop >= lan);

-- Elev validering
ALTER TABLE "Elev" ADD CONSTRAINT check_valid_postal_code CHECK (postnummer ~ '^[0-9]{4}$');
ALTER TABLE "Elev" ADD CONSTRAINT check_valid_email CHECK (epost ~ '^[^@]+@[^@]+\.[^@]+$');
ALTER TABLE "Elev" ADD CONSTRAINT check_valid_phone CHECK (telefon ~ '^[\+]?[0-9\s\-\(\)]{8,15}$');

-- Bedrift validering  
ALTER TABLE "Bedrift" ADD CONSTRAINT check_valid_org_number CHECK (orgNummer = '' OR orgNummer ~ '^[0-9]{9}$');
ALTER TABLE "Bedrift" ADD CONSTRAINT check_valid_business_postal_code CHECK (postnummer IS NULL OR postnummer ~ '^[0-9]{4}$');
ALTER TABLE "Bedrift" ADD CONSTRAINT check_valid_business_email CHECK (epost IS NULL OR epost ~ '^[^@]+@[^@]+\.[^@]+$');

-- Kjøretøy validering
ALTER TABLE "Kjoretoy" ADD CONSTRAINT check_valid_year CHECK (aarsmodell >= 1900 AND aarsmodell <= EXTRACT(YEAR FROM CURRENT_DATE) + 2);
ALTER TABLE "Kjoretoy" ADD CONSTRAINT check_valid_reg_number CHECK (registreringsnummer ~ '^[A-Z]{2}[0-9]{4,5}$');

-- QuizSporsmal validering
ALTER TABLE "QuizSporsmal" ADD CONSTRAINT check_valid_correct_answer CHECK (riktigSvar >= 0 AND riktigSvar < array_length(svaralternativer, 1));
ALTER TABLE "QuizSporsmal" ADD CONSTRAINT check_min_alternatives CHECK (array_length(svaralternativer, 1) >= 2);

-- SystemConfig validering
ALTER TABLE "SystemConfig" ADD CONSTRAINT check_valid_invoice_days CHECK (dagerForfallFaktura > 0 AND dagerForfallFaktura <= 365);
ALTER TABLE "SystemConfig" ADD CONSTRAINT check_positive_fees_config CHECK (purregebyr >= 0 AND standardEtableringsgebyr >= 0 AND standardTermingebyr >= 0);
ALTER TABLE "SystemConfig" ADD CONSTRAINT check_valid_interest_rates CHECK (forsinkelsesrente >= 0 AND standardRente >= 0);
ALTER TABLE "SystemConfig" ADD CONSTRAINT check_valid_loan_term_config CHECK (standardLopetid > 0 AND standardLopetid <= 120);

-- BildeLibrary validering
ALTER TABLE "BildeLibrary" ADD CONSTRAINT check_positive_file_size CHECK (storrelse > 0);
ALTER TABLE "BildeLibrary" ADD CONSTRAINT check_valid_image_dimensions CHECK (
  (bredde IS NULL AND hoyde IS NULL) OR 
  (bredde > 0 AND hoyde > 0)
);

-- PaymentTransaction validering
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT check_positive_payment_amount CHECK (belop > 0);
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT check_valid_payment_status CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'));
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT check_valid_payment_type CHECK (type IN ('TERMIN', 'GEBYR', 'PURRING', 'RENTER'));

-- FileAttachment validering
ALTER TABLE "FileAttachment" ADD CONSTRAINT check_positive_attachment_size CHECK (storrelse > 0);
ALTER TABLE "FileAttachment" ADD CONSTRAINT check_valid_category CHECK (kategori IN ('KONTRAKT', 'FAKTURA', 'PROFIL', 'SIKKERHET'));

-- Soft delete konsistens
ALTER TABLE "Bedrift" ADD CONSTRAINT check_soft_delete_consistency CHECK (
  (deletedAt IS NULL AND deletedBy IS NULL AND isDeleted = FALSE) OR
  (deletedAt IS NOT NULL AND deletedBy IS NOT NULL AND isDeleted = TRUE)
);

ALTER TABLE "Ansatt" ADD CONSTRAINT check_ansatt_soft_delete_consistency CHECK (
  (deletedAt IS NULL AND deletedBy IS NULL AND isDeleted = FALSE) OR
  (deletedAt IS NOT NULL AND isDeleted = TRUE)
);

ALTER TABLE "Elev" ADD CONSTRAINT check_elev_soft_delete_consistency CHECK (
  (deletedAt IS NULL AND deletedBy IS NULL AND isDeleted = FALSE) OR
  (deletedAt IS NOT NULL AND deletedBy IS NOT NULL AND isDeleted = TRUE)
);

ALTER TABLE "Kontrakt" ADD CONSTRAINT check_kontrakt_soft_delete_consistency CHECK (
  (deletedAt IS NULL AND deletedBy IS NULL AND isDeleted = FALSE) OR
  (deletedAt IS NOT NULL AND deletedBy IS NOT NULL AND isDeleted = TRUE)
);

-- Fakturaansvarlig validering
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_fakturaansvarlig_fields CHECK (
  (harFakturaansvarlig = FALSE) OR
  (harFakturaansvarlig = TRUE AND 
   fakturaansvarligFornavn IS NOT NULL AND
   fakturaansvarligEtternavn IS NOT NULL AND
   fakturaansvarligPersonnummer IS NOT NULL AND
   fakturaansvarligTelefon IS NOT NULL AND
   fakturaansvarligEpost IS NOT NULL AND
   fakturaansvarligGate IS NOT NULL AND
   fakturaansvarligPostnr IS NOT NULL AND
   fakturaansvarligPoststed IS NOT NULL)
);

-- Email validering
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_fakturaansvarlig_email CHECK (
  fakturaansvarligEpost IS NULL OR 
  fakturaansvarligEpost ~ '^[^@]+@[^@]+\.[^@]+$'
);

-- Postnummer validering for fakturaansvarlig
ALTER TABLE "Kontrakt" ADD CONSTRAINT check_fakturaansvarlig_postal CHECK (
  fakturaansvarligPostnr IS NULL OR 
  fakturaansvarligPostnr ~ '^[0-9]{4}$'
);

-- Unike constraints for å forhindre duplikater
CREATE UNIQUE INDEX CONCURRENTLY idx_unique_active_elev_personnummer 
ON "Elev" (personnummer) 
WHERE isDeleted = FALSE;

CREATE UNIQUE INDEX CONCURRENTLY idx_unique_active_elev_epost 
ON "Elev" (epost) 
WHERE isDeleted = FALSE;

CREATE UNIQUE INDEX CONCURRENTLY idx_unique_active_bedrift_orgnummer 
ON "Bedrift" (orgNummer) 
WHERE isDeleted = FALSE AND orgNummer != '';

CREATE UNIQUE INDEX CONCURRENTLY idx_unique_active_ansatt_epost 
ON "Ansatt" (epost) 
WHERE isDeleted = FALSE;

-- Performance indekser for soft delete queries
CREATE INDEX CONCURRENTLY idx_bedrift_active ON "Bedrift" (bedriftId) WHERE isDeleted = FALSE;
CREATE INDEX CONCURRENTLY idx_elev_active_bedrift ON "Elev" (bedriftId) WHERE isDeleted = FALSE;
CREATE INDEX CONCURRENTLY idx_kontrakt_active_bedrift ON "Kontrakt" (bedriftId) WHERE isDeleted = FALSE;
CREATE INDEX CONCURRENTLY idx_ansatt_active_bedrift ON "Ansatt" (bedriftId) WHERE isDeleted = FALSE;

COMMENT ON CONSTRAINT check_positive_loan_amount ON "Kontrakt" IS 'Lånebeløp må være positivt';
COMMENT ON CONSTRAINT check_valid_interest_rate ON "Kontrakt" IS 'Rente må være mellom 0 og 50%';
COMMENT ON CONSTRAINT check_fakturaansvarlig_fields ON "Kontrakt" IS 'Alle fakturaansvarlig-felter må være utfylt når harFakturaansvarlig=true';
COMMENT ON CONSTRAINT check_soft_delete_consistency ON "Bedrift" IS 'Soft delete felter må være konsistente'; 