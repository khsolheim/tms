-- Rollback script for Data Integrity Constraints
-- Use this to remove all constraints if needed

-- Drop constraint check functions
DROP FUNCTION IF EXISTS validate_norwegian_personnummer(TEXT);
DROP FUNCTION IF EXISTS validate_norwegian_orgnummer(TEXT);

-- Drop triggers
DROP TRIGGER IF EXISTS prevent_hovedbruker_deletion_trigger ON "Ansatt";
DROP FUNCTION IF EXISTS prevent_hovedbruker_deletion();

-- Drop Kontrakt constraints
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_positive_loan_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_positive_lopetid_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_valid_rente_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_positive_gebyrer_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_positive_terminer_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_valid_personnummer_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_valid_fakturaansvarlig_personnummer_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_fakturaansvarlig_completeness_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_valid_personnummer_checksum_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_valid_fakturaansvarlig_personnummer_checksum_check";
ALTER TABLE "Kontrakt" DROP CONSTRAINT IF EXISTS "kontrakt_soft_delete_consistency_check";

-- Drop Elev constraints
ALTER TABLE "Elev" DROP CONSTRAINT IF EXISTS "elev_valid_personnummer_check";
ALTER TABLE "Elev" DROP CONSTRAINT IF EXISTS "elev_valid_postnummer_check";
ALTER TABLE "Elev" DROP CONSTRAINT IF EXISTS "elev_valid_epost_check";
ALTER TABLE "Elev" DROP CONSTRAINT IF EXISTS "elev_valid_personnummer_checksum_check";
ALTER TABLE "Elev" DROP CONSTRAINT IF EXISTS "elev_soft_delete_consistency_check";

-- Drop Bedrift constraints
ALTER TABLE "Bedrift" DROP CONSTRAINT IF EXISTS "bedrift_valid_orgnummer_check";
ALTER TABLE "Bedrift" DROP CONSTRAINT IF EXISTS "bedrift_valid_postnummer_check";
ALTER TABLE "Bedrift" DROP CONSTRAINT IF EXISTS "bedrift_valid_epost_check";
ALTER TABLE "Bedrift" DROP CONSTRAINT IF EXISTS "bedrift_valid_orgnummer_checksum_check";
ALTER TABLE "Bedrift" DROP CONSTRAINT IF EXISTS "bedrift_soft_delete_consistency_check";
ALTER TABLE "Bedrift" DROP CONSTRAINT IF EXISTS "bedrift_hovedbruker_not_deleted_check";

-- Drop Ansatt constraints
ALTER TABLE "Ansatt" DROP CONSTRAINT IF EXISTS "ansatt_valid_epost_check";
ALTER TABLE "Ansatt" DROP CONSTRAINT IF EXISTS "ansatt_valid_postnummer_check";
ALTER TABLE "Ansatt" DROP CONSTRAINT IF EXISTS "ansatt_valid_navn_check";
ALTER TABLE "Ansatt" DROP CONSTRAINT IF EXISTS "ansatt_soft_delete_consistency_check";

-- Drop Kjoretoy constraints
ALTER TABLE "Kjoretoy" DROP CONSTRAINT IF EXISTS "kjoretoy_valid_regnummer_check";
ALTER TABLE "Kjoretoy" DROP CONSTRAINT IF EXISTS "kjoretoy_valid_aarsmodell_check";
ALTER TABLE "Kjoretoy" DROP CONSTRAINT IF EXISTS "kjoretoy_soft_delete_consistency_check";

-- Drop SystemConfig constraints
ALTER TABLE "SystemConfig" DROP CONSTRAINT IF EXISTS "systemconfig_positive_dager_check";
ALTER TABLE "SystemConfig" DROP CONSTRAINT IF EXISTS "systemconfig_positive_purregebyr_check";
ALTER TABLE "SystemConfig" DROP CONSTRAINT IF EXISTS "systemconfig_valid_rente_check";
ALTER TABLE "SystemConfig" DROP CONSTRAINT IF EXISTS "systemconfig_valid_standard_rente_check";
ALTER TABLE "SystemConfig" DROP CONSTRAINT IF EXISTS "systemconfig_positive_gebyrer_check";
ALTER TABLE "SystemConfig" DROP CONSTRAINT IF EXISTS "systemconfig_valid_lopetid_check";
ALTER TABLE "SystemConfig" DROP CONSTRAINT IF EXISTS "systemconfig_valid_varsling_dager_check";

-- Drop PaymentTransaction constraints
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT IF EXISTS "payment_positive_belop_check";
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT IF EXISTS "payment_valid_status_check";
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT IF EXISTS "payment_valid_type_check";

-- Drop FileAttachment constraints
ALTER TABLE "FileAttachment" DROP CONSTRAINT IF EXISTS "file_positive_storrelse_check";
ALTER TABLE "FileAttachment" DROP CONSTRAINT IF EXISTS "file_valid_kategori_check";

-- Drop EmailLog constraints
ALTER TABLE "EmailLog" DROP CONSTRAINT IF EXISTS "email_valid_status_check";
ALTER TABLE "EmailLog" DROP CONSTRAINT IF EXISTS "email_positive_forsoker_check";

-- Drop validation indexes
DROP INDEX IF EXISTS "idx_kontrakt_personnummer_validation";
DROP INDEX IF EXISTS "idx_elev_personnummer_validation";
DROP INDEX IF EXISTS "idx_bedrift_orgnummer_validation";

-- Note: This script removes all data integrity constraints added by the migration
-- Use with caution in production environments 