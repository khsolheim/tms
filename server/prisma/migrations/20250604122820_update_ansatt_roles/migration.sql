/*
  Warnings:

  - The `rolle` column on the `Ansatt` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "AnsattRolle" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "Ansatt" DROP CONSTRAINT "Ansatt_bedriftId_fkey";

-- AlterTable
ALTER TABLE "Ansatt" ALTER COLUMN "bedriftId" DROP NOT NULL,
DROP COLUMN "rolle",
ADD COLUMN     "rolle" "AnsattRolle" NOT NULL DEFAULT 'TRAFIKKLARER';

-- AddForeignKey
ALTER TABLE "Ansatt" ADD CONSTRAINT "Ansatt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
