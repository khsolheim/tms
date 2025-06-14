-- CreateTable
CREATE TABLE "QuizKategori" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "klasse" TEXT NOT NULL,
    "hovedkategoriId" INTEGER,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizKategori_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizKategori_klasse_idx" ON "QuizKategori"("klasse");

-- CreateIndex
CREATE INDEX "QuizKategori_hovedkategoriId_idx" ON "QuizKategori"("hovedkategoriId");

-- AddForeignKey
ALTER TABLE "QuizKategori" ADD CONSTRAINT "QuizKategori_hovedkategoriId_fkey" FOREIGN KEY ("hovedkategoriId") REFERENCES "QuizKategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;
