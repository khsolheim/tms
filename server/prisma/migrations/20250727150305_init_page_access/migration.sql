-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "epost" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "rolle" TEXT NOT NULL,
    "skoleId" INTEGER,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "globalRole" TEXT NOT NULL DEFAULT 'STANDARD_USER'
);

-- CreateTable
CREATE TABLE "Sjekkpunkt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tittel" TEXT NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "bildeUrl" TEXT,
    "videoUrl" TEXT,
    "rettVerdi" TEXT,
    "typeKontroll" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "systemId" INTEGER,
    "intervallKm" INTEGER,
    "intervallTid" INTEGER,
    "forerkortklass" TEXT NOT NULL DEFAULT '[]',
    "kjoretoyRegNr" TEXT,
    "kjoretoyklass" TEXT,
    "kjoretoymerke" TEXT,
    "kjoretoytype" TEXT,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unikForKjoretoyklass" BOOLEAN NOT NULL DEFAULT false,
    "unikForMerke" BOOLEAN NOT NULL DEFAULT false,
    "unikForRegnr" BOOLEAN NOT NULL DEFAULT false,
    "unikForType" BOOLEAN NOT NULL DEFAULT false,
    "konsekvens" TEXT NOT NULL DEFAULT '[]',
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Sjekkpunkt_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "SjekkpunktSystemer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KontrollMal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kategori" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "opprettetAvId" INTEGER NOT NULL,
    "offentlig" BOOLEAN NOT NULL DEFAULT true,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "bruktAntall" INTEGER NOT NULL DEFAULT 0,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "KontrollMal_opprettetAvId_fkey" FOREIGN KEY ("opprettetAvId") REFERENCES "Ansatt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KontrollMal_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KontrollMalPunkt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kontrollMalId" INTEGER NOT NULL,
    "sjekkpunktId" INTEGER NOT NULL,
    "rekkefolge" INTEGER NOT NULL,
    "kanGodkjennesAv" TEXT NOT NULL DEFAULT 'LÆRER',
    "pakrevd" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KontrollMalPunkt_kontrollMalId_fkey" FOREIGN KEY ("kontrollMalId") REFERENCES "KontrollMal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KontrollMalPunkt_sjekkpunktId_fkey" FOREIGN KEY ("sjekkpunktId") REFERENCES "Sjekkpunkt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sikkerhetskontroll" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "bedriftId" INTEGER NOT NULL,
    "opprettetAvId" INTEGER NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "basertPaMalId" INTEGER,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Sikkerhetskontroll_basertPaMalId_fkey" FOREIGN KEY ("basertPaMalId") REFERENCES "KontrollMal" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sikkerhetskontroll_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sikkerhetskontroll_opprettetAvId_fkey" FOREIGN KEY ("opprettetAvId") REFERENCES "Ansatt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sikkerhetskontroll_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollPunkt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sikkerhetskontrollId" INTEGER NOT NULL,
    "sjekkpunktId" INTEGER NOT NULL,
    "rekkefolge" INTEGER NOT NULL,
    "kanGodkjennesAv" TEXT NOT NULL DEFAULT 'LÆRER',
    "pakrevd" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SikkerhetskontrollPunkt_sikkerhetskontrollId_fkey" FOREIGN KEY ("sikkerhetskontrollId") REFERENCES "Sikkerhetskontroll" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SikkerhetskontrollPunkt_sjekkpunktId_fkey" FOREIGN KEY ("sjekkpunktId") REFERENCES "Sjekkpunkt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bedrift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "organisasjonsnummer" TEXT NOT NULL DEFAULT '',
    "adresse" TEXT,
    "postnummer" TEXT,
    "poststed" TEXT,
    "telefon" TEXT,
    "epost" TEXT,
    "hovedbrukerId" INTEGER,
    "tenantId" INTEGER,
    "stiftelsesdato" TEXT,
    "organisasjonsform" TEXT,
    "organisasjonsformKode" TEXT,
    "naeringskode" TEXT,
    "naeringskodeKode" TEXT,
    "dagligLeder" TEXT,
    "styreleder" TEXT,
    "signaturrett" JSONB DEFAULT [],
    "brregMetadata" JSONB,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Bedrift_hovedbrukerId_fkey" FOREIGN KEY ("hovedbrukerId") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Bedrift_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Bedrift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ansatt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fornavn" TEXT NOT NULL,
    "etternavn" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "passordHash" TEXT NOT NULL,
    "tilganger" TEXT NOT NULL DEFAULT '[]',
    "bedriftId" INTEGER,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "telefon" TEXT,
    "adresse" TEXT,
    "postnummer" TEXT,
    "poststed" TEXT,
    "rolle" TEXT NOT NULL DEFAULT 'TRAFIKKLARER',
    "klasser" TEXT NOT NULL DEFAULT '[]',
    "kjoretoy" TEXT NOT NULL DEFAULT '[]',
    "hovedkjoretoy" INTEGER,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "sisteInnlogging" DATETIME,
    "varslingsinnstillinger" JSONB,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Ansatt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BedriftsKlasse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "klassekode" TEXT NOT NULL,
    "bedriftId" INTEGER NOT NULL,
    CONSTRAINT "BedriftsKlasse_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kjoretoy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "registreringsnummer" TEXT NOT NULL,
    "merke" TEXT NOT NULL,
    "modell" TEXT NOT NULL,
    "aarsmodell" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "forerkortklass" TEXT NOT NULL DEFAULT '[]',
    "bedriftId" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Kjoretoy_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Kjoretoy_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizKategori" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "klasse" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "farge" TEXT DEFAULT '#3B82F6',
    "ikon" TEXT,
    "hovedkategoriId" INTEGER,
    "moduleType" TEXT DEFAULT 'standard',
    "estimatedDuration" INTEGER,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "QuizKategori_hovedkategoriId_fkey" FOREIGN KEY ("hovedkategoriId") REFERENCES "QuizKategori" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuizKategori_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizSporsmal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tekst" TEXT NOT NULL,
    "svaralternativer" TEXT NOT NULL DEFAULT '[]',
    "riktigSvar" INTEGER NOT NULL,
    "bildeUrl" TEXT,
    "forklaring" TEXT,
    "klasser" TEXT NOT NULL DEFAULT '[]',
    "kategoriId" INTEGER,
    "vanskelighetsgrad" TEXT DEFAULT 'Middels',
    "mediaType" TEXT,
    "mediaUrl" TEXT,
    "mediaMetadata" JSONB,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "kvalitetsscore" REAL,
    "estimertTid" INTEGER,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "QuizSporsmal_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "QuizKategori" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuizSporsmal_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "kategoriId" INTEGER,
    "quizType" TEXT NOT NULL DEFAULT 'standard',
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" REAL,
    "maxScore" REAL,
    "percentage" REAL,
    "timeSpent" INTEGER,
    "questionsTotal" INTEGER,
    "questionsAnswered" INTEGER,
    "questionsCorrect" INTEGER,
    "difficulty" TEXT DEFAULT 'Middels',
    "adaptiveData" JSONB,
    "sessionIntegrity" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "browserFingerprint" TEXT,
    CONSTRAINT "QuizSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizSession_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "QuizKategori" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizSessionAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userAnswer" INTEGER NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confidence" REAL,
    CONSTRAINT "QuizSessionAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuizSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizSessionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizSporsmal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" REAL NOT NULL DEFAULT 100,
    "metadata" JSONB,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizXP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "sessionId" TEXT,
    "xpGained" INTEGER NOT NULL,
    "xpType" TEXT NOT NULL,
    "source" TEXT,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizXP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "period" TEXT NOT NULL,
    "rankings" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DifficultyAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "kategoriId" INTEGER,
    "fromDifficulty" TEXT NOT NULL,
    "toDifficulty" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "performanceData" JSONB NOT NULL,
    "adjustedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DifficultyAdjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DifficultyAdjustment_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "QuizKategori" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "preferredDifficulty" TEXT DEFAULT 'Middels',
    "learningStyle" TEXT,
    "studyTimePreference" TEXT,
    "sessionDuration" INTEGER,
    "notifications" JSONB,
    "accessibility" JSONB,
    "themes" JSONB,
    CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "kategoriId" INTEGER,
    "questionIds" TEXT NOT NULL DEFAULT '[]',
    "reason" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "confidence" REAL NOT NULL,
    "metadata" JSONB,
    "presented" BOOLEAN NOT NULL DEFAULT false,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "QuizRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuizRecommendation_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "QuizKategori" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizCollaboration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quizId" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "collaborators" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizCollaboration_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuizVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaborationId" TEXT,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "changelog" TEXT,
    "authorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizVersion_collaborationId_fkey" FOREIGN KEY ("collaborationId") REFERENCES "QuizCollaboration" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "QuizVersion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "userId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'low',
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "automaticAction" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" INTEGER,
    "reviewedAt" DATETIME,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SecurityEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "QuizSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SecurityEvent_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionIntegrity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "integrityHash" TEXT NOT NULL,
    "checksumData" JSONB NOT NULL,
    "validationPassed" BOOLEAN NOT NULL DEFAULT true,
    "anomaliesDetected" INTEGER NOT NULL DEFAULT 0,
    "lastValidated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PerformanceMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "kategoriId" INTEGER,
    "period" TEXT NOT NULL,
    "periodDate" DATETIME NOT NULL,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "averageScore" REAL,
    "averageTime" REAL,
    "improvementRate" REAL,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    CONSTRAINT "PerformanceMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PerformanceMetrics_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "QuizKategori" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningPattern" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "patternType" TEXT NOT NULL,
    "patternData" JSONB NOT NULL,
    "confidence" REAL NOT NULL,
    "strength" REAL NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME,
    CONSTRAINT "LearningPattern_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BildeLibrary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "filnavn" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storrelse" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bredde" INTEGER,
    "hoyde" INTEGER,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BildeLibrary_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Elev" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fornavn" TEXT NOT NULL,
    "etternavn" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "gate" TEXT NOT NULL,
    "postnummer" TEXT NOT NULL,
    "poststed" TEXT NOT NULL,
    "personnummer" TEXT NOT NULL,
    "klassekode" TEXT NOT NULL,
    "larer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AKTIV',
    "sistInnlogget" DATETIME,
    "bedriftId" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Elev_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Elev_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ElevSoknad" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fornavn" TEXT NOT NULL,
    "etternavn" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "epost" TEXT NOT NULL,
    "gate" TEXT NOT NULL,
    "postnummer" TEXT NOT NULL,
    "poststed" TEXT NOT NULL,
    "personnummer" TEXT NOT NULL,
    "klassekode" TEXT NOT NULL,
    "larer" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bedriftId" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ElevSoknad_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Kontrakt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "elevId" INTEGER,
    "elevFornavn" TEXT NOT NULL,
    "elevEtternavn" TEXT NOT NULL,
    "elevPersonnummer" TEXT NOT NULL,
    "elevTelefon" TEXT NOT NULL,
    "elevEpost" TEXT NOT NULL,
    "elevGate" TEXT NOT NULL,
    "elevPostnr" TEXT NOT NULL,
    "elevPoststed" TEXT NOT NULL,
    "harFakturaansvarlig" BOOLEAN NOT NULL DEFAULT false,
    "fakturaansvarligFornavn" TEXT,
    "fakturaansvarligEtternavn" TEXT,
    "fakturaansvarligPersonnummer" TEXT,
    "fakturaansvarligTelefon" TEXT,
    "fakturaansvarligEpost" TEXT,
    "fakturaansvarligGate" TEXT,
    "fakturaansvarligPostnr" TEXT,
    "fakturaansvarligPoststed" TEXT,
    "lan" INTEGER NOT NULL,
    "lopetid" INTEGER NOT NULL,
    "rente" REAL NOT NULL,
    "etableringsgebyr" INTEGER NOT NULL,
    "termingebyr" INTEGER NOT NULL,
    "terminerPerAr" INTEGER NOT NULL DEFAULT 12,
    "inkludererGebyrerILan" BOOLEAN NOT NULL DEFAULT false,
    "effektivRente" REAL NOT NULL,
    "renterOgGebyr" INTEGER NOT NULL,
    "terminbelop" INTEGER NOT NULL,
    "totalRente" INTEGER NOT NULL,
    "totalBelop" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UTKAST',
    "bedriftId" INTEGER NOT NULL,
    "opprettetAv" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Kontrakt_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Kontrakt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kontrakt_opprettetAv_fkey" FOREIGN KEY ("opprettetAv") REFERENCES "Ansatt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Kontrakt_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bedriftId" INTEGER NOT NULL,
    "dagerForfallFaktura" INTEGER NOT NULL DEFAULT 14,
    "purregebyr" INTEGER NOT NULL DEFAULT 100,
    "forsinkelsesrente" REAL NOT NULL DEFAULT 8.5,
    "kontonummer" TEXT,
    "fakturaPrefix" TEXT,
    "fakturaStartNummer" INTEGER NOT NULL DEFAULT 1,
    "fakturaForfall" INTEGER NOT NULL DEFAULT 14,
    "fakturaRente" REAL NOT NULL DEFAULT 8.5,
    "standardRente" REAL NOT NULL DEFAULT 5.0,
    "standardEtableringsgebyr" INTEGER NOT NULL DEFAULT 1900,
    "standardTermingebyr" INTEGER NOT NULL DEFAULT 50,
    "standardLopetid" INTEGER NOT NULL DEFAULT 24,
    "sendKvitteringTilElev" BOOLEAN NOT NULL DEFAULT true,
    "sendKopiTilBedrift" BOOLEAN NOT NULL DEFAULT true,
    "standardAvsenderEpost" TEXT,
    "standardAvsenderNavn" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "emailFrom" TEXT,
    "emailReplyTo" TEXT,
    "emailVarsler" BOOLEAN NOT NULL DEFAULT true,
    "varsleNyKontrakt" BOOLEAN NOT NULL DEFAULT true,
    "varsleStatusendring" BOOLEAN NOT NULL DEFAULT true,
    "varsleForfall" BOOLEAN NOT NULL DEFAULT true,
    "dagerForVarslingForfall" INTEGER NOT NULL DEFAULT 7,
    "visPersonnummerILister" BOOLEAN NOT NULL DEFAULT false,
    "tillateElevregistrering" BOOLEAN NOT NULL DEFAULT true,
    "kreverGodkjenningElevSoknad" BOOLEAN NOT NULL DEFAULT true,
    "maksAntallElever" INTEGER,
    "maksAntallAnsatte" INTEGER,
    "loginUtlopstid" INTEGER NOT NULL DEFAULT 24,
    "epost" TEXT,
    "organisasjonsnummer" TEXT,
    "postnummer" TEXT,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SystemConfig_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tableName" TEXT NOT NULL,
    "recordId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "userId" INTEGER,
    "changes" JSONB NOT NULL,
    "metadata" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "emne" TEXT NOT NULL,
    "innhold" TEXT NOT NULL,
    "variabler" TEXT NOT NULL DEFAULT '[]',
    "kategori" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "systemMal" BOOLEAN NOT NULL DEFAULT false,
    "beskrivelse" TEXT,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "EmailTemplate_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mottakerId" INTEGER NOT NULL,
    "tittel" TEXT NOT NULL,
    "melding" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "lest" BOOLEAN NOT NULL DEFAULT false,
    "lestTidspunkt" DATETIME,
    "lenke" TEXT,
    "metadata" JSONB,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_mottakerId_fkey" FOREIGN KEY ("mottakerId") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileAttachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalName" TEXT NOT NULL,
    "filnavn" TEXT NOT NULL,
    "filsti" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storrelse" INTEGER NOT NULL,
    "sjekksumMD5" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "opploadetAv" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kategori" TEXT NOT NULL,
    "relatertId" INTEGER,
    "relatertTabell" TEXT,
    "virussjekket" BOOLEAN NOT NULL DEFAULT false,
    "godkjent" BOOLEAN NOT NULL DEFAULT false,
    "offentlig" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FileAttachment_opploadetAv_fkey" FOREIGN KEY ("opploadetAv") REFERENCES "Ansatt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FileAttachment_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kontraktId" INTEGER NOT NULL,
    "referanse" TEXT NOT NULL,
    "belop" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "forfallsdato" DATETIME NOT NULL,
    "betalingsdato" DATETIME,
    "transaksjonsId" TEXT,
    "betalingsmetode" TEXT,
    "feilmelding" TEXT,
    "metadata" JSONB,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentTransaction_kontraktId_fkey" FOREIGN KEY ("kontraktId") REFERENCES "Kontrakt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mottaker" TEXT NOT NULL,
    "emne" TEXT NOT NULL,
    "templateId" INTEGER,
    "status" TEXT NOT NULL,
    "messageId" TEXT,
    "feilmelding" TEXT,
    "sendeforsoker" INTEGER NOT NULL DEFAULT 1,
    "sistForsokt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sendt" DATETIME,
    "lest" BOOLEAN NOT NULL DEFAULT false,
    "klikket" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailLog_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "apiBaseUrl" TEXT,
    "dokumentasjon" TEXT,
    "logoUrl" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "tilgjengelig" BOOLEAN NOT NULL DEFAULT true,
    "versjon" TEXT,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IntegrationConfiguration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bedriftId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "navn" TEXT NOT NULL,
    "aktiv" BOOLEAN NOT NULL DEFAULT false,
    "autoSync" BOOLEAN NOT NULL DEFAULT false,
    "syncInterval" INTEGER,
    "lastSync" DATETIME,
    "lastSyncStatus" TEXT,
    "konfigurasjonsdata" TEXT NOT NULL,
    "syncKunder" BOOLEAN NOT NULL DEFAULT true,
    "syncFakturaer" BOOLEAN NOT NULL DEFAULT true,
    "syncProdukter" BOOLEAN NOT NULL DEFAULT false,
    "syncKontrakter" BOOLEAN NOT NULL DEFAULT true,
    "feltMapping" TEXT DEFAULT '{}',
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryInterval" INTEGER NOT NULL DEFAULT 5,
    "feilVarsling" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opprettetAv" INTEGER NOT NULL,
    CONSTRAINT "IntegrationConfiguration_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IntegrationConfiguration_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IntegrationConfiguration_opprettetAv_fkey" FOREIGN KEY ("opprettetAv") REFERENCES "Ansatt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bedriftId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "konfigurasjonsId" INTEGER,
    "operasjon" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "melding" TEXT,
    "feildetaljer" TEXT,
    "metadata" TEXT,
    "starttid" DATETIME NOT NULL,
    "sluttid" DATETIME,
    "varighet" INTEGER,
    "relatertTabell" TEXT,
    "relatertId" INTEGER,
    "eksternReferanse" TEXT,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationLog_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IntegrationLog_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "IntegrationLog_konfigurasjonsId_fkey" FOREIGN KEY ("konfigurasjonsId") REFERENCES "IntegrationConfiguration" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationSyncJob" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "konfigurasjonsId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "prioritet" INTEGER NOT NULL DEFAULT 5,
    "planlagtTid" DATETIME NOT NULL,
    "starttid" DATETIME,
    "sluttid" DATETIME,
    "varighet" INTEGER,
    "totalOppgaver" INTEGER,
    "ferdigeOppgaver" INTEGER NOT NULL DEFAULT 0,
    "feiledOppgaver" INTEGER NOT NULL DEFAULT 0,
    "progressMelding" TEXT,
    "resultatSammendrag" TEXT,
    "feilmelding" TEXT,
    "forsoker" INTEGER NOT NULL DEFAULT 0,
    "maksForsok" INTEGER NOT NULL DEFAULT 3,
    "nesteForsoket" DATETIME,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IntegrationSyncJob_konfigurasjonsId_fkey" FOREIGN KEY ("konfigurasjonsId") REFERENCES "IntegrationConfiguration" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logo" TEXT,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "plan" TEXT NOT NULL DEFAULT 'BASIC',
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "UserTenant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "rolle" TEXT NOT NULL DEFAULT 'VIEWER',
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "invitedBy" INTEGER,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserTenant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserTenant_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserTenant_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollKlasse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "ikonUrl" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "rekkefolge" INTEGER NOT NULL DEFAULT 0,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollKategori" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "ikonUrl" TEXT,
    "farge" TEXT,
    "klasseId" INTEGER NOT NULL,
    "rekkefolge" INTEGER NOT NULL DEFAULT 0,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SikkerhetskontrollKategori_klasseId_fkey" FOREIGN KEY ("klasseId") REFERENCES "SikkerhetskontrollKlasse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollSporsmal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sporsmalTekst" TEXT NOT NULL,
    "svarKort" TEXT NOT NULL,
    "svarDetaljert" TEXT NOT NULL,
    "hvorforderVikreligTekst" TEXT NOT NULL,
    "kategoriId" INTEGER NOT NULL,
    "vanskelighetsgrad" TEXT NOT NULL DEFAULT 'MIDDELS',
    "rekkefolge" INTEGER NOT NULL DEFAULT 0,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SikkerhetskontrollSporsmal_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "SikkerhetskontrollKategori" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollMedia" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sporsmalId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altTekst" TEXT NOT NULL,
    "tittel" TEXT,
    "storrelse" INTEGER,
    "varighet" INTEGER,
    "bredde" INTEGER,
    "hoyde" INTEGER,
    "rekkefolge" INTEGER NOT NULL DEFAULT 0,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SikkerhetskontrollMedia_sporsmalId_fkey" FOREIGN KEY ("sporsmalId") REFERENCES "SikkerhetskontrollSporsmal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollElevProgresjon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "elevId" INTEGER NOT NULL,
    "klasseId" INTEGER,
    "kategoriId" INTEGER,
    "sporsmalId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IKKE_SETT',
    "antallRiktigeForsok" INTEGER NOT NULL DEFAULT 0,
    "antallGaleForsok" INTEGER NOT NULL DEFAULT 0,
    "mestret" BOOLEAN NOT NULL DEFAULT false,
    "mestretDato" DATETIME,
    "totalTid" INTEGER NOT NULL DEFAULT 0,
    "antallSporsmalSett" INTEGER NOT NULL DEFAULT 0,
    "sisteAktivitet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sisteInteraksjonDato" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "personligNotat" TEXT,
    "vanskelighetsmarkering" TEXT,
    "xpOpptjent" INTEGER NOT NULL DEFAULT 0,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SikkerhetskontrollElevProgresjon_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SikkerhetskontrollElevProgresjon_klasseId_fkey" FOREIGN KEY ("klasseId") REFERENCES "SikkerhetskontrollKlasse" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SikkerhetskontrollElevProgresjon_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "SikkerhetskontrollKategori" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SikkerhetskontrollElevProgresjon_sporsmalId_fkey" FOREIGN KEY ("sporsmalId") REFERENCES "SikkerhetskontrollSporsmal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollAchievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "ikonUrl" TEXT,
    "type" TEXT NOT NULL,
    "kriteria" JSONB NOT NULL,
    "xpBelonning" INTEGER NOT NULL DEFAULT 50,
    "sjelden" BOOLEAN NOT NULL DEFAULT false,
    "skjult" BOOLEAN NOT NULL DEFAULT false,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollElevAchievement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "elevId" INTEGER NOT NULL,
    "achievementId" INTEGER NOT NULL,
    "oppnaddDato" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SikkerhetskontrollElevAchievement_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SikkerhetskontrollElevAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "SikkerhetskontrollAchievement" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SikkerhetskontrollBil" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "elevId" INTEGER NOT NULL,
    "bilNavn" TEXT,
    "monterdeDeler" JSONB NOT NULL DEFAULT [],
    "totalProgresjon" REAL NOT NULL DEFAULT 0.0,
    "sisteOppdatering" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SikkerhetskontrollBil_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SjekkpunktSystemer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "ikon" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "rekkefolge" INTEGER,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ForerkortKlasser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kode" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kategori" TEXT,
    "minimumsalder" INTEGER,
    "krav" TEXT NOT NULL DEFAULT '[]',
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SeedDataConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "beskrivelse" TEXT,
    "sist_oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Nyhet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tittel" TEXT NOT NULL,
    "innhold" TEXT NOT NULL,
    "sammendrag" TEXT,
    "bildeUrl" TEXT,
    "publisert" BOOLEAN NOT NULL DEFAULT false,
    "publiseringsdato" DATETIME,
    "forfatter" TEXT NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'GENERELT',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "prioritet" INTEGER NOT NULL DEFAULT 1,
    "visning" TEXT NOT NULL DEFAULT 'ALLE',
    "bedriftId" INTEGER,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Nyhet_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nyhet_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KalenderEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tittel" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "startDato" DATETIME NOT NULL,
    "sluttDato" DATETIME NOT NULL,
    "heldag" BOOLEAN NOT NULL DEFAULT false,
    "lokasjon" TEXT,
    "type" TEXT NOT NULL DEFAULT 'UNDERVISNING',
    "status" TEXT NOT NULL DEFAULT 'PLANLAGT',
    "deltakere" TEXT NOT NULL DEFAULT '[]',
    "instruktorId" INTEGER,
    "elevId" INTEGER,
    "kjoretoyId" INTEGER,
    "bedriftId" INTEGER NOT NULL,
    "fargeKode" TEXT DEFAULT '#3B82F6',
    "erindringSendt" BOOLEAN NOT NULL DEFAULT false,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "KalenderEvent_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KalenderEvent_instruktorId_fkey" FOREIGN KEY ("instruktorId") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "KalenderEvent_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "KalenderEvent_kjoretoyId_fkey" FOREIGN KEY ("kjoretoyId") REFERENCES "Kjoretoy" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "KalenderEvent_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Oppgave" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tittel" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IKKE_PAABEGYNT',
    "prioritet" TEXT NOT NULL DEFAULT 'MEDIUM',
    "forfallsdato" DATETIME,
    "startdato" DATETIME,
    "ferdigstiltDato" DATETIME,
    "estimertTid" INTEGER,
    "faktiskTid" INTEGER,
    "tildeltTil" INTEGER,
    "opprettetAv" INTEGER NOT NULL,
    "kategori" TEXT NOT NULL DEFAULT 'GENERELT',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "vedlegg" TEXT NOT NULL DEFAULT '[]',
    "kommentarer" JSONB NOT NULL DEFAULT [],
    "bedriftId" INTEGER NOT NULL,
    "relatertTabell" TEXT,
    "relatertId" INTEGER,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Oppgave_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Oppgave_tildeltTil_fkey" FOREIGN KEY ("tildeltTil") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Oppgave_opprettetAv_fkey" FOREIGN KEY ("opprettetAv") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Oppgave_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prosjekt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANLEGGING',
    "startdato" DATETIME,
    "sluttdato" DATETIME,
    "budget" INTEGER,
    "forbruktBudget" INTEGER NOT NULL DEFAULT 0,
    "prosjektleder" INTEGER,
    "teammedlemmer" TEXT NOT NULL DEFAULT '[]',
    "kategori" TEXT NOT NULL DEFAULT 'GENERELT',
    "prioritet" TEXT NOT NULL DEFAULT 'MEDIUM',
    "progresjon" INTEGER NOT NULL DEFAULT 0,
    "milepaler" JSONB NOT NULL DEFAULT [],
    "risikofaktorer" JSONB NOT NULL DEFAULT [],
    "bedriftId" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Prosjekt_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Prosjekt_prosjektleder_fkey" FOREIGN KEY ("prosjektleder") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Prosjekt_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ressurs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "kapasitet" INTEGER NOT NULL DEFAULT 1,
    "ledigTid" JSONB NOT NULL DEFAULT {},
    "status" TEXT NOT NULL DEFAULT 'TILGJENGELIG',
    "kostnad" INTEGER,
    "lokasjon" TEXT,
    "ansvarlig" INTEGER,
    "bedriftId" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Ressurs_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ressurs_ansvarlig_fkey" FOREIGN KEY ("ansvarlig") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ressurs_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RessursBooking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ressursId" INTEGER NOT NULL,
    "startTid" DATETIME NOT NULL,
    "sluttTid" DATETIME NOT NULL,
    "formaal" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "booketAv" INTEGER NOT NULL,
    "godkjentAv" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "antallPersoner" INTEGER NOT NULL DEFAULT 1,
    "bedriftId" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RessursBooking_ressursId_fkey" FOREIGN KEY ("ressursId") REFERENCES "Ressurs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RessursBooking_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RessursBooking_booketAv_fkey" FOREIGN KEY ("booketAv") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RessursBooking_godkjentAv_fkey" FOREIGN KEY ("godkjentAv") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HjelpKategori" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "beskrivelse" TEXT,
    "ikon" TEXT,
    "rekkefolge" INTEGER NOT NULL DEFAULT 0,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HjelpArtikkel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tittel" TEXT NOT NULL,
    "innhold" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "underkategori" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "visningsrekkefolge" INTEGER NOT NULL DEFAULT 0,
    "publisert" BOOLEAN NOT NULL DEFAULT false,
    "sokeord" TEXT NOT NULL DEFAULT '[]',
    "opprettetAv" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "HjelpArtikkel_kategori_fkey" FOREIGN KEY ("kategori") REFERENCES "HjelpKategori" ("navn") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HjelpArtikkel_opprettetAv_fkey" FOREIGN KEY ("opprettetAv") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HjelpArtikkel_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Okonomipost" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "beskrivelse" TEXT NOT NULL,
    "belop" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "dato" DATETIME NOT NULL,
    "referanse" TEXT,
    "mottaker" TEXT,
    "konto" TEXT,
    "mva" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'REGISTRERT',
    "relatertTabell" TEXT,
    "relatertId" INTEGER,
    "bedriftId" INTEGER NOT NULL,
    "registrertAv" INTEGER NOT NULL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Okonomipost_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Okonomipost_registrertAv_fkey" FOREIGN KEY ("registrertAv") REFERENCES "Ansatt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Okonomipost_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Service" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "navn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "beskrivelse" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "versjon" TEXT NOT NULL DEFAULT '1.0.0',
    "konfiguration" JSONB DEFAULT {},
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BedriftService" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bedriftId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivatedAt" DATETIME,
    "activatedBy" INTEGER NOT NULL,
    "deactivatedBy" INTEGER,
    "konfiguration" JSONB DEFAULT {},
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BedriftService_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BedriftService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BedriftService_activatedBy_fkey" FOREIGN KEY ("activatedBy") REFERENCES "Ansatt" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BedriftService_deactivatedBy_fkey" FOREIGN KEY ("deactivatedBy") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserTwoFactor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL DEFAULT '[]',
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserTwoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TwoFactorAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "attemptType" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "attemptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TwoFactorAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserKnowledgeState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,
    "masteryLevel" REAL NOT NULL DEFAULT 0.0,
    "confidence" REAL NOT NULL DEFAULT 0.0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserKnowledgeState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "contentId" TEXT,
    "performanceData" JSONB,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "difficulty" REAL,
    "timeSpent" INTEGER,
    "result" BOOLEAN,
    CONSTRAINT "LearningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningPathway" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "goalId" TEXT,
    "moduleSequence" JSONB NOT NULL,
    "currentPosition" INTEGER NOT NULL DEFAULT 0,
    "adaptationRules" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LearningPathway_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MLModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "accuracyMetrics" JSONB,
    "trainingDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "parameters" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserRiskAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "assessmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dropoutProbability" REAL NOT NULL,
    "performanceTrend" TEXT NOT NULL,
    "confidenceScore" REAL NOT NULL,
    "riskFactors" JSONB,
    "interventionsRecommended" JSONB,
    "modelVersion" TEXT NOT NULL,
    CONSTRAINT "UserRiskAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "interventionType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" DATETIME,
    "executedBy" INTEGER,
    "effectivenessScore" REAL,
    CONSTRAINT "Intervention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Intervention_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeografiskEnhet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "navn" TEXT NOT NULL,
    "kode" TEXT,
    "parentId" INTEGER,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeografiskEnhet_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GeografiskEnhet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnonsorSponsor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bedriftId" INTEGER NOT NULL,
    "navn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "kontaktperson" TEXT,
    "telefon" TEXT,
    "epost" TEXT,
    "nettside" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "startDato" DATETIME NOT NULL,
    "sluttDato" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "godkjentAv" INTEGER,
    "godkjentDato" DATETIME,
    "avvistGrunn" TEXT,
    "budsjett" REAL,
    "kostnadPerVisning" REAL,
    "kostnadPerKlikk" REAL,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "deletedBy" INTEGER,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AnnonsorSponsor_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AnnonsorSponsor_godkjentAv_fkey" FOREIGN KEY ("godkjentAv") REFERENCES "Ansatt" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Annonse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "annonsorId" INTEGER NOT NULL,
    "tittel" TEXT NOT NULL,
    "innledning" TEXT NOT NULL,
    "fullInnhold" TEXT NOT NULL,
    "bildeUrl" TEXT,
    "videoUrl" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "ctaTelefon" TEXT,
    "ctaEpost" TEXT,
    "ctaVeibeskrivelse" TEXT,
    "aktiv" BOOLEAN NOT NULL DEFAULT true,
    "prioritet" INTEGER NOT NULL DEFAULT 1,
    "maxVisninger" INTEGER,
    "maxKlikk" INTEGER,
    "startDato" DATETIME NOT NULL,
    "sluttDato" DATETIME,
    "opprettet" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oppdatert" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Annonse_annonsorId_fkey" FOREIGN KEY ("annonsorId") REFERENCES "AnnonsorSponsor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnonseTargeting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "annonseId" INTEGER NOT NULL,
    "geografiskId" INTEGER,
    "spesifikkeSkoleId" INTEGER,
    CONSTRAINT "AnnonseTargeting_annonseId_fkey" FOREIGN KEY ("annonseId") REFERENCES "Annonse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AnnonseTargeting_geografiskId_fkey" FOREIGN KEY ("geografiskId") REFERENCES "GeografiskEnhet" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AnnonseTargeting_spesifikkeSkoleId_fkey" FOREIGN KEY ("spesifikkeSkoleId") REFERENCES "Bedrift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnonseStatistikk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "annonseId" INTEGER NOT NULL,
    "dato" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "antallVisninger" INTEGER NOT NULL DEFAULT 0,
    "antallKlikk" INTEGER NOT NULL DEFAULT 0,
    "antallTelefonKlikk" INTEGER NOT NULL DEFAULT 0,
    "antallEpostKlikk" INTEGER NOT NULL DEFAULT 0,
    "antallVeiKlikk" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "AnnonseStatistikk_annonseId_fkey" FOREIGN KEY ("annonseId") REFERENCES "Annonse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AnnonseInteraksjon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "annonseId" INTEGER NOT NULL,
    "elevId" INTEGER,
    "interaksjonsType" TEXT NOT NULL,
    "tidspunkt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAdresse" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    CONSTRAINT "AnnonseInteraksjon_annonseId_fkey" FOREIGN KEY ("annonseId") REFERENCES "Annonse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AnnonseInteraksjon_elevId_fkey" FOREIGN KEY ("elevId") REFERENCES "Elev" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageDefinition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pageKey" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresSubscription" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionTier" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BedriftPageAccess" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bedriftId" INTEGER NOT NULL,
    "pageKey" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "enabledAt" DATETIME,
    "disabledAt" DATETIME,
    "enabledBy" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BedriftPageAccess_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BedriftPageAccess_pageKey_fkey" FOREIGN KEY ("pageKey") REFERENCES "PageDefinition" ("pageKey") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BedriftPageAccess_enabledBy_fkey" FOREIGN KEY ("enabledBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageAccessHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bedriftId" INTEGER NOT NULL,
    "pageKey" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" INTEGER,
    "reason" TEXT,
    "performedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageAccessHistory_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PageAccessHistory_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" REAL,
    "priceYearly" REAL,
    "features" TEXT NOT NULL DEFAULT '[]',
    "maxUsers" INTEGER,
    "maxBedrifter" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BedriftSubscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bedriftId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "paymentMethod" TEXT,
    "lastPaymentDate" DATETIME,
    "nextPaymentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BedriftSubscription_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BedriftSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionFeature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planId" INTEGER NOT NULL,
    "featureKey" TEXT NOT NULL,
    "featureName" TEXT NOT NULL,
    "description" TEXT,
    "isIncluded" BOOLEAN NOT NULL DEFAULT true,
    "limitValue" INTEGER,
    CONSTRAINT "SubscriptionFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SubscriptionHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bedriftId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "oldPlanId" INTEGER,
    "newPlanId" INTEGER,
    "performedBy" INTEGER,
    "notes" TEXT,
    "performedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubscriptionHistory_bedriftId_fkey" FOREIGN KEY ("bedriftId") REFERENCES "Bedrift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SubscriptionHistory_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SubscriptionHistory_oldPlanId_fkey" FOREIGN KEY ("oldPlanId") REFERENCES "SubscriptionPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SubscriptionHistory_newPlanId_fkey" FOREIGN KEY ("newPlanId") REFERENCES "SubscriptionPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SubscriptionHistory_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_epost_key" ON "User"("epost");

-- CreateIndex
CREATE INDEX "User_isDeleted_idx" ON "User"("isDeleted");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_epost_idx" ON "User"("epost");

-- CreateIndex
CREATE INDEX "User_rolle_idx" ON "User"("rolle");

-- CreateIndex
CREATE INDEX "User_globalRole_idx" ON "User"("globalRole");

-- CreateIndex
CREATE INDEX "Sjekkpunkt_isDeleted_idx" ON "Sjekkpunkt"("isDeleted");

-- CreateIndex
CREATE INDEX "Sjekkpunkt_deletedAt_idx" ON "Sjekkpunkt"("deletedAt");

-- CreateIndex
CREATE INDEX "Sjekkpunkt_systemId_idx" ON "Sjekkpunkt"("systemId");

-- CreateIndex
CREATE INDEX "KontrollMal_kategori_idx" ON "KontrollMal"("kategori");

-- CreateIndex
CREATE INDEX "KontrollMal_offentlig_idx" ON "KontrollMal"("offentlig");

-- CreateIndex
CREATE INDEX "KontrollMal_tags_idx" ON "KontrollMal"("tags");

-- CreateIndex
CREATE INDEX "KontrollMal_opprettetAvId_idx" ON "KontrollMal"("opprettetAvId");

-- CreateIndex
CREATE INDEX "KontrollMal_opprettetAvId_aktiv_idx" ON "KontrollMal"("opprettetAvId", "aktiv");

-- CreateIndex
CREATE INDEX "KontrollMal_opprettet_idx" ON "KontrollMal"("opprettet");

-- CreateIndex
CREATE INDEX "KontrollMal_offentlig_aktiv_idx" ON "KontrollMal"("offentlig", "aktiv");

-- CreateIndex
CREATE INDEX "KontrollMal_navn_idx" ON "KontrollMal"("navn");

-- CreateIndex
CREATE INDEX "KontrollMal_isDeleted_idx" ON "KontrollMal"("isDeleted");

-- CreateIndex
CREATE INDEX "KontrollMal_deletedAt_idx" ON "KontrollMal"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "KontrollMalPunkt_kontrollMalId_sjekkpunktId_key" ON "KontrollMalPunkt"("kontrollMalId", "sjekkpunktId");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_bedriftId_idx" ON "Sikkerhetskontroll"("bedriftId");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_bedriftId_aktiv_idx" ON "Sikkerhetskontroll"("bedriftId", "aktiv");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_opprettet_idx" ON "Sikkerhetskontroll"("opprettet");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_opprettetAvId_idx" ON "Sikkerhetskontroll"("opprettetAvId");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_basertPaMalId_idx" ON "Sikkerhetskontroll"("basertPaMalId");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_isDeleted_idx" ON "Sikkerhetskontroll"("isDeleted");

-- CreateIndex
CREATE INDEX "Sikkerhetskontroll_deletedAt_idx" ON "Sikkerhetskontroll"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollPunkt_sikkerhetskontrollId_sjekkpunktId_key" ON "SikkerhetskontrollPunkt"("sikkerhetskontrollId", "sjekkpunktId");

-- CreateIndex
CREATE UNIQUE INDEX "Bedrift_organisasjonsnummer_key" ON "Bedrift"("organisasjonsnummer");

-- CreateIndex
CREATE UNIQUE INDEX "Bedrift_hovedbrukerId_key" ON "Bedrift"("hovedbrukerId");

-- CreateIndex
CREATE INDEX "Bedrift_navn_idx" ON "Bedrift"("navn");

-- CreateIndex
CREATE INDEX "Bedrift_opprettet_idx" ON "Bedrift"("opprettet");

-- CreateIndex
CREATE INDEX "Bedrift_organisasjonsnummer_idx" ON "Bedrift"("organisasjonsnummer");

-- CreateIndex
CREATE INDEX "Bedrift_isDeleted_idx" ON "Bedrift"("isDeleted");

-- CreateIndex
CREATE INDEX "Bedrift_deletedAt_idx" ON "Bedrift"("deletedAt");

-- CreateIndex
CREATE INDEX "Bedrift_tenantId_idx" ON "Bedrift"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Ansatt_epost_key" ON "Ansatt"("epost");

-- CreateIndex
CREATE INDEX "Ansatt_bedriftId_rolle_idx" ON "Ansatt"("bedriftId", "rolle");

-- CreateIndex
CREATE INDEX "Ansatt_epost_idx" ON "Ansatt"("epost");

-- CreateIndex
CREATE INDEX "Ansatt_bedriftId_idx" ON "Ansatt"("bedriftId");

-- CreateIndex
CREATE INDEX "Ansatt_opprettet_idx" ON "Ansatt"("opprettet");

-- CreateIndex
CREATE INDEX "Ansatt_rolle_idx" ON "Ansatt"("rolle");

-- CreateIndex
CREATE INDEX "Ansatt_fornavn_etternavn_idx" ON "Ansatt"("fornavn", "etternavn");

-- CreateIndex
CREATE INDEX "Ansatt_isDeleted_idx" ON "Ansatt"("isDeleted");

-- CreateIndex
CREATE INDEX "Ansatt_deletedAt_idx" ON "Ansatt"("deletedAt");

-- CreateIndex
CREATE INDEX "BedriftsKlasse_bedriftId_idx" ON "BedriftsKlasse"("bedriftId");

-- CreateIndex
CREATE INDEX "BedriftsKlasse_klassekode_idx" ON "BedriftsKlasse"("klassekode");

-- CreateIndex
CREATE UNIQUE INDEX "BedriftsKlasse_klassekode_bedriftId_key" ON "BedriftsKlasse"("klassekode", "bedriftId");

-- CreateIndex
CREATE UNIQUE INDEX "Kjoretoy_registreringsnummer_key" ON "Kjoretoy"("registreringsnummer");

-- CreateIndex
CREATE INDEX "Kjoretoy_bedriftId_idx" ON "Kjoretoy"("bedriftId");

-- CreateIndex
CREATE INDEX "Kjoretoy_bedriftId_status_idx" ON "Kjoretoy"("bedriftId", "status");

-- CreateIndex
CREATE INDEX "Kjoretoy_isDeleted_idx" ON "Kjoretoy"("isDeleted");

-- CreateIndex
CREATE INDEX "Kjoretoy_deletedAt_idx" ON "Kjoretoy"("deletedAt");

-- CreateIndex
CREATE INDEX "Kjoretoy_merke_modell_idx" ON "Kjoretoy"("merke", "modell");

-- CreateIndex
CREATE INDEX "Kjoretoy_status_idx" ON "Kjoretoy"("status");

-- CreateIndex
CREATE INDEX "Kjoretoy_aarsmodell_idx" ON "Kjoretoy"("aarsmodell");

-- CreateIndex
CREATE INDEX "QuizKategori_klasse_idx" ON "QuizKategori"("klasse");

-- CreateIndex
CREATE INDEX "QuizKategori_hovedkategoriId_idx" ON "QuizKategori"("hovedkategoriId");

-- CreateIndex
CREATE INDEX "QuizKategori_navn_idx" ON "QuizKategori"("navn");

-- CreateIndex
CREATE INDEX "QuizKategori_moduleType_idx" ON "QuizKategori"("moduleType");

-- CreateIndex
CREATE INDEX "QuizKategori_aktiv_idx" ON "QuizKategori"("aktiv");

-- CreateIndex
CREATE INDEX "QuizKategori_isDeleted_idx" ON "QuizKategori"("isDeleted");

-- CreateIndex
CREATE INDEX "QuizKategori_deletedAt_idx" ON "QuizKategori"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuizKategori_navn_klasse_key" ON "QuizKategori"("navn", "klasse");

-- CreateIndex
CREATE INDEX "QuizSporsmal_kategoriId_idx" ON "QuizSporsmal"("kategoriId");

-- CreateIndex
CREATE INDEX "QuizSporsmal_klasser_idx" ON "QuizSporsmal"("klasser");

-- CreateIndex
CREATE INDEX "QuizSporsmal_vanskelighetsgrad_idx" ON "QuizSporsmal"("vanskelighetsgrad");

-- CreateIndex
CREATE INDEX "QuizSporsmal_aiGenerated_idx" ON "QuizSporsmal"("aiGenerated");

-- CreateIndex
CREATE INDEX "QuizSporsmal_isDeleted_idx" ON "QuizSporsmal"("isDeleted");

-- CreateIndex
CREATE INDEX "QuizSporsmal_deletedAt_idx" ON "QuizSporsmal"("deletedAt");

-- CreateIndex
CREATE INDEX "QuizSession_userId_idx" ON "QuizSession"("userId");

-- CreateIndex
CREATE INDEX "QuizSession_kategoriId_idx" ON "QuizSession"("kategoriId");

-- CreateIndex
CREATE INDEX "QuizSession_startTime_idx" ON "QuizSession"("startTime");

-- CreateIndex
CREATE INDEX "QuizSession_completed_idx" ON "QuizSession"("completed");

-- CreateIndex
CREATE INDEX "QuizSession_quizType_idx" ON "QuizSession"("quizType");

-- CreateIndex
CREATE INDEX "QuizSessionAnswer_sessionId_idx" ON "QuizSessionAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "QuizSessionAnswer_questionId_idx" ON "QuizSessionAnswer"("questionId");

-- CreateIndex
CREATE INDEX "QuizSessionAnswer_answeredAt_idx" ON "QuizSessionAnswer"("answeredAt");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserAchievement_unlockedAt_idx" ON "UserAchievement"("unlockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "QuizXP_userId_idx" ON "QuizXP"("userId");

-- CreateIndex
CREATE INDEX "QuizXP_earnedAt_idx" ON "QuizXP"("earnedAt");

-- CreateIndex
CREATE INDEX "QuizXP_xpType_idx" ON "QuizXP"("xpType");

-- CreateIndex
CREATE INDEX "Leaderboard_type_idx" ON "Leaderboard"("type");

-- CreateIndex
CREATE INDEX "Leaderboard_category_idx" ON "Leaderboard"("category");

-- CreateIndex
CREATE INDEX "Leaderboard_period_idx" ON "Leaderboard"("period");

-- CreateIndex
CREATE INDEX "DifficultyAdjustment_userId_idx" ON "DifficultyAdjustment"("userId");

-- CreateIndex
CREATE INDEX "DifficultyAdjustment_kategoriId_idx" ON "DifficultyAdjustment"("kategoriId");

-- CreateIndex
CREATE INDEX "DifficultyAdjustment_adjustedAt_idx" ON "DifficultyAdjustment"("adjustedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "UserPreferences_userId_idx" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "QuizRecommendation_userId_idx" ON "QuizRecommendation"("userId");

-- CreateIndex
CREATE INDEX "QuizRecommendation_kategoriId_idx" ON "QuizRecommendation"("kategoriId");

-- CreateIndex
CREATE INDEX "QuizRecommendation_createdAt_idx" ON "QuizRecommendation"("createdAt");

-- CreateIndex
CREATE INDEX "QuizRecommendation_priority_idx" ON "QuizRecommendation"("priority");

-- CreateIndex
CREATE INDEX "QuizCollaboration_ownerId_idx" ON "QuizCollaboration"("ownerId");

-- CreateIndex
CREATE INDEX "QuizCollaboration_status_idx" ON "QuizCollaboration"("status");

-- CreateIndex
CREATE INDEX "QuizVersion_collaborationId_idx" ON "QuizVersion"("collaborationId");

-- CreateIndex
CREATE INDEX "QuizVersion_authorId_idx" ON "QuizVersion"("authorId");

-- CreateIndex
CREATE INDEX "QuizVersion_status_idx" ON "QuizVersion"("status");

-- CreateIndex
CREATE INDEX "QuizVersion_createdAt_idx" ON "QuizVersion"("createdAt");

-- CreateIndex
CREATE INDEX "SecurityEvent_sessionId_idx" ON "SecurityEvent"("sessionId");

-- CreateIndex
CREATE INDEX "SecurityEvent_userId_idx" ON "SecurityEvent"("userId");

-- CreateIndex
CREATE INDEX "SecurityEvent_eventType_idx" ON "SecurityEvent"("eventType");

-- CreateIndex
CREATE INDEX "SecurityEvent_severity_idx" ON "SecurityEvent"("severity");

-- CreateIndex
CREATE INDEX "SecurityEvent_detectedAt_idx" ON "SecurityEvent"("detectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionIntegrity_sessionId_key" ON "SessionIntegrity"("sessionId");

-- CreateIndex
CREATE INDEX "SessionIntegrity_sessionId_idx" ON "SessionIntegrity"("sessionId");

-- CreateIndex
CREATE INDEX "SessionIntegrity_validationPassed_idx" ON "SessionIntegrity"("validationPassed");

-- CreateIndex
CREATE INDEX "PerformanceMetrics_userId_idx" ON "PerformanceMetrics"("userId");

-- CreateIndex
CREATE INDEX "PerformanceMetrics_kategoriId_idx" ON "PerformanceMetrics"("kategoriId");

-- CreateIndex
CREATE INDEX "PerformanceMetrics_periodDate_idx" ON "PerformanceMetrics"("periodDate");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceMetrics_userId_kategoriId_period_periodDate_key" ON "PerformanceMetrics"("userId", "kategoriId", "period", "periodDate");

-- CreateIndex
CREATE INDEX "LearningPattern_userId_idx" ON "LearningPattern"("userId");

-- CreateIndex
CREATE INDEX "LearningPattern_patternType_idx" ON "LearningPattern"("patternType");

-- CreateIndex
CREATE INDEX "LearningPattern_lastUpdated_idx" ON "LearningPattern"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "BildeLibrary_filnavn_key" ON "BildeLibrary"("filnavn");

-- CreateIndex
CREATE UNIQUE INDEX "BildeLibrary_url_key" ON "BildeLibrary"("url");

-- CreateIndex
CREATE INDEX "BildeLibrary_tags_idx" ON "BildeLibrary"("tags");

-- CreateIndex
CREATE INDEX "BildeLibrary_oppdatert_idx" ON "BildeLibrary"("oppdatert");

-- CreateIndex
CREATE INDEX "BildeLibrary_mimeType_idx" ON "BildeLibrary"("mimeType");

-- CreateIndex
CREATE INDEX "BildeLibrary_navn_idx" ON "BildeLibrary"("navn");

-- CreateIndex
CREATE INDEX "BildeLibrary_opprettet_idx" ON "BildeLibrary"("opprettet");

-- CreateIndex
CREATE INDEX "BildeLibrary_isDeleted_idx" ON "BildeLibrary"("isDeleted");

-- CreateIndex
CREATE INDEX "BildeLibrary_deletedAt_idx" ON "BildeLibrary"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Elev_epost_key" ON "Elev"("epost");

-- CreateIndex
CREATE UNIQUE INDEX "Elev_personnummer_key" ON "Elev"("personnummer");

-- CreateIndex
CREATE INDEX "Elev_bedriftId_idx" ON "Elev"("bedriftId");

-- CreateIndex
CREATE INDEX "Elev_epost_idx" ON "Elev"("epost");

-- CreateIndex
CREATE INDEX "Elev_personnummer_idx" ON "Elev"("personnummer");

-- CreateIndex
CREATE INDEX "Elev_bedriftId_status_idx" ON "Elev"("bedriftId", "status");

-- CreateIndex
CREATE INDEX "Elev_fornavn_etternavn_idx" ON "Elev"("fornavn", "etternavn");

-- CreateIndex
CREATE INDEX "Elev_klassekode_idx" ON "Elev"("klassekode");

-- CreateIndex
CREATE INDEX "Elev_opprettet_idx" ON "Elev"("opprettet");

-- CreateIndex
CREATE INDEX "Elev_sistInnlogget_idx" ON "Elev"("sistInnlogget");

-- CreateIndex
CREATE INDEX "Elev_isDeleted_idx" ON "Elev"("isDeleted");

-- CreateIndex
CREATE INDEX "Elev_deletedAt_idx" ON "Elev"("deletedAt");

-- CreateIndex
CREATE INDEX "ElevSoknad_bedriftId_idx" ON "ElevSoknad"("bedriftId");

-- CreateIndex
CREATE INDEX "ElevSoknad_status_idx" ON "ElevSoknad"("status");

-- CreateIndex
CREATE INDEX "ElevSoknad_personnummer_idx" ON "ElevSoknad"("personnummer");

-- CreateIndex
CREATE INDEX "ElevSoknad_epost_idx" ON "ElevSoknad"("epost");

-- CreateIndex
CREATE INDEX "ElevSoknad_isDeleted_idx" ON "ElevSoknad"("isDeleted");

-- CreateIndex
CREATE INDEX "ElevSoknad_deletedAt_idx" ON "ElevSoknad"("deletedAt");

-- CreateIndex
CREATE INDEX "ElevSoknad_bedriftId_status_idx" ON "ElevSoknad"("bedriftId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ElevSoknad_personnummer_bedriftId_key" ON "ElevSoknad"("personnummer", "bedriftId");

-- CreateIndex
CREATE INDEX "Kontrakt_bedriftId_idx" ON "Kontrakt"("bedriftId");

-- CreateIndex
CREATE INDEX "Kontrakt_elevId_idx" ON "Kontrakt"("elevId");

-- CreateIndex
CREATE INDEX "Kontrakt_status_idx" ON "Kontrakt"("status");

-- CreateIndex
CREATE INDEX "Kontrakt_bedriftId_status_idx" ON "Kontrakt"("bedriftId", "status");

-- CreateIndex
CREATE INDEX "Kontrakt_elevPersonnummer_idx" ON "Kontrakt"("elevPersonnummer");

-- CreateIndex
CREATE INDEX "Kontrakt_opprettet_idx" ON "Kontrakt"("opprettet");

-- CreateIndex
CREATE INDEX "Kontrakt_opprettetAv_idx" ON "Kontrakt"("opprettetAv");

-- CreateIndex
CREATE INDEX "Kontrakt_elevFornavn_elevEtternavn_idx" ON "Kontrakt"("elevFornavn", "elevEtternavn");

-- CreateIndex
CREATE INDEX "Kontrakt_oppdatert_idx" ON "Kontrakt"("oppdatert");

-- CreateIndex
CREATE INDEX "Kontrakt_isDeleted_idx" ON "Kontrakt"("isDeleted");

-- CreateIndex
CREATE INDEX "Kontrakt_deletedAt_idx" ON "Kontrakt"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_bedriftId_key" ON "SystemConfig"("bedriftId");

-- CreateIndex
CREATE INDEX "AuditLog_tableName_recordId_idx" ON "AuditLog"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_tableName_timestamp_idx" ON "AuditLog"("tableName", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_navn_key" ON "EmailTemplate"("navn");

-- CreateIndex
CREATE INDEX "EmailTemplate_kategori_idx" ON "EmailTemplate"("kategori");

-- CreateIndex
CREATE INDEX "EmailTemplate_aktiv_idx" ON "EmailTemplate"("aktiv");

-- CreateIndex
CREATE INDEX "EmailTemplate_systemMal_idx" ON "EmailTemplate"("systemMal");

-- CreateIndex
CREATE INDEX "EmailTemplate_isDeleted_idx" ON "EmailTemplate"("isDeleted");

-- CreateIndex
CREATE INDEX "EmailTemplate_deletedAt_idx" ON "EmailTemplate"("deletedAt");

-- CreateIndex
CREATE INDEX "EmailTemplate_kategori_aktiv_idx" ON "EmailTemplate"("kategori", "aktiv");

-- CreateIndex
CREATE INDEX "Notification_mottakerId_lest_idx" ON "Notification"("mottakerId", "lest");

-- CreateIndex
CREATE INDEX "Notification_opprettet_idx" ON "Notification"("opprettet");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_kategori_idx" ON "Notification"("kategori");

-- CreateIndex
CREATE INDEX "Notification_mottakerId_opprettet_idx" ON "Notification"("mottakerId", "opprettet");

-- CreateIndex
CREATE INDEX "Notification_mottakerId_type_idx" ON "Notification"("mottakerId", "type");

-- CreateIndex
CREATE INDEX "FileAttachment_opploadetAv_idx" ON "FileAttachment"("opploadetAv");

-- CreateIndex
CREATE INDEX "FileAttachment_kategori_relatertId_idx" ON "FileAttachment"("kategori", "relatertId");

-- CreateIndex
CREATE INDEX "FileAttachment_opprettet_idx" ON "FileAttachment"("opprettet");

-- CreateIndex
CREATE INDEX "FileAttachment_mimeType_idx" ON "FileAttachment"("mimeType");

-- CreateIndex
CREATE INDEX "FileAttachment_godkjent_idx" ON "FileAttachment"("godkjent");

-- CreateIndex
CREATE INDEX "FileAttachment_relatertTabell_relatertId_idx" ON "FileAttachment"("relatertTabell", "relatertId");

-- CreateIndex
CREATE INDEX "FileAttachment_isDeleted_idx" ON "FileAttachment"("isDeleted");

-- CreateIndex
CREATE INDEX "FileAttachment_deletedAt_idx" ON "FileAttachment"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_referanse_key" ON "PaymentTransaction"("referanse");

-- CreateIndex
CREATE INDEX "PaymentTransaction_kontraktId_idx" ON "PaymentTransaction"("kontraktId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE INDEX "PaymentTransaction_forfallsdato_idx" ON "PaymentTransaction"("forfallsdato");

-- CreateIndex
CREATE INDEX "PaymentTransaction_type_idx" ON "PaymentTransaction"("type");

-- CreateIndex
CREATE INDEX "PaymentTransaction_referanse_idx" ON "PaymentTransaction"("referanse");

-- CreateIndex
CREATE INDEX "PaymentTransaction_betalingsdato_idx" ON "PaymentTransaction"("betalingsdato");

-- CreateIndex
CREATE INDEX "PaymentTransaction_kontraktId_status_idx" ON "PaymentTransaction"("kontraktId", "status");

-- CreateIndex
CREATE INDEX "EmailLog_mottaker_idx" ON "EmailLog"("mottaker");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "EmailLog_opprettet_idx" ON "EmailLog"("opprettet");

-- CreateIndex
CREATE INDEX "EmailLog_templateId_idx" ON "EmailLog"("templateId");

-- CreateIndex
CREATE INDEX "EmailLog_sendt_idx" ON "EmailLog"("sendt");

-- CreateIndex
CREATE INDEX "EmailLog_sistForsokt_idx" ON "EmailLog"("sistForsokt");

-- CreateIndex
CREATE INDEX "EmailLog_mottaker_status_idx" ON "EmailLog"("mottaker", "status");

-- CreateIndex
CREATE INDEX "EmailLog_status_sistForsokt_idx" ON "EmailLog"("status", "sistForsokt");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationProvider_navn_key" ON "IntegrationProvider"("navn");

-- CreateIndex
CREATE INDEX "IntegrationProvider_type_idx" ON "IntegrationProvider"("type");

-- CreateIndex
CREATE INDEX "IntegrationProvider_aktiv_idx" ON "IntegrationProvider"("aktiv");

-- CreateIndex
CREATE INDEX "IntegrationProvider_type_aktiv_idx" ON "IntegrationProvider"("type", "aktiv");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_bedriftId_idx" ON "IntegrationConfiguration"("bedriftId");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_providerId_idx" ON "IntegrationConfiguration"("providerId");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_aktiv_idx" ON "IntegrationConfiguration"("aktiv");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_autoSync_idx" ON "IntegrationConfiguration"("autoSync");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_lastSync_idx" ON "IntegrationConfiguration"("lastSync");

-- CreateIndex
CREATE INDEX "IntegrationConfiguration_bedriftId_aktiv_idx" ON "IntegrationConfiguration"("bedriftId", "aktiv");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConfiguration_bedriftId_providerId_key" ON "IntegrationConfiguration"("bedriftId", "providerId");

-- CreateIndex
CREATE INDEX "IntegrationLog_bedriftId_idx" ON "IntegrationLog"("bedriftId");

-- CreateIndex
CREATE INDEX "IntegrationLog_providerId_idx" ON "IntegrationLog"("providerId");

-- CreateIndex
CREATE INDEX "IntegrationLog_status_idx" ON "IntegrationLog"("status");

-- CreateIndex
CREATE INDEX "IntegrationLog_opprettet_idx" ON "IntegrationLog"("opprettet");

-- CreateIndex
CREATE INDEX "IntegrationLog_operasjon_idx" ON "IntegrationLog"("operasjon");

-- CreateIndex
CREATE INDEX "IntegrationLog_bedriftId_status_idx" ON "IntegrationLog"("bedriftId", "status");

-- CreateIndex
CREATE INDEX "IntegrationLog_providerId_status_idx" ON "IntegrationLog"("providerId", "status");

-- CreateIndex
CREATE INDEX "IntegrationLog_relatertTabell_relatertId_idx" ON "IntegrationLog"("relatertTabell", "relatertId");

-- CreateIndex
CREATE INDEX "IntegrationLog_eksternReferanse_idx" ON "IntegrationLog"("eksternReferanse");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_status_idx" ON "IntegrationSyncJob"("status");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_planlagtTid_idx" ON "IntegrationSyncJob"("planlagtTid");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_prioritet_idx" ON "IntegrationSyncJob"("prioritet");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_konfigurasjonsId_idx" ON "IntegrationSyncJob"("konfigurasjonsId");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_type_idx" ON "IntegrationSyncJob"("type");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_status_planlagtTid_idx" ON "IntegrationSyncJob"("status", "planlagtTid");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_konfigurasjonsId_status_idx" ON "IntegrationSyncJob"("konfigurasjonsId", "status");

-- CreateIndex
CREATE INDEX "IntegrationSyncJob_nesteForsoket_idx" ON "IntegrationSyncJob"("nesteForsoket");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_domain_key" ON "Tenant"("domain");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_domain_idx" ON "Tenant"("domain");

-- CreateIndex
CREATE INDEX "Tenant_aktiv_idx" ON "Tenant"("aktiv");

-- CreateIndex
CREATE INDEX "Tenant_isDeleted_idx" ON "Tenant"("isDeleted");

-- CreateIndex
CREATE INDEX "Tenant_deletedAt_idx" ON "Tenant"("deletedAt");

-- CreateIndex
CREATE INDEX "UserTenant_userId_idx" ON "UserTenant"("userId");

-- CreateIndex
CREATE INDEX "UserTenant_tenantId_idx" ON "UserTenant"("tenantId");

-- CreateIndex
CREATE INDEX "UserTenant_rolle_idx" ON "UserTenant"("rolle");

-- CreateIndex
CREATE INDEX "UserTenant_aktiv_idx" ON "UserTenant"("aktiv");

-- CreateIndex
CREATE UNIQUE INDEX "UserTenant_userId_tenantId_key" ON "UserTenant"("userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollKlasse_navn_key" ON "SikkerhetskontrollKlasse"("navn");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKlasse_aktiv_idx" ON "SikkerhetskontrollKlasse"("aktiv");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKlasse_rekkefolge_idx" ON "SikkerhetskontrollKlasse"("rekkefolge");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKategori_klasseId_aktiv_idx" ON "SikkerhetskontrollKategori"("klasseId", "aktiv");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollKategori_rekkefolge_idx" ON "SikkerhetskontrollKategori"("rekkefolge");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollKategori_navn_klasseId_key" ON "SikkerhetskontrollKategori"("navn", "klasseId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollSporsmal_kategoriId_aktiv_idx" ON "SikkerhetskontrollSporsmal"("kategoriId", "aktiv");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollSporsmal_vanskelighetsgrad_idx" ON "SikkerhetskontrollSporsmal"("vanskelighetsgrad");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollSporsmal_rekkefolge_idx" ON "SikkerhetskontrollSporsmal"("rekkefolge");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollMedia_sporsmalId_idx" ON "SikkerhetskontrollMedia"("sporsmalId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollMedia_mediaType_idx" ON "SikkerhetskontrollMedia"("mediaType");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollMedia_rekkefolge_idx" ON "SikkerhetskontrollMedia"("rekkefolge");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_elevId_klasseId_idx" ON "SikkerhetskontrollElevProgresjon"("elevId", "klasseId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_elevId_kategoriId_idx" ON "SikkerhetskontrollElevProgresjon"("elevId", "kategoriId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_elevId_sporsmalId_idx" ON "SikkerhetskontrollElevProgresjon"("elevId", "sporsmalId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_status_idx" ON "SikkerhetskontrollElevProgresjon"("status");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_mestret_idx" ON "SikkerhetskontrollElevProgresjon"("mestret");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_sisteInteraksjonDato_idx" ON "SikkerhetskontrollElevProgresjon"("sisteInteraksjonDato");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevProgresjon_sisteAktivitet_idx" ON "SikkerhetskontrollElevProgresjon"("sisteAktivitet");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollElevProgresjon_elevId_sporsmalId_key" ON "SikkerhetskontrollElevProgresjon"("elevId", "sporsmalId");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollElevProgresjon_elevId_kategoriId_key" ON "SikkerhetskontrollElevProgresjon"("elevId", "kategoriId");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollAchievement_navn_key" ON "SikkerhetskontrollAchievement"("navn");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollAchievement_type_idx" ON "SikkerhetskontrollAchievement"("type");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollAchievement_aktiv_idx" ON "SikkerhetskontrollAchievement"("aktiv");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevAchievement_elevId_idx" ON "SikkerhetskontrollElevAchievement"("elevId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollElevAchievement_oppnaddDato_idx" ON "SikkerhetskontrollElevAchievement"("oppnaddDato");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollElevAchievement_elevId_achievementId_key" ON "SikkerhetskontrollElevAchievement"("elevId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "SikkerhetskontrollBil_elevId_key" ON "SikkerhetskontrollBil"("elevId");

-- CreateIndex
CREATE INDEX "SikkerhetskontrollBil_totalProgresjon_idx" ON "SikkerhetskontrollBil"("totalProgresjon");

-- CreateIndex
CREATE UNIQUE INDEX "SjekkpunktSystemer_navn_key" ON "SjekkpunktSystemer"("navn");

-- CreateIndex
CREATE INDEX "SjekkpunktSystemer_aktiv_idx" ON "SjekkpunktSystemer"("aktiv");

-- CreateIndex
CREATE INDEX "SjekkpunktSystemer_rekkefolge_idx" ON "SjekkpunktSystemer"("rekkefolge");

-- CreateIndex
CREATE UNIQUE INDEX "ForerkortKlasser_kode_key" ON "ForerkortKlasser"("kode");

-- CreateIndex
CREATE INDEX "ForerkortKlasser_aktiv_idx" ON "ForerkortKlasser"("aktiv");

-- CreateIndex
CREATE INDEX "ForerkortKlasser_kategori_idx" ON "ForerkortKlasser"("kategori");

-- CreateIndex
CREATE UNIQUE INDEX "SeedDataConfig_type_key" ON "SeedDataConfig"("type");

-- CreateIndex
CREATE INDEX "SeedDataConfig_type_idx" ON "SeedDataConfig"("type");

-- CreateIndex
CREATE INDEX "Nyhet_bedriftId_idx" ON "Nyhet"("bedriftId");

-- CreateIndex
CREATE INDEX "Nyhet_kategori_idx" ON "Nyhet"("kategori");

-- CreateIndex
CREATE INDEX "Nyhet_publisert_idx" ON "Nyhet"("publisert");

-- CreateIndex
CREATE INDEX "Nyhet_opprettet_idx" ON "Nyhet"("opprettet");

-- CreateIndex
CREATE INDEX "Nyhet_isDeleted_idx" ON "Nyhet"("isDeleted");

-- CreateIndex
CREATE INDEX "KalenderEvent_bedriftId_idx" ON "KalenderEvent"("bedriftId");

-- CreateIndex
CREATE INDEX "KalenderEvent_startDato_idx" ON "KalenderEvent"("startDato");

-- CreateIndex
CREATE INDEX "KalenderEvent_instruktorId_idx" ON "KalenderEvent"("instruktorId");

-- CreateIndex
CREATE INDEX "KalenderEvent_elevId_idx" ON "KalenderEvent"("elevId");

-- CreateIndex
CREATE INDEX "KalenderEvent_type_idx" ON "KalenderEvent"("type");

-- CreateIndex
CREATE INDEX "KalenderEvent_status_idx" ON "KalenderEvent"("status");

-- CreateIndex
CREATE INDEX "KalenderEvent_isDeleted_idx" ON "KalenderEvent"("isDeleted");

-- CreateIndex
CREATE INDEX "Oppgave_bedriftId_idx" ON "Oppgave"("bedriftId");

-- CreateIndex
CREATE INDEX "Oppgave_tildeltTil_idx" ON "Oppgave"("tildeltTil");

-- CreateIndex
CREATE INDEX "Oppgave_opprettetAv_idx" ON "Oppgave"("opprettetAv");

-- CreateIndex
CREATE INDEX "Oppgave_status_idx" ON "Oppgave"("status");

-- CreateIndex
CREATE INDEX "Oppgave_prioritet_idx" ON "Oppgave"("prioritet");

-- CreateIndex
CREATE INDEX "Oppgave_forfallsdato_idx" ON "Oppgave"("forfallsdato");

-- CreateIndex
CREATE INDEX "Oppgave_isDeleted_idx" ON "Oppgave"("isDeleted");

-- CreateIndex
CREATE INDEX "Prosjekt_bedriftId_idx" ON "Prosjekt"("bedriftId");

-- CreateIndex
CREATE INDEX "Prosjekt_prosjektleder_idx" ON "Prosjekt"("prosjektleder");

-- CreateIndex
CREATE INDEX "Prosjekt_status_idx" ON "Prosjekt"("status");

-- CreateIndex
CREATE INDEX "Prosjekt_prioritet_idx" ON "Prosjekt"("prioritet");

-- CreateIndex
CREATE INDEX "Prosjekt_startdato_idx" ON "Prosjekt"("startdato");

-- CreateIndex
CREATE INDEX "Prosjekt_isDeleted_idx" ON "Prosjekt"("isDeleted");

-- CreateIndex
CREATE INDEX "Ressurs_bedriftId_idx" ON "Ressurs"("bedriftId");

-- CreateIndex
CREATE INDEX "Ressurs_type_idx" ON "Ressurs"("type");

-- CreateIndex
CREATE INDEX "Ressurs_status_idx" ON "Ressurs"("status");

-- CreateIndex
CREATE INDEX "Ressurs_ansvarlig_idx" ON "Ressurs"("ansvarlig");

-- CreateIndex
CREATE INDEX "Ressurs_isDeleted_idx" ON "Ressurs"("isDeleted");

-- CreateIndex
CREATE INDEX "RessursBooking_ressursId_idx" ON "RessursBooking"("ressursId");

-- CreateIndex
CREATE INDEX "RessursBooking_bedriftId_idx" ON "RessursBooking"("bedriftId");

-- CreateIndex
CREATE INDEX "RessursBooking_booketAv_idx" ON "RessursBooking"("booketAv");

-- CreateIndex
CREATE INDEX "RessursBooking_startTid_idx" ON "RessursBooking"("startTid");

-- CreateIndex
CREATE INDEX "RessursBooking_status_idx" ON "RessursBooking"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HjelpKategori_navn_key" ON "HjelpKategori"("navn");

-- CreateIndex
CREATE INDEX "HjelpKategori_aktiv_idx" ON "HjelpKategori"("aktiv");

-- CreateIndex
CREATE INDEX "HjelpKategori_rekkefolge_idx" ON "HjelpKategori"("rekkefolge");

-- CreateIndex
CREATE INDEX "HjelpArtikkel_kategori_idx" ON "HjelpArtikkel"("kategori");

-- CreateIndex
CREATE INDEX "HjelpArtikkel_publisert_idx" ON "HjelpArtikkel"("publisert");

-- CreateIndex
CREATE INDEX "HjelpArtikkel_opprettetAv_idx" ON "HjelpArtikkel"("opprettetAv");

-- CreateIndex
CREATE INDEX "HjelpArtikkel_isDeleted_idx" ON "HjelpArtikkel"("isDeleted");

-- CreateIndex
CREATE INDEX "Okonomipost_bedriftId_idx" ON "Okonomipost"("bedriftId");

-- CreateIndex
CREATE INDEX "Okonomipost_type_idx" ON "Okonomipost"("type");

-- CreateIndex
CREATE INDEX "Okonomipost_kategori_idx" ON "Okonomipost"("kategori");

-- CreateIndex
CREATE INDEX "Okonomipost_dato_idx" ON "Okonomipost"("dato");

-- CreateIndex
CREATE INDEX "Okonomipost_status_idx" ON "Okonomipost"("status");

-- CreateIndex
CREATE INDEX "Okonomipost_registrertAv_idx" ON "Okonomipost"("registrertAv");

-- CreateIndex
CREATE INDEX "Okonomipost_isDeleted_idx" ON "Okonomipost"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Service_navn_key" ON "Service"("navn");

-- CreateIndex
CREATE INDEX "Service_type_idx" ON "Service"("type");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE INDEX "Service_navn_idx" ON "Service"("navn");

-- CreateIndex
CREATE INDEX "BedriftService_bedriftId_idx" ON "BedriftService"("bedriftId");

-- CreateIndex
CREATE INDEX "BedriftService_serviceId_idx" ON "BedriftService"("serviceId");

-- CreateIndex
CREATE INDEX "BedriftService_isActive_idx" ON "BedriftService"("isActive");

-- CreateIndex
CREATE INDEX "BedriftService_activatedAt_idx" ON "BedriftService"("activatedAt");

-- CreateIndex
CREATE INDEX "BedriftService_bedriftId_isActive_idx" ON "BedriftService"("bedriftId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BedriftService_bedriftId_serviceId_key" ON "BedriftService"("bedriftId", "serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTwoFactor_userId_key" ON "UserTwoFactor"("userId");

-- CreateIndex
CREATE INDEX "UserTwoFactor_isActive_idx" ON "UserTwoFactor"("isActive");

-- CreateIndex
CREATE INDEX "TwoFactorAttempt_userId_idx" ON "TwoFactorAttempt"("userId");

-- CreateIndex
CREATE INDEX "TwoFactorAttempt_attemptedAt_idx" ON "TwoFactorAttempt"("attemptedAt");

-- CreateIndex
CREATE INDEX "TwoFactorAttempt_success_idx" ON "TwoFactorAttempt"("success");

-- CreateIndex
CREATE INDEX "UserKnowledgeState_userId_idx" ON "UserKnowledgeState"("userId");

-- CreateIndex
CREATE INDEX "UserKnowledgeState_topicId_idx" ON "UserKnowledgeState"("topicId");

-- CreateIndex
CREATE INDEX "UserKnowledgeState_masteryLevel_idx" ON "UserKnowledgeState"("masteryLevel");

-- CreateIndex
CREATE UNIQUE INDEX "UserKnowledgeState_userId_topicId_key" ON "UserKnowledgeState"("userId", "topicId");

-- CreateIndex
CREATE INDEX "LearningEvent_userId_idx" ON "LearningEvent"("userId");

-- CreateIndex
CREATE INDEX "LearningEvent_eventType_idx" ON "LearningEvent"("eventType");

-- CreateIndex
CREATE INDEX "LearningEvent_timestamp_idx" ON "LearningEvent"("timestamp");

-- CreateIndex
CREATE INDEX "LearningEvent_sessionId_idx" ON "LearningEvent"("sessionId");

-- CreateIndex
CREATE INDEX "LearningPathway_userId_idx" ON "LearningPathway"("userId");

-- CreateIndex
CREATE INDEX "LearningPathway_goalId_idx" ON "LearningPathway"("goalId");

-- CreateIndex
CREATE INDEX "MLModel_name_version_idx" ON "MLModel"("name", "version");

-- CreateIndex
CREATE INDEX "MLModel_isActive_idx" ON "MLModel"("isActive");

-- CreateIndex
CREATE INDEX "UserRiskAssessment_userId_idx" ON "UserRiskAssessment"("userId");

-- CreateIndex
CREATE INDEX "UserRiskAssessment_assessmentDate_idx" ON "UserRiskAssessment"("assessmentDate");

-- CreateIndex
CREATE INDEX "UserRiskAssessment_dropoutProbability_idx" ON "UserRiskAssessment"("dropoutProbability");

-- CreateIndex
CREATE INDEX "Intervention_userId_idx" ON "Intervention"("userId");

-- CreateIndex
CREATE INDEX "Intervention_status_idx" ON "Intervention"("status");

-- CreateIndex
CREATE INDEX "Intervention_priority_idx" ON "Intervention"("priority");

-- CreateIndex
CREATE INDEX "Intervention_createdAt_idx" ON "Intervention"("createdAt");

-- CreateIndex
CREATE INDEX "GeografiskEnhet_type_navn_idx" ON "GeografiskEnhet"("type", "navn");

-- CreateIndex
CREATE UNIQUE INDEX "GeografiskEnhet_type_kode_key" ON "GeografiskEnhet"("type", "kode");

-- CreateIndex
CREATE INDEX "AnnonsorSponsor_bedriftId_idx" ON "AnnonsorSponsor"("bedriftId");

-- CreateIndex
CREATE INDEX "AnnonsorSponsor_aktiv_status_idx" ON "AnnonsorSponsor"("aktiv", "status");

-- CreateIndex
CREATE INDEX "AnnonsorSponsor_startDato_sluttDato_idx" ON "AnnonsorSponsor"("startDato", "sluttDato");

-- CreateIndex
CREATE INDEX "AnnonsorSponsor_isDeleted_idx" ON "AnnonsorSponsor"("isDeleted");

-- CreateIndex
CREATE INDEX "Annonse_annonsorId_idx" ON "Annonse"("annonsorId");

-- CreateIndex
CREATE INDEX "Annonse_aktiv_startDato_sluttDato_idx" ON "Annonse"("aktiv", "startDato", "sluttDato");

-- CreateIndex
CREATE INDEX "Annonse_prioritet_idx" ON "Annonse"("prioritet");

-- CreateIndex
CREATE INDEX "Annonse_isDeleted_idx" ON "Annonse"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "AnnonseTargeting_annonseId_geografiskId_spesifikkeSkoleId_key" ON "AnnonseTargeting"("annonseId", "geografiskId", "spesifikkeSkoleId");

-- CreateIndex
CREATE INDEX "AnnonseStatistikk_annonseId_idx" ON "AnnonseStatistikk"("annonseId");

-- CreateIndex
CREATE INDEX "AnnonseStatistikk_dato_idx" ON "AnnonseStatistikk"("dato");

-- CreateIndex
CREATE UNIQUE INDEX "AnnonseStatistikk_annonseId_dato_key" ON "AnnonseStatistikk"("annonseId", "dato");

-- CreateIndex
CREATE INDEX "AnnonseInteraksjon_annonseId_idx" ON "AnnonseInteraksjon"("annonseId");

-- CreateIndex
CREATE INDEX "AnnonseInteraksjon_elevId_idx" ON "AnnonseInteraksjon"("elevId");

-- CreateIndex
CREATE INDEX "AnnonseInteraksjon_tidspunkt_idx" ON "AnnonseInteraksjon"("tidspunkt");

-- CreateIndex
CREATE INDEX "AnnonseInteraksjon_interaksjonsType_idx" ON "AnnonseInteraksjon"("interaksjonsType");

-- CreateIndex
CREATE UNIQUE INDEX "PageDefinition_pageKey_key" ON "PageDefinition"("pageKey");

-- CreateIndex
CREATE INDEX "PageDefinition_pageKey_idx" ON "PageDefinition"("pageKey");

-- CreateIndex
CREATE INDEX "PageDefinition_category_idx" ON "PageDefinition"("category");

-- CreateIndex
CREATE INDEX "PageDefinition_isActive_idx" ON "PageDefinition"("isActive");

-- CreateIndex
CREATE INDEX "BedriftPageAccess_bedriftId_idx" ON "BedriftPageAccess"("bedriftId");

-- CreateIndex
CREATE INDEX "BedriftPageAccess_pageKey_idx" ON "BedriftPageAccess"("pageKey");

-- CreateIndex
CREATE INDEX "BedriftPageAccess_isEnabled_idx" ON "BedriftPageAccess"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "BedriftPageAccess_bedriftId_pageKey_key" ON "BedriftPageAccess"("bedriftId", "pageKey");

-- CreateIndex
CREATE INDEX "PageAccessHistory_bedriftId_idx" ON "PageAccessHistory"("bedriftId");

-- CreateIndex
CREATE INDEX "PageAccessHistory_pageKey_idx" ON "PageAccessHistory"("pageKey");

-- CreateIndex
CREATE INDEX "PageAccessHistory_performedAt_idx" ON "PageAccessHistory"("performedAt");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BedriftSubscription_bedriftId_key" ON "BedriftSubscription"("bedriftId");

-- CreateIndex
CREATE INDEX "BedriftSubscription_status_idx" ON "BedriftSubscription"("status");

-- CreateIndex
CREATE INDEX "BedriftSubscription_endDate_idx" ON "BedriftSubscription"("endDate");

-- CreateIndex
CREATE INDEX "SubscriptionFeature_planId_idx" ON "SubscriptionFeature"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionFeature_planId_featureKey_key" ON "SubscriptionFeature"("planId", "featureKey");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_bedriftId_idx" ON "SubscriptionHistory"("bedriftId");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_action_idx" ON "SubscriptionHistory"("action");

-- CreateIndex
CREATE INDEX "SubscriptionHistory_performedAt_idx" ON "SubscriptionHistory"("performedAt");
