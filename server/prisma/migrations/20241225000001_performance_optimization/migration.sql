-- CreateIndex: Performance optimization for commonly queried fields
-- User table optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email_active 
ON "User" (epost) WHERE "isDeleted" = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_role_tenant 
ON "User" (rolle, "skoleId") WHERE "isDeleted" = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_global_role 
ON "User" ("globalRole") WHERE "isDeleted" = false;

-- User progress tracking optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_composite 
ON "SikkerhetskontrollElevProgresjon" ("elevId", "sporsmalId", "opprettet" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_status 
ON "SikkerhetskontrollElevProgresjon" ("elevId", "status", "opprettet" DESC);

-- Quiz and learning optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_results_analysis 
ON "SikkerhetskontrollElevProgresjon" ("elevId", "riktigSvar", "opprettet" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_sporsmal_kategori 
ON "SikkerhetskontrollSporsmal" ("kategoriId", "vanskelighetsgrad");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_sporsmal_active 
ON "SikkerhetskontrollSporsmal" ("kategoriId") WHERE "aktiv" = true;

-- Bedrift and company optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bedrift_active 
ON "Bedrift" ("orgnummer") WHERE "isDeleted" = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ansatt_bedrift_rolle 
ON "Ansatt" ("bedriftId", "rolle") WHERE "isDeleted" = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ansatt_status 
ON "Ansatt" ("status", "opprettet" DESC) WHERE "isDeleted" = false;

-- Sikkerhetskontroll optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sikkerhetskontroll_bedrift_status 
ON "Sikkerhetskontroll" ("bedriftId", "status", "opprettet" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sikkerhetskontroll_punkt_kontroll 
ON "SikkerhetskontrollPunkt" ("sikkerhetskontrollId", "sjekkpunktId");

-- Notification and communication optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_user_unread 
ON "Notification" ("userId", "read") WHERE "read" = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notification_type_created 
ON "Notification" ("type", "createdAt" DESC);

-- Audit log optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_user_action 
ON "AuditLog" ("userId", "action", "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_resource 
ON "AuditLog" ("resourceType", "resourceId", "createdAt" DESC);

-- File and media optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_file_attachment_resource 
ON "FileAttachment" ("resourceType", "resourceId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sikkerhetskontroll_media_sporsmal 
ON "SikkerhetskontrollMedia" ("sporsmalId", "type");

-- Integration and external systems
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integration_log_provider_status 
ON "IntegrationLog" ("providerId", "status", "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integration_sync_job_status 
ON "IntegrationSyncJob" ("status", "scheduledAt");

-- Kalender and scheduling optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_kalender_event_user_date 
ON "KalenderEvent" ("userId", "startDato", "sluttDato");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_oppgave_user_status 
ON "Oppgave" ("assignedToId", "status", "frist");

-- Economic and transaction optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_transaction_status_date 
ON "PaymentTransaction" ("status", "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_okonomipost_bedrift_type 
ON "Okonomipost" ("bedriftId", "type", "dato" DESC);

-- Multi-tenant optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_tenant_user_role 
ON "UserTenant" ("userId", "rolle");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_tenant_tenant_active 
ON "UserTenant" ("tenantId") WHERE "isActive" = true;

-- Partitioning preparation for large tables (commented out, implement when needed)
-- CREATE TABLE "SikkerhetskontrollElevProgresjon_2024" PARTITION OF "SikkerhetskontrollElevProgresjon" 
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- CREATE TABLE "AuditLog_2024" PARTITION OF "AuditLog" 
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Full-text search optimization (if using PostgreSQL full-text search)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bedrift_navn_fts 
ON "Bedrift" USING GIN (to_tsvector('norwegian', navn)) WHERE "isDeleted" = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ansatt_navn_fts 
ON "Ansatt" USING GIN (to_tsvector('norwegian', navn)) WHERE "isDeleted" = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_sporsmal_fts 
ON "SikkerhetskontrollSporsmal" USING GIN (to_tsvector('norwegian', sporsmal || ' ' || COALESCE(forklaring, '')));

-- Statistics for query planner
ANALYZE "User";
ANALYZE "SikkerhetskontrollElevProgresjon";
ANALYZE "SikkerhetskontrollSporsmal";
ANALYZE "Bedrift";
ANALYZE "Ansatt";
ANALYZE "Sikkerhetskontroll";