-- Data Integrity Constraints Migration
-- Adding database-level validation rules for TMS

-- Kontrakt business rules constraints
ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_positive_loan_check" 
  CHECK ("lan" > 0 AND "lan" <= 10000000); -- Max 10M NOK loan

ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_positive_lopetid_check" 
  CHECK ("lopetid" >= 1 AND "lopetid" <= 120); -- 1-120 months

ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_valid_rente_check" 
  CHECK ("rente" >= 0 AND "rente" <= 50); -- 0-50% interest rate

ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_positive_gebyrer_check" 
  CHECK ("etableringsgebyr" >= 0 AND "termingebyr" >= 0);

ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_positive_terminer_check" 
  CHECK ("terminerPerAr" >= 1 AND "terminerPerAr" <= 12);

ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_valid_personnummer_check" 
  CHECK (LENGTH("elevPersonnummer") = 11 AND "elevPersonnummer" ~ '^[0-9]+$');

ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_valid_fakturaansvarlig_personnummer_check" 
  CHECK ("fakturaansvarligPersonnummer" IS NULL OR 
         (LENGTH("fakturaansvarligPersonnummer") = 11 AND "fakturaansvarligPersonnummer" ~ '^[0-9]+$'));

ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_fakturaansvarlig_completeness_check" 
  CHECK (
    ("harFakturaansvarlig" = false) OR 
    (
      "harFakturaansvarlig" = true AND 
      "fakturaansvarligFornavn" IS NOT NULL AND 
      "fakturaansvarligEtternavn" IS NOT NULL AND 
      "fakturaansvarligPersonnummer" IS NOT NULL AND 
      "fakturaansvarligTelefon" IS NOT NULL AND 
      "fakturaansvarligEpost" IS NOT NULL
    )
  );

-- Elev constraints
ALTER TABLE "Elev" ADD CONSTRAINT "elev_valid_personnummer_check" 
  CHECK (LENGTH("personnummer") = 11 AND "personnummer" ~ '^[0-9]+$');

ALTER TABLE "Elev" ADD CONSTRAINT "elev_valid_postnummer_check" 
  CHECK (LENGTH("postnummer") = 4 AND "postnummer" ~ '^[0-9]+$');

