-- Oppdater eksisterende data først
UPDATE "Ansatt" SET
  "passordHash" = '',
  "rolle" = 'TRAFIKKLARER',
  "tilganger" = '{}',
  "opprettet" = NOW(),
  "oppdatert" = NOW()
WHERE "passordHash" IS NULL;

UPDATE "Bedrift" SET
  "orgNummer" = COALESCE("orgNummer", ''),
  "opprettet" = NOW(),
  "oppdatert" = NOW()
WHERE "orgNummer" IS NULL;

-- Legg til nye kolonner og constraints
ALTER TABLE "Ansatt" ADD COLUMN IF NOT EXISTS "passordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Ansatt" ADD COLUMN IF NOT EXISTS "rolle" TEXT NOT NULL DEFAULT 'TRAFIKKLARER';
ALTER TABLE "Ansatt" ADD COLUMN IF NOT EXISTS "tilganger" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Ansatt" ADD COLUMN IF NOT EXISTS "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Ansatt" ADD COLUMN IF NOT EXISTS "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Bedrift" ADD COLUMN IF NOT EXISTS "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Bedrift" ADD COLUMN IF NOT EXISTS "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Fjern standardverdier etter at dataene er oppdatert
ALTER TABLE "Ansatt" ALTER COLUMN "passordHash" DROP DEFAULT;
ALTER TABLE "Ansatt" ALTER COLUMN "rolle" DROP DEFAULT;
ALTER TABLE "Ansatt" ALTER COLUMN "tilganger" DROP DEFAULT;
ALTER TABLE "Ansatt" ALTER COLUMN "opprettet" DROP DEFAULT;
ALTER TABLE "Ansatt" ALTER COLUMN "oppdatert" DROP DEFAULT;

ALTER TABLE "Bedrift" ALTER COLUMN "opprettet" DROP DEFAULT;
ALTER TABLE "Bedrift" ALTER COLUMN "oppdatert" DROP DEFAULT;

-- Legg til indekser
CREATE INDEX IF NOT EXISTS "Ansatt_bedriftId_idx" ON "Ansatt"("bedriftId");

-- Oppdater constraints
ALTER TABLE "Bedrift" ADD CONSTRAINT "Bedrift_orgNummer_key" UNIQUE ("orgNummer");
ALTER TABLE "Bedrift" ADD CONSTRAINT "Bedrift_hovedbrukerId_key" UNIQUE ("hovedbrukerId"); 