import { PrismaClient } from '@prisma/client';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as CryptoJS from 'crypto-js';
import { Twilio } from 'twilio';

export interface TwoFactorService {
  generateSecret(userId: number): Promise<{secret: string, qrCode: string}>;
  verifyToken(userId: number, token: string): Promise<boolean>;
  generateBackupCodes(userId: number): Promise<string[]>;
  enableSMS(userId: number, phoneNumber: string): Promise<void>;
  sendSMSCode(userId: number): Promise<boolean>;
  verifySMSCode(userId: number, code: string): Promise<boolean>;
  verifyBackupCode(userId: number, code: string): Promise<boolean>;
  disable2FA(userId: number): Promise<void>;
  getStatus(userId: number): Promise<TwoFactorStatus>;
}

export interface TwoFactorStatus {
  isEnabled: boolean;
  totpEnabled: boolean;
  smsEnabled: boolean;
  backupCodesRemaining: number;
  lastUsed?: Date;
}

class TwoFactorServiceImpl implements TwoFactorService {
  private twilioClient?: Twilio;
  private encryptionKey: string;

  constructor(private prisma: PrismaClient) {
    this.encryptionKey = process.env.TWO_FACTOR_ENCRYPTION_KEY || 'default-key-change-in-production';
    
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async generateSecret(userId: number): Promise<{secret: string, qrCode: string}> {
    try {
      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { epost: true, navn: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: user.epost,
        issuer: 'TMS - Treningssystem',
        length: 32
      });

      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url!);

      // Store encrypted secret in database (but don't activate yet)
      await this.prisma.userTwoFactor.upsert({
        where: { userId },
        update: {
          secret: this.encrypt(secret.base32!),
          updatedAt: new Date()
        },
        create: {
          userId,
          secret: this.encrypt(secret.base32!),
          isActive: false
        }
      });

      return {
        secret: secret.base32!,
        qrCode: qrCodeDataURL
      };
    } catch (error) {
      console.error('Error generating 2FA secret:', error);
      throw new Error('Failed to generate 2FA secret');
    }
  }

  async verifyToken(userId: number, token: string): Promise<boolean> {
    try {
      const twoFactor = await this.prisma.userTwoFactor.findUnique({
        where: { userId }
      });

      if (!twoFactor) {
        return false;
      }

      const secret = this.decrypt(twoFactor.secret);
      
      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps (60 seconds) of tolerance
      });

      // Log attempt
      await this.logAttempt(userId, 'totp', verified);

      // If verification successful and 2FA not yet active, activate it
      if (verified && !twoFactor.isActive) {
        await this.prisma.userTwoFactor.update({
          where: { userId },
          data: { isActive: true }
        });
      }

      return verified;
    } catch (error) {
      console.error('Error verifying TOTP token:', error);
      await this.logAttempt(userId, 'totp', false);
      return false;
    }
  }

  async generateBackupCodes(userId: number): Promise<string[]> {
    try {
      const codes: string[] = [];
      
      // Generate 10 backup codes
      for (let i = 0; i < 10; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
      }

      // Encrypt and store backup codes
      const encryptedCodes = codes.map(code => this.encrypt(code));
      
      await this.prisma.userTwoFactor.update({
        where: { userId },
        data: { backupCodes: encryptedCodes }
      });

      return codes;
    } catch (error) {
      console.error('Error generating backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  async verifyBackupCode(userId: number, code: string): Promise<boolean> {
    try {
      const twoFactor = await this.prisma.userTwoFactor.findUnique({
        where: { userId }
      });

      if (!twoFactor || !twoFactor.backupCodes.length) {
        await this.logAttempt(userId, 'backup', false);
        return false;
      }

      // Check if code matches any backup code
      const codeIndex = twoFactor.backupCodes.findIndex((encryptedCode: string) => {
        try {
          return this.decrypt(encryptedCode) === code.toUpperCase();
        } catch {
          return false;
        }
      });

      if (codeIndex === -1) {
        await this.logAttempt(userId, 'backup', false);
        return false;
      }

      // Remove used backup code
      const updatedCodes = [...twoFactor.backupCodes];
      updatedCodes.splice(codeIndex, 1);

      await this.prisma.userTwoFactor.update({
        where: { userId },
        data: { backupCodes: updatedCodes }
      });

      await this.logAttempt(userId, 'backup', true);
      return true;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      await this.logAttempt(userId, 'backup', false);
      return false;
    }
  }

  async enableSMS(userId: number, phoneNumber: string): Promise<void> {
    try {
      if (!this.twilioClient) {
        throw new Error('SMS service not configured');
      }

      // Validate phone number format
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (cleanPhone.length < 8) {
        throw new Error('Invalid phone number');
      }

      await this.prisma.userTwoFactor.update({
        where: { userId },
        data: {
          smsEnabled: true,
          phoneNumber: `+${cleanPhone}`
        }
      });
    } catch (error) {
      console.error('Error enabling SMS 2FA:', error);
      throw new Error('Failed to enable SMS 2FA');
    }
  }

  async sendSMSCode(userId: number): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        return false;
      }

      const twoFactor = await this.prisma.userTwoFactor.findUnique({
        where: { userId }
      });

      if (!twoFactor || !twoFactor.smsEnabled || !twoFactor.phoneNumber) {
        return false;
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store code temporarily (5 minutes expiry)
      await this.storeSMSCode(userId, code);

      // Send SMS
      await this.twilioClient.messages.create({
        body: `TMS verification code: ${code}. This code expires in 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: twoFactor.phoneNumber
      });

      return true;
    } catch (error) {
      console.error('Error sending SMS code:', error);
      return false;
    }
  }

  async verifySMSCode(userId: number, code: string): Promise<boolean> {
    try {
      const storedCode = await this.getSMSCode(userId);
      const verified = storedCode === code;

      await this.logAttempt(userId, 'sms', verified);

      if (verified) {
        await this.clearSMSCode(userId);
      }

      return verified;
    } catch (error) {
      console.error('Error verifying SMS code:', error);
      await this.logAttempt(userId, 'sms', false);
      return false;
    }
  }

  async disable2FA(userId: number): Promise<void> {
    try {
      await this.prisma.userTwoFactor.delete({
        where: { userId }
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw new Error('Failed to disable 2FA');
    }
  }

  async getStatus(userId: number): Promise<TwoFactorStatus> {
    try {
      const twoFactor = await this.prisma.userTwoFactor.findUnique({
        where: { userId }
      });

      if (!twoFactor) {
        return {
          isEnabled: false,
          totpEnabled: false,
          smsEnabled: false,
          backupCodesRemaining: 0
        };
      }

      const lastAttempt = await this.prisma.twoFactorAttempt.findFirst({
        where: { 
          userId,
          success: true
        },
        orderBy: { attemptedAt: 'desc' }
      });

      return {
        isEnabled: twoFactor.isActive,
        totpEnabled: twoFactor.isActive,
        smsEnabled: twoFactor.smsEnabled,
        backupCodesRemaining: twoFactor.backupCodes.length,
        lastUsed: lastAttempt?.attemptedAt
      };
    } catch (error) {
      console.error('Error getting 2FA status:', error);
      return {
        isEnabled: false,
        totpEnabled: false,
        smsEnabled: false,
        backupCodesRemaining: 0
      };
    }
  }

  // Helper methods
  private async logAttempt(userId: number, attemptType: string, success: boolean): Promise<void> {
    try {
      await this.prisma.twoFactorAttempt.create({
        data: {
          userId,
          attemptType,
          success,
          attemptedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error logging 2FA attempt:', error);
    }
  }

  private async storeSMSCode(userId: number, code: string): Promise<void> {
    // Store in cache with 5 minutes expiry
    const cacheKey = `sms_code:${userId}`;
    // Assuming we have access to cache service
    // cacheService.set(cacheKey, code, 300);
    
    // For now, store in memory (in production, use Redis)
    (global as any).smsCodeCache = (global as any).smsCodeCache || {};
    (global as any).smsCodeCache[userId] = {
      code,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
  }

  private async getSMSCode(userId: number): Promise<string | null> {
    // Get from cache
    const cached = (global as any).smsCodeCache?.[userId];
    if (cached && cached.expires > Date.now()) {
      return cached.code;
    }
    return null;
  }

  private async clearSMSCode(userId: number): Promise<void> {
    if ((global as any).smsCodeCache) {
      delete (global as any).smsCodeCache[userId];
    }
  }

  // Security monitoring
  async getRecentAttempts(userId: number, hours: number = 24): Promise<any[]> {
    return this.prisma.twoFactorAttempt.findMany({
      where: {
        userId,
        attemptedAt: {
          gte: new Date(Date.now() - hours * 60 * 60 * 1000)
        }
      },
      orderBy: { attemptedAt: 'desc' },
      take: 50
    });
  }

  async isRateLimited(userId: number): Promise<boolean> {
    const recentFailedAttempts = await this.prisma.twoFactorAttempt.count({
      where: {
        userId,
        success: false,
        attemptedAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
        }
      }
    });

    return recentFailedAttempts >= 5; // Max 5 failed attempts in 15 minutes
  }
}

export const twoFactorService = new TwoFactorServiceImpl(
  new PrismaClient()
);