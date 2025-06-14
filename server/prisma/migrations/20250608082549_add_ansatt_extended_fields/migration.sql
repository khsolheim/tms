-- AlterTable
ALTER TABLE "Ansatt" ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "hovedkjøretøy" INTEGER,
ADD COLUMN     "kjøretøy" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "klasser" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "postnummer" TEXT,
ADD COLUMN     "poststed" TEXT;