ALTER TABLE "Elev" ADD CONSTRAINT "elev_valid_epost_check" 
  CHECK ("epost" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Bedrift constraints
ALTER TABLE "Bedrift" ADD CONSTRAINT "bedrift_valid_orgnummer_check" 
  CHECK ("orgNummer" = '' OR (LENGTH("orgNummer") = 9 AND "orgNummer" ~ '^[0-9]+$'));

ALTER TABLE "Bedrift" ADD CONSTRAINT "bedrift_valid_postnummer_check" 
  CHECK ("postnummer" IS NULL OR (LENGTH("postnummer") = 4 AND "postnummer" ~ '^[0-9]+$'));

ALTER TABLE "Bedrift" ADD CONSTRAINT "bedrift_valid_epost_check" 
  CHECK ("epost" IS NULL OR "epost" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ansatt constraints
ALTER TABLE "Ansatt" ADD CONSTRAINT "ansatt_valid_epost_check" 
  CHECK ("epost" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE "Ansatt" ADD CONSTRAINT "ansatt_valid_postnummer_check" 
  CHECK ("postnummer" IS NULL OR (LENGTH("postnummer") = 4 AND "postnummer" ~ '^[0-9]+$'));

ALTER TABLE "Ansatt" ADD CONSTRAINT "ansatt_valid_navn_check" 
  CHECK (LENGTH(TRIM("fornavn")) > 0 AND LENGTH(TRIM("etternavn")) > 0);

-- Kjøretøy constraints
ALTER TABLE "Kjoretoy" ADD CONSTRAINT "kjoretoy_valid_regnummer_check" 
  CHECK (LENGTH("registreringsnummer") >= 5 AND LENGTH("registreringsnummer") <= 7);

ALTER TABLE "Kjoretoy" ADD CONSTRAINT "kjoretoy_valid_aarsmodell_check" 
  CHECK ("aarsmodell" >= 1950 AND "aarsmodell" <= EXTRACT(YEAR FROM CURRENT_DATE) + 1);

-- SystemConfig constraints
ALTER TABLE "SystemConfig" ADD CONSTRAINT "systemconfig_positive_dager_check" 
  CHECK ("dagerForfallFaktura" > 0 AND "dagerForfallFaktura" <= 365);

ALTER TABLE "SystemConfig" ADD CONSTRAINT "systemconfig_positive_purregebyr_check" 
  CHECK ("purregebyr" >= 0);

ALTER TABLE "SystemConfig" ADD CONSTRAINT "systemconfig_valid_rente_check" 
  CHECK ("forsinkelsesrente" >= 0 AND "forsinkelsesrente" <= 100);

ALTER TABLE "SystemConfig" ADD CONSTRAINT "systemconfig_valid_standard_rente_check" 
  CHECK ("standardRente" >= 0 AND "standardRente" <= 50);

ALTER TABLE "SystemConfig" ADD CONSTRAINT "systemconfig_positive_gebyrer_check" 
  CHECK ("standardEtableringsgebyr" >= 0 AND "standardTermingebyr" >= 0);

ALTER TABLE "SystemConfig" ADD CONSTRAINT "systemconfig_valid_lopetid_check" 
  CHECK ("standardLopetid" >= 1 AND "standardLopetid" <= 120);

ALTER TABLE "SystemConfig" ADD CONSTRAINT "systemconfig_valid_varsling_dager_check" 
  CHECK ("dagerForVarslingForfall" >= 1 AND "dagerForVarslingForfall" <= 90);

-- PaymentTransaction constraints
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "payment_positive_belop_check" 
  CHECK ("belop" > 0);

ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "payment_valid_status_check" 
  CHECK ("status" IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'));

ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "payment_valid_type_check" 
  CHECK ("type" IN ('TERMIN', 'GEBYR', 'PURRING', 'RENTER'));

-- FileAttachment constraints
ALTER TABLE "FileAttachment" ADD CONSTRAINT "file_positive_storrelse_check" 
  CHECK ("storrelse" > 0 AND "storrelse" <= 104857600); -- Max 100MB

ALTER TABLE "FileAttachment" ADD CONSTRAINT "file_valid_kategori_check" 
  CHECK ("kategori" IN ('KONTRAKT', 'FAKTURA', 'PROFIL', 'SIKKERHET'));

-- EmailLog constraints
ALTER TABLE "EmailLog" ADD CONSTRAINT "email_valid_status_check" 
  CHECK ("status" IN ('SENT', 'FAILED', 'PENDING', 'BOUNCED'));

ALTER TABLE "EmailLog" ADD CONSTRAINT "email_positive_forsoker_check" 
  CHECK ("sendeforsoker" >= 1 AND "sendeforsoker" <= 10);

-- Soft delete constraints
ALTER TABLE "Bedrift" ADD CONSTRAINT "bedrift_soft_delete_consistency_check" 
  CHECK (("isDeleted" = false AND "deletedAt" IS NULL AND "deletedBy" IS NULL) OR 
         ("isDeleted" = true AND "deletedAt" IS NOT NULL AND "deletedBy" IS NOT NULL));

ALTER TABLE "Ansatt" ADD CONSTRAINT "ansatt_soft_delete_consistency_check" 
  CHECK (("isDeleted" = false AND "deletedAt" IS NULL AND "deletedBy" IS NULL) OR 
         ("isDeleted" = true AND "deletedAt" IS NOT NULL AND "deletedBy" IS NOT NULL));

ALTER TABLE "Elev" ADD CONSTRAINT "elev_soft_delete_consistency_check" 
  CHECK (("isDeleted" = false AND "deletedAt" IS NULL AND "deletedBy" IS NULL) OR 
         ("isDeleted" = true AND "deletedAt" IS NOT NULL AND "deletedBy" IS NOT NULL));

ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_soft_delete_consistency_check" 
  CHECK (("isDeleted" = false AND "deletedAt" IS NULL AND "deletedBy" IS NULL) OR 
         ("isDeleted" = true AND "deletedAt" IS NOT NULL AND "deletedBy" IS NOT NULL));

ALTER TABLE "Kjoretoy" ADD CONSTRAINT "kjoretoy_soft_delete_consistency_check" 
  CHECK (("isDeleted" = false AND "deletedAt" IS NULL AND "deletedBy" IS NULL) OR 
         ("isDeleted" = true AND "deletedAt" IS NOT NULL AND "deletedBy" IS NOT NULL));

-- Additional business logic constraints
ALTER TABLE "Bedrift" ADD CONSTRAINT "bedrift_hovedbruker_not_deleted_check" 
  CHECK ("hovedbrukerId" IS NULL OR EXISTS (
    SELECT 1 FROM "Ansatt" 
    WHERE "id" = "hovedbrukerId" AND "isDeleted" = false
  ));

-- Prevent deletion of hovedbruker (should be handled in application layer too)
CREATE OR REPLACE FUNCTION prevent_hovedbruker_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD."isDeleted" = false AND NEW."isDeleted" = true THEN
    IF EXISTS (SELECT 1 FROM "Bedrift" WHERE "hovedbrukerId" = OLD."id") THEN
      RAISE EXCEPTION 'Cannot delete ansatt who is hovedbruker for a bedrift. Reassign hovedbruker first.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_hovedbruker_deletion_trigger
  BEFORE UPDATE ON "Ansatt"
  FOR EACH ROW EXECUTE FUNCTION prevent_hovedbruker_deletion();

-- Function to validate Norwegian personnummer (checksum)
CREATE OR REPLACE FUNCTION validate_norwegian_personnummer(pnr TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  weights1 INTEGER[] := ARRAY[3,7,6,1,8,9,4,5,2];
  weights2 INTEGER[] := ARRAY[5,4,3,2,7,6,5,4,3,2];
  sum1 INTEGER := 0;
  sum2 INTEGER := 0;
  remainder1 INTEGER;
  remainder2 INTEGER;
  check1 INTEGER;
  check2 INTEGER;
  i INTEGER;
BEGIN
  -- Check length and that it's all digits
  IF LENGTH(pnr) != 11 OR pnr !~ '^[0-9]+$' THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate first checksum
  FOR i IN 1..9 LOOP
    sum1 := sum1 + (CAST(SUBSTRING(pnr FROM i FOR 1) AS INTEGER) * weights1[i]);
  END LOOP;
  
  remainder1 := sum1 % 11;
  IF remainder1 < 2 THEN
    check1 := remainder1;
  ELSE
    check1 := 11 - remainder1;
  END IF;
  
  -- Verify first check digit
  IF check1 != CAST(SUBSTRING(pnr FROM 10 FOR 1) AS INTEGER) THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate second checksum
  FOR i IN 1..10 LOOP
    sum2 := sum2 + (CAST(SUBSTRING(pnr FROM i FOR 1) AS INTEGER) * weights2[i]);
  END LOOP;
  
  remainder2 := sum2 % 11;
  IF remainder2 < 2 THEN
    check2 := remainder2;
  ELSE
    check2 := 11 - remainder2;
  END IF;
  
  -- Verify second check digit
  RETURN check2 = CAST(SUBSTRING(pnr FROM 11 FOR 1) AS INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Function to validate Norwegian organization number (checksum)
CREATE OR REPLACE FUNCTION validate_norwegian_orgnummer(orgnr TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  weights INTEGER[] := ARRAY[3,2,7,6,5,4,3,2];
  sum_val INTEGER := 0;
  remainder INTEGER;
  check_digit INTEGER;
  i INTEGER;
BEGIN
  -- Check length and that it's all digits
  IF LENGTH(orgnr) != 9 OR orgnr !~ '^[0-9]+$' THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate checksum
  FOR i IN 1..8 LOOP
    sum_val := sum_val + (CAST(SUBSTRING(orgnr FROM i FOR 1) AS INTEGER) * weights[i]);
  END LOOP;
  
  remainder := sum_val % 11;
  
  IF remainder = 0 THEN
    check_digit := 0;
  ELSIF remainder = 1 THEN
    RETURN FALSE; -- Invalid organization number
  ELSE
    check_digit := 11 - remainder;
  END IF;
  
  -- Verify check digit
  RETURN check_digit = CAST(SUBSTRING(orgnr FROM 9 FOR 1) AS INTEGER);
END;
$$ LANGUAGE plpgsql;

-- Add constraints using the validation functions
ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_valid_personnummer_checksum_check" 
  CHECK (validate_norwegian_personnummer("elevPersonnummer"));

ALTER TABLE "Kontrakt" ADD CONSTRAINT "kontrakt_valid_fakturaansvarlig_personnummer_checksum_check" 
  CHECK ("fakturaansvarligPersonnummer" IS NULL OR validate_norwegian_personnummer("fakturaansvarligPersonnummer"));

ALTER TABLE "Elev" ADD CONSTRAINT "elev_valid_personnummer_checksum_check" 
  CHECK (validate_norwegian_personnummer("personnummer"));

ALTER TABLE "Bedrift" ADD CONSTRAINT "bedrift_valid_orgnummer_checksum_check" 
  CHECK ("orgNummer" = '' OR validate_norwegian_orgnummer("orgNummer"));

-- Create index for better performance on constraint checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_kontrakt_personnummer_validation" ON "Kontrakt" ("elevPersonnummer") WHERE "isDeleted" = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_elev_personnummer_validation" ON "Elev" ("personnummer") WHERE "isDeleted" = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_bedrift_orgnummer_validation" ON "Bedrift" ("orgNummer") WHERE "isDeleted" = false;

-- Comments for documentation
COMMENT ON CONSTRAINT "kontrakt_positive_loan_check" ON "Kontrakt" IS 'Ensures loan amount is positive and within reasonable limits (1-10M NOK)';
COMMENT ON CONSTRAINT "kontrakt_fakturaansvarlig_completeness_check" ON "Kontrakt" IS 'Ensures all fakturaansvarlig fields are provided when harFakturaansvarlig is true';
COMMENT ON FUNCTION validate_norwegian_personnummer(TEXT) IS 'Validates Norwegian personnummer using official checksum algorithm';
COMMENT ON FUNCTION validate_norwegian_orgnummer(TEXT) IS 'Validates Norwegian organization number using official checksum algorithm'; 