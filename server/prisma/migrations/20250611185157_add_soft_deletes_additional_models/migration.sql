-- AlterTable
ALTER TABLE "FileAttachment" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "KontrollMal" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Sikkerhetskontroll" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Sjekkpunkt" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "FileAttachment_isDeleted_idx" ON "FileAttachment"("isDeleted");

-- CreateIndex
CREATE INDEX "FileAttachment_deletedAt_idx" ON "FileAttachment"("deletedAt");

-- CreateIndex
CREATE INDEX "KontrollMal_isDeleted_idx" ON "KontrollMal"("isDeleted");

-- CreateIndex
CREATE INDEX "KontrollMal_deletedAt_idx" ON "KontrollMal"("deletedAt");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_isDeleted_idx" ON "Sikkerhetskontroll"("isDeleted");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_deletedAt_idx" ON "Sikkerhetskontroll"("deletedAt");

-- CreateIndex
CREATE INDEX "Sjekkpunkt_isDeleted_idx" ON "Sjekkpunkt"("isDeleted");

-- CreateIndex
CREATE INDEX "Sjekkpunkt_deletedAt_idx" ON "Sjekkpunkt"("deletedAt");

-- CreateIndex
CREATE INDEX "User_isDeleted_idx" ON "User"("isDeleted");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- AddForeignKey
ALTER TABLE "KontrollMal" ADD CONSTRAINT "KontrollMal_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sikkerhetskontroll" ADD CONSTRAINT "Sikkerhetskontroll_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileAttachment" ADD CONSTRAINT "FileAttachment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
