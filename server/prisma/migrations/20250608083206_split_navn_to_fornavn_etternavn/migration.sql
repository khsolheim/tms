/*
  Warnings:

  - You are about to drop the column `navn` on the `Ansatt` table. All the data in the column will be lost.
  - Added the required column `etternavn` to the `Ansatt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fornavn` to the `Ansatt` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add nullable columns first
ALTER TABLE "Ansatt" 
ADD COLUMN "fornavn" TEXT,
ADD COLUMN "etternavn" TEXT;

-- Step 2: Split existing navn data into fornavn and etternavn
UPDATE "Ansatt" 
SET 
  "fornavn" = CASE 
    WHEN position(' ' in "navn") > 0 THEN 
      trim(substring("navn" from 1 for position(' ' in "navn") - 1))
    ELSE 
      "navn"
  END,
  "etternavn" = CASE 
    WHEN position(' ' in "navn") > 0 THEN 
      trim(substring("navn" from position(' ' in "navn") + 1))
    ELSE 
      'N/A'
  END;

-- Step 3: Set columns as NOT NULL
ALTER TABLE "Ansatt" 
ALTER COLUMN "fornavn" SET NOT NULL,
ALTER COLUMN "etternavn" SET NOT NULL;

-- Step 4: Drop the original navn column
ALTER TABLE "Ansatt" DROP COLUMN "navn";
