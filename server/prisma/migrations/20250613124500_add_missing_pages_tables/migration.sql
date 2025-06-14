-- Migration for manglende tabeller for TMS undersider

-- Nyhetssystem
CREATE TABLE "Nyhet" (
    "id" SERIAL NOT NULL,
    "tittel" TEXT NOT NULL,
    "innhold" TEXT NOT NULL,
    "sammendrag" TEXT,
    "bildeUrl" TEXT,
    "publisert" BOOLEAN NOT NULL DEFAULT false,
    "publiseringsdato" TIMESTAMP(3),
    "forfatter" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'GENERELT',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prioritet" INTEGER NOT NULL DEFAULT 1,
    "visning" TEXT NOT NULL DEFAULT 'ALLE',
    "bedriftId" INTEGER,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Nyhet_pkey" PRIMARY KEY ("id")
);

-- Kalender og events
CREATE TABLE "KalenderEvent" (
    "id" SERIAL NOT NULL,
    "tittel" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "startDato" TIMESTAMP(3) NOT NULL,
    "sluttDato" TIMESTAMP(3) NOT NULL,
    "heldag" BOOLEAN NOT NULL DEFAULT false,
    "lokasjon" TEXT,
    "type" TEXT NOT NULL DEFAULT 'UNDERVISNING',
    "status" TEXT NOT NULL DEFAULT 'PLANLAGT',
    "deltakere" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instruktorId" INTEGER,
    "elevId" INTEGER,
    "kjoretoyId" INTEGER,
    "bedriftId" INTEGER NOT NULL,
    "fargeKode" TEXT DEFAULT '#3B82F6',
    "erindringSendt" BOOLEAN NOT NULL DEFAULT false,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "KalenderEvent_pkey" PRIMARY KEY ("id")
);

-- Oppgaver
CREATE TABLE "Oppgave" (
    "id" SERIAL NOT NULL,
    "tittel" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IKKE_PAABEGYNT',
    "prioritet" TEXT NOT NULL DEFAULT 'MEDIUM',
    "forfallsdato" TIMESTAMP(3),
    "startdato" TIMESTAMP(3),
    "ferdigstiltDato" TIMESTAMP(3),
    "estimertTid" INTEGER,
    "faktiskTid" INTEGER,
    "tildeltTil" INTEGER,
    "opprettetAv" INTEGER NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'GENERELT',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vedlegg" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kommentarer" JSONB DEFAULT '[]',
    "bedriftId" INTEGER NOT NULL,
    "relatertTabell" TEXT,
    "relatertId" INTEGER,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Oppgave_pkey" PRIMARY KEY ("id")
);

-- Prosjekter
CREATE TABLE "Prosjekt" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANLEGGING',
    "startdato" TIMESTAMP(3),
    "sluttdato" TIMESTAMP(3),
    "budget" INTEGER,
    "forbruktBudget" INTEGER DEFAULT 0,
    "prosjektleder" INTEGER,
    "teammedlemmer" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "kategori" TEXT NOT NULL DEFAULT 'GENERELT',
    "prioritet" TEXT NOT NULL DEFAULT 'MEDIUM',
    "progresjon" INTEGER NOT NULL DEFAULT 0,
    "milepaler" JSONB DEFAULT '[]',
    "risikofaktorer" JSONB DEFAULT '[]',
    "bedriftId" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Prosjekt_pkey" PRIMARY KEY ("id")
);

-- Ressursplanlegging
CREATE TABLE "Ressurs" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kapasitet" INTEGER NOT NULL DEFAULT 1,
    "ledigTid" JSONB DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'TILGJENGELIG',
    "kostnad" INTEGER,
    "lokasjon" TEXT,
    "ansvarlig" INTEGER,
    "bedriftId" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Ressurs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RessursBooking" (
    "id" SERIAL NOT NULL,
    "ressursId" INTEGER NOT NULL,
    "startTid" TIMESTAMP(3) NOT NULL,
    "sluttTid" TIMESTAMP(3) NOT NULL,
    "formaal" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "booketAv" INTEGER NOT NULL,
    "godkjentAv" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "antallPersoner" INTEGER DEFAULT 1,
    "bedriftId" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RessursBooking_pkey" PRIMARY KEY ("id")
);

-- Hjelpesystem
CREATE TABLE "HjelpArtikkel" (
    "id" SERIAL NOT NULL,
    "tittel" TEXT NOT NULL,
    "innhold" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "underkategori" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visningsrekkkefølge" INTEGER DEFAULT 0,
    "publisert" BOOLEAN NOT NULL DEFAULT false,
    "søkeord" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "opprettetAv" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HjelpArtikkel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HjelpKategori" (
    "id" SERIAL NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "ikon" TEXT,
    "rekkefølge" INTEGER DEFAULT 0,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HjelpKategori_pkey" PRIMARY KEY ("id")
);

-- Økonomisystem utvidelser
CREATE TABLE "Økonomipost" (
    "id" SERIAL NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "belop" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "dato" TIMESTAMP(3) NOT NULL,
    "referanse" TEXT,
    "mottaker" TEXT,
    "konto" TEXT,
    "mva" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'REGISTRERT',
    "relatertTabell" TEXT,
    "relatertId" INTEGER,
    "bedriftId" INTEGER NOT NULL,
    "registrertAv" INTEGER NOT NULL,
    "opprettet" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Økonomipost_pkey" PRIMARY KEY ("id")
);

-- Indekser
CREATE INDEX "Nyhet_bedriftId_idx" ON "Nyhet"("bedriftId");
CREATE INDEX "Nyhet_kategori_idx" ON "Nyhet"("kategori");
CREATE INDEX "Nyhet_publisert_idx" ON "Nyhet"("publisert");
CREATE INDEX "Nyhet_opprettet_idx" ON "Nyhet"("opprettet");
CREATE INDEX "Nyhet_isDeleted_idx" ON "Nyhet"("isDeleted");

CREATE INDEX "KalenderEvent_bedriftId_idx" ON "KalenderEvent"("bedriftId");
CREATE INDEX "KalenderEvent_startDato_idx" ON "KalenderEvent"("startDato");
CREATE INDEX "KalenderEvent_instruktorId_idx" ON "KalenderEvent"("instruktorId");
CREATE INDEX "KalenderEvent_elevId_idx" ON "KalenderEvent"("elevId");
CREATE INDEX "KalenderEvent_type_idx" ON "KalenderEvent"("type");
CREATE INDEX "KalenderEvent_status_idx" ON "KalenderEvent"("status");
CREATE INDEX "KalenderEvent_isDeleted_idx" ON "KalenderEvent"("isDeleted");

CREATE INDEX "Oppgave_bedriftId_idx" ON "Oppgave"("bedriftId");
CREATE INDEX "Oppgave_tildeltTil_idx" ON "Oppgave"("tildeltTil");
CREATE INDEX "Oppgave_opprettetAv_idx" ON "Oppgave"("opprettetAv");
CREATE INDEX "Oppgave_status_idx" ON "Oppgave"("status");
CREATE INDEX "Oppgave_prioritet_idx" ON "Oppgave"("prioritet");
CREATE INDEX "Oppgave_forfallsdato_idx" ON "Oppgave"("forfallsdato");
CREATE INDEX "Oppgave_isDeleted_idx" ON "Oppgave"("isDeleted");

CREATE INDEX "Prosjekt_bedriftId_idx" ON "Prosjekt"("bedriftId");
CREATE INDEX "Prosjekt_prosjektleder_idx" ON "Prosjekt"("prosjektleder");
CREATE INDEX "Prosjekt_status_idx" ON "Prosjekt"("status");
CREATE INDEX "Prosjekt_prioritet_idx" ON "Prosjekt"("prioritet");
CREATE INDEX "Prosjekt_startdato_idx" ON "Prosjekt"("startdato");
CREATE INDEX "Prosjekt_isDeleted_idx" ON "Prosjekt"("isDeleted");

CREATE INDEX "Ressurs_bedriftId_idx" ON "Ressurs"("bedriftId");
CREATE INDEX "Ressurs_type_idx" ON "Ressurs"("type");
CREATE INDEX "Ressurs_status_idx" ON "Ressurs"("status");
CREATE INDEX "Ressurs_ansvarlig_idx" ON "Ressurs"("ansvarlig");
CREATE INDEX "Ressurs_isDeleted_idx" ON "Ressurs"("isDeleted");

CREATE INDEX "RessursBooking_ressursId_idx" ON "RessursBooking"("ressursId");
CREATE INDEX "RessursBooking_bedriftId_idx" ON "RessursBooking"("bedriftId");
CREATE INDEX "RessursBooking_booketAv_idx" ON "RessursBooking"("booketAv");
CREATE INDEX "RessursBooking_startTid_idx" ON "RessursBooking"("startTid");
CREATE INDEX "RessursBooking_status_idx" ON "RessursBooking"("status");

