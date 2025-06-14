import { PrismaClient, Ansatt, Bedrift } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger, { auditLog } from '../../utils/logger';
import { AuthError, NotFoundError } from '../../utils/errors';

export interface LoginRequest {
  epost: string;
  passord: string;
}

export interface LoginResponse {
  token: string;
  bruker: {
    id: number;
    navn: string;
    epost: string;
    rolle: string;
    tilganger: string[];
    bedrift: Bedrift | null;
    isImpersonating?: boolean;
  };
}

export interface ImpersonateRequest {
  targetUserId: number;
  adminId: number;
}

export class AuthenticationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Autentiser bruker med e-post og passord
   */
  async autentiserBruker(credentials: LoginRequest): Promise<LoginResponse> {
    const { epost, passord } = credentials;

    logger.info('Forsøker innlogging', { epost });

    const ansatt = await this.prisma.ansatt.findUnique({
      where: { epost: epost.toLowerCase().trim() },
      include: { bedrift: true }
    });

    if (!ansatt) {
      auditLog(0, 'FAILED_LOGIN', 'Ansatt', { epost, reason: 'User not found' });
      throw new AuthError('Ugyldig e-post eller passord');
    }

    const passordMatch = await bcrypt.compare(passord, ansatt.passordHash);
    if (!passordMatch) {
      auditLog(ansatt.id, 'FAILED_LOGIN', 'Ansatt', { epost, reason: 'Wrong password' });
      throw new AuthError('Ugyldig e-post eller passord');
    }

    const token = this.generateJwtToken(ansatt);
    auditLog(ansatt.id, 'SUCCESSFUL_LOGIN', 'Ansatt', { epost });

    logger.info('Innlogging vellykket', {
      userId: ansatt.id,
      epost: ansatt.epost,
      rolle: ansatt.rolle
    });

    return {
      token,
      bruker: this.formatUserResponse(ansatt)
    };
  }

  /**
   * Endre passord for bruker
   */
  async endrePassord(ansattId: number, gammeltPassord: string, nyttPassord: string): Promise<void> {
    const ansatt = await this.prisma.ansatt.findUnique({
      where: { id: ansattId }
    });

    if (!ansatt) {
      throw new NotFoundError('Ansatt', ansattId);
    }

    // Verifiser gammelt passord
    const passordMatch = await bcrypt.compare(gammeltPassord, ansatt.passordHash);
    if (!passordMatch) {
      throw new AuthError('Feil gammelt passord');
    }

    // Hash nytt passord
    const nyttPassordHash = await bcrypt.hash(nyttPassord, 10);

    await this.prisma.ansatt.update({
      where: { id: ansattId },
      data: { passordHash: nyttPassordHash }
    });

    auditLog(ansattId, 'CHANGE_PASSWORD', 'Ansatt', { ansattId });
    logger.info('Passord endret', { userId: ansattId });
  }

  /**
   * Start impersonering (admin funksjon)
   */
  async startImpersonering(targetUserId: number, adminId: number): Promise<LoginResponse> {
    // Valider at admin har rettigheter
    const admin = await this.prisma.ansatt.findUnique({
      where: { id: adminId }
    });

    if (!admin || admin.rolle !== 'ADMIN') {
      throw new AuthError('Kun administratorer kan impersonere andre brukere');
    }

    // Hent målbruker
    const targetUser = await this.prisma.ansatt.findUnique({
      where: { id: targetUserId },
      include: { bedrift: true }
    });

    if (!targetUser) {
      throw new NotFoundError('Ansatt', targetUserId);
    }

    // Generer token med impersonering info
    const token = jwt.sign(
      {
        id: targetUserId,
        epost: targetUser.epost,
        rolle: targetUser.rolle,
        bedriftId: targetUser.bedriftId,
        originalUserId: adminId,
        isImpersonating: true
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '1h' } // Kortere utløpstid for impersonering
    );

    auditLog(adminId, 'START_IMPERSONATION', 'Ansatt', { 
      targetUserId, 
      targetUserEmail: targetUser.epost 
    });

    return {
      token,
      bruker: {
        ...this.formatUserResponse(targetUser),
        isImpersonating: true
      }
    };
  }

  /**
   * Stopp impersonering
   */
  async stoppImpersonering(originalUserId: number): Promise<LoginResponse> {
    const originalUser = await this.prisma.ansatt.findUnique({
      where: { id: originalUserId },
      include: { bedrift: true }
    });

    if (!originalUser) {
      throw new NotFoundError('Ansatt', originalUserId);
    }

    const token = this.generateJwtToken(originalUser);
    
    auditLog(originalUserId, 'STOP_IMPERSONATION', 'Ansatt', {});

    return {
      token,
      bruker: this.formatUserResponse(originalUser)
    };
  }

  /**
   * Validér JWT token
   */
  async validerToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      return decoded;
    } catch (error) {
      throw new AuthError('Ugyldig token');
    }
  }

  /**
   * Generer JWT token for bruker
   */
  private generateJwtToken(ansatt: Ansatt): string {
    return jwt.sign(
      {
        id: ansatt.id,
        epost: ansatt.epost,
        rolle: ansatt.rolle,
        bedriftId: ansatt.bedriftId
      },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );
  }

  /**
   * Format bruker respons
   */
  private formatUserResponse(ansatt: Ansatt & { bedrift?: Bedrift | null }): any {
    return {
      id: ansatt.id,
      navn: `${ansatt.fornavn} ${ansatt.etternavn}`,
      epost: ansatt.epost,
      rolle: ansatt.rolle,
      tilganger: ansatt.tilganger,
      bedrift: ansatt.bedrift || null
    };
  }
} 