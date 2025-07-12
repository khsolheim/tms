-- CreateTable: Two-Factor Authentication
CREATE TABLE "UserTwoFactor" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT[],
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "phoneNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTwoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTwoFactor_userId_key" ON "UserTwoFactor"("userId");

-- CreateIndex
CREATE INDEX "UserTwoFactor_isActive_idx" ON "UserTwoFactor"("isActive");

-- AddForeignKey
ALTER TABLE "UserTwoFactor" ADD CONSTRAINT "UserTwoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Two-Factor Authentication Attempts (for security monitoring)
CREATE TABLE "TwoFactorAttempt" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "attemptType" TEXT NOT NULL, -- 'totp', 'sms', 'backup'
    "success" BOOLEAN NOT NULL,
    "ipAddress" INET,
    "userAgent" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TwoFactorAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TwoFactorAttempt_userId_idx" ON "TwoFactorAttempt"("userId");
CREATE INDEX "TwoFactorAttempt_attemptedAt_idx" ON "TwoFactorAttempt"("attemptedAt");
CREATE INDEX "TwoFactorAttempt_success_idx" ON "TwoFactorAttempt"("success");

-- AddForeignKey
ALTER TABLE "TwoFactorAttempt" ADD CONSTRAINT "TwoFactorAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;