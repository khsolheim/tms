/*
  Warnings:

  - Added the required column `passord` to the `Ansatt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnsattRolle" AS ENUM ('HOVEDBRUKER', 'TRAFIKKLARER');

-- AlterTable
ALTER TABLE "Ansatt" ADD COLUMN "passord" TEXT NOT NULL DEFAULT '$2b$10$xLJXBWVnqJQNz8KPyJzKU.lWUXYaD5mF6D0IQ1PB7J6LqX1r5jKHK',
ADD COLUMN "rolle" "AnsattRolle" NOT NULL DEFAULT 'TRAFIKKLARER';

-- Oppdater eksisterende hovedbrukere til å ha HOVEDBRUKER-rolle
UPDATE "Ansatt" SET "rolle" = 'HOVEDBRUKER' 
WHERE id IN (SELECT "hovedbrukerId" FROM "Bedrift" WHERE "hovedbrukerId" IS NOT NULL);

-- Fjern standardverdien for passord etter migrasjonen
ALTER TABLE "Ansatt" ALTER COLUMN "passord" DROP DEFAULT;
