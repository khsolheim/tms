-- CreateTable: Adaptive Learning Engine tables
-- User knowledge state tracking
CREATE TABLE "UserKnowledgeState" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,
    "masteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserKnowledgeState_pkey" PRIMARY KEY ("id")
);

-- Learning analytics events
CREATE TABLE "LearningEvent" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "contentId" TEXT,
    "performanceData" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,
    "difficulty" DOUBLE PRECISION,
    "timeSpent" INTEGER, -- in seconds
    "result" BOOLEAN,

    CONSTRAINT "LearningEvent_pkey" PRIMARY KEY ("id")
);

-- Learning pathways (for personalized learning paths)
CREATE TABLE "LearningPathway" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "goalId" TEXT,
    "moduleSequence" JSONB NOT NULL,
    "currentPosition" INTEGER NOT NULL DEFAULT 0,
    "adaptationRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPathway_pkey" PRIMARY KEY ("id")
);

-- ML Models metadata
CREATE TABLE "MLModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "accuracyMetrics" JSONB,
    "trainingDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "parameters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MLModel_pkey" PRIMARY KEY ("id")
);

-- User risk assessments
CREATE TABLE "UserRiskAssessment" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dropoutProbability" DOUBLE PRECISION NOT NULL,
    "performanceTrend" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "riskFactors" JSONB,
    "interventionsRecommended" JSONB,
    "modelVersion" TEXT NOT NULL,

    CONSTRAINT "UserRiskAssessment_pkey" PRIMARY KEY ("id")
);

-- Intervention tracking
CREATE TABLE "Intervention" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "interventionType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),
    "executedBy" INTEGER,
    "effectivenessScore" DOUBLE PRECISION,

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Performance optimization indexes
CREATE INDEX "UserKnowledgeState_userId_idx" ON "UserKnowledgeState"("userId");
CREATE INDEX "UserKnowledgeState_topicId_idx" ON "UserKnowledgeState"("topicId");
CREATE INDEX "UserKnowledgeState_masteryLevel_idx" ON "UserKnowledgeState"("masteryLevel");
CREATE UNIQUE INDEX "UserKnowledgeState_userId_topicId_key" ON "UserKnowledgeState"("userId", "topicId");

CREATE INDEX "LearningEvent_userId_idx" ON "LearningEvent"("userId");
CREATE INDEX "LearningEvent_eventType_idx" ON "LearningEvent"("eventType");
CREATE INDEX "LearningEvent_timestamp_idx" ON "LearningEvent"("timestamp" DESC);
CREATE INDEX "LearningEvent_sessionId_idx" ON "LearningEvent"("sessionId");

CREATE INDEX "LearningPathway_userId_idx" ON "LearningPathway"("userId");
CREATE INDEX "LearningPathway_goalId_idx" ON "LearningPathway"("goalId");

CREATE INDEX "MLModel_name_version_idx" ON "MLModel"("name", "version");
CREATE INDEX "MLModel_isActive_idx" ON "MLModel"("isActive");

CREATE INDEX "UserRiskAssessment_userId_idx" ON "UserRiskAssessment"("userId");
CREATE INDEX "UserRiskAssessment_assessmentDate_idx" ON "UserRiskAssessment"("assessmentDate" DESC);
CREATE INDEX "UserRiskAssessment_dropoutProbability_idx" ON "UserRiskAssessment"("dropoutProbability");

CREATE INDEX "Intervention_userId_idx" ON "Intervention"("userId");
CREATE INDEX "Intervention_status_idx" ON "Intervention"("status");
CREATE INDEX "Intervention_priority_idx" ON "Intervention"("priority");
CREATE INDEX "Intervention_createdAt_idx" ON "Intervention"("createdAt" DESC);

-- AddForeignKey: Foreign key constraints
ALTER TABLE "UserKnowledgeState" ADD CONSTRAINT "UserKnowledgeState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LearningPathway" ADD CONSTRAINT "LearningPathway_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserRiskAssessment" ADD CONSTRAINT "UserRiskAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_executedBy_fkey" FOREIGN KEY ("executedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;