/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[epost]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `epost` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `navn` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rolle` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rolle" AS ENUM ('ADMIN', 'INSTRUKTOR', 'ELEV');

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "epost" TEXT NOT NULL,
ADD COLUMN     "navn" TEXT NOT NULL,
ADD COLUMN     "rolle" "Rolle" NOT NULL,
ADD COLUMN     "skoleId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_epost_key" ON "User"("epost");
