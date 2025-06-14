-- AlterTable
ALTER TABLE "Bedrift" ADD COLUMN     "brregMetadata" JSONB,
ADD COLUMN     "dagligLeder" TEXT,
ADD COLUMN     "næringskode" TEXT,
ADD COLUMN     "næringskodeKode" TEXT,
ADD COLUMN     "organisasjonsform" TEXT,
ADD COLUMN     "organisasjonsformKode" TEXT,
ADD COLUMN     "signaturrett" JSONB DEFAULT '[]',
ADD COLUMN     "stiftelsesdato" TEXT,
ADD COLUMN     "styreleder" TEXT;