CREATE INDEX "HjelpArtikkel_kategori_idx" ON "HjelpArtikkel"("kategori");
CREATE INDEX "HjelpArtikkel_publisert_idx" ON "HjelpArtikkel"("publisert");
CREATE INDEX "HjelpArtikkel_opprettetAv_idx" ON "HjelpArtikkel"("opprettetAv");
CREATE INDEX "HjelpArtikkel_isDeleted_idx" ON "HjelpArtikkel"("isDeleted");

CREATE INDEX "HjelpKategori_aktiv_idx" ON "HjelpKategori"("aktiv");
CREATE INDEX "HjelpKategori_rekkefølge_idx" ON "HjelpKategori"("rekkefølge");

CREATE INDEX "Økonomipost_bedriftId_idx" ON "Økonomipost"("bedriftId");
CREATE INDEX "Økonomipost_type_idx" ON "Økonomipost"("type");
CREATE INDEX "Økonomipost_kategori_idx" ON "Økonomipost"("kategori");
CREATE INDEX "Økonomipost_dato_idx" ON "Økonomipost"("dato");
CREATE INDEX "Økonomipost_status_idx" ON "Økonomipost"("status");
CREATE INDEX "Økonomipost_registrertAv_idx" ON "Økonomipost"("registrertAv");
CREATE INDEX "Økonomipost_isDeleted_idx" ON "Økonomipost"("isDeleted");

-- Foreign key constraints
ALTER TABLE "Nyhet" ADD CONSTRAINT "Nyhet_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Nyhet" ADD CONSTRAINT "Nyhet_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "KalenderEvent" ADD CONSTRAINT "KalenderEvent_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KalenderEvent" ADD CONSTRAINT "KalenderEvent_instruktorId_fkey" FOREIGN KEY ("instruktorId") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KalenderEvent" ADD CONSTRAINT "KalenderEvent_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KalenderEvent" ADD CONSTRAINT "KalenderEvent_kjoretoyId_fkey" FOREIGN KEY ("kjoretoyId") REFERENCES "Kjoretoy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KalenderEvent" ADD CONSTRAINT "KalenderEvent_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Oppgave" ADD CONSTRAINT "Oppgave_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Oppgave" ADD CONSTRAINT "Oppgave_tildeltTil_fkey" FOREIGN KEY ("tildeltTil") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Oppgave" ADD CONSTRAINT "Oppgave_opprettetAv_fkey" FOREIGN KEY ("opprettetAv") REFERENCES "Ansatt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Oppgave" ADD CONSTRAINT "Oppgave_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Prosjekt" ADD CONSTRAINT "Prosjekt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Prosjekt" ADD CONSTRAINT "Prosjekt_prosjektleder_fkey" FOREIGN KEY ("prosjektleder") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Prosjekt" ADD CONSTRAINT "Prosjekt_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Ressurs" ADD CONSTRAINT "Ressurs_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Ressurs" ADD CONSTRAINT "Ressurs_ansvarlig_fkey" FOREIGN KEY ("ansvarlig") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ressurs" ADD CONSTRAINT "Ressurs_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "RessursBooking" ADD CONSTRAINT "RessursBooking_ressursId_fkey" FOREIGN KEY ("ressursId") REFERENCES "Ressurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RessursBooking" ADD CONSTRAINT "RessursBooking_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RessursBooking" ADD CONSTRAINT "RessursBooking_booketAv_fkey" FOREIGN KEY ("booketAv") REFERENCES "Ansatt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RessursBooking" ADD CONSTRAINT "RessursBooking_godkjentAv_fkey" FOREIGN KEY ("godkjentAv") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "HjelpArtikkel" ADD CONSTRAINT "HjelpArtikkel_opprettetAv_fkey" FOREIGN KEY ("opprettetAv") REFERENCES "Ansatt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HjelpArtikkel" ADD CONSTRAINT "HjelpArtikkel_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Økonomipost" ADD CONSTRAINT "Økonomipost_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Økonomipost" ADD CONSTRAINT "Økonomipost_registrertAv_fkey" FOREIGN KEY ("registrertAv") REFERENCES "Ansatt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Økonomipost" ADD CONSTRAINT "Økonomipost_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt"("id") ON DELETE SET NULL ON UPDATE CASCADE;