import { PrismaClient, SystemConfig } from '@prisma/client';
import { BaseService } from './base.service';
import { ValidationError, NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export interface SystemConfigData {
  // Fakturainnstillinger
  dagerForfallFaktura?: number;
  purregebyr?: number;
  forsinkelsesrente?: number;
  kontonummer?: string;
  fakturaPrefix?: string;
  fakturaStartNummer?: number;
  fakturaForfall?: number;
  fakturaRente?: number;
  
  // Kontraktinnstillinger
  standardRente?: number;
  standardEtableringsgebyr?: number;
  standardTermingebyr?: number;
  standardLopetid?: number;
  
  // E-postinnstillinger
  sendKvitteringTilElev?: boolean;
  sendKopiTilBedrift?: boolean;
  standardAvsenderEpost?: string;
  standardAvsenderNavn?: string;
  smtpHost?: string;
  smtpPort?: number;
  emailFrom?: string;
  emailReplyTo?: string;
  emailVarsler?: boolean;
  
  // Varslingsinnstillinger
  varsleNyKontrakt?: boolean;
  varsleStatusendring?: boolean;
  varsleForfall?: boolean;
  dagerForVarslingForfall?: number;
  
  // Øvrige innstillinger
  visPersonnummerILister?: boolean;
  tillateElevregistrering?: boolean;
  kreverGodkjenningElevSoknad?: boolean;
  maksAntallElever?: number;
  maksAntallAnsatte?: number;
  loginUtløpstid?: number;
  epost?: string;
  organisasjonsnummer?: string;
  postnummer?: string;
}

export class SystemConfigService extends BaseService {
  constructor() {
    super();
  }

  async getSystemConfig(bedriftId: number): Promise<SystemConfig | null> {
    logger.info('Henter systemkonfigurasjon', { bedriftId });

    return this.prisma.systemConfig.findUnique({
      where: { bedriftId }
    });
  }

  async createOrUpdateSystemConfig(
    bedriftId: number, 
    data: SystemConfigData,
    brukerId: number
  ): Promise<SystemConfig> {
    // Valider at bedrift eksisterer
    const bedrift = await this.prisma.bedrift.findUnique({
      where: { id: bedriftId }
    });

    if (!bedrift) {
      throw new NotFoundError('Bedrift');
    }

    // Valider numeriske verdier
    this.validateConfigData(data);

    logger.info('Oppretter/oppdaterer systemkonfigurasjon', { 
      bedriftId, 
      brukerId,
      hasEmailConfig: !!data.standardAvsenderEpost,
      hasFakturaConfig: !!data.kontonummer
    });

    // Bruk upsert for å opprette eller oppdatere
    return this.prisma.systemConfig.upsert({
      where: { bedriftId },
      create: {
        bedriftId,
        ...data,
        oppdatert: new Date()
      },
      update: {
        ...data,
        oppdatert: new Date()
      }
    });
  }

  async updatePartialSystemConfig(
    bedriftId: number,
    data: Partial<SystemConfigData>,
    brukerId: number
  ): Promise<SystemConfig> {
    // Sjekk at konfigurasjon eksisterer
    const eksisterende = await this.getSystemConfig(bedriftId);
    if (!eksisterende) {
      throw new NotFoundError('Systemkonfigurasjon');
    }

    // Valider data
    this.validateConfigData(data);

    logger.info('Oppdaterer deler av systemkonfigurasjon', { 
      bedriftId, 
      brukerId,
      fields: Object.keys(data)
    });

    return this.prisma.systemConfig.update({
      where: { bedriftId },
      data: {
        ...data,
        oppdatert: new Date()
      }
    });
  }

  async deleteSystemConfig(bedriftId: number, brukerId: number): Promise<void> {
    // Sjekk at konfigurasjon eksisterer
    const eksisterende = await this.getSystemConfig(bedriftId);
    if (!eksisterende) {
      throw new NotFoundError('Systemkonfigurasjon');
    }

    logger.info('Sletter systemkonfigurasjon', { bedriftId, brukerId });

    await this.prisma.systemConfig.delete({
      where: { bedriftId }
    });
  }

  // Spesifikke konfigurasjonsmetoder
  async getEmailConfig(bedriftId: number): Promise<{
    sendKvitteringTilElev?: boolean;
    sendKopiTilBedrift?: boolean;
    standardAvsenderEpost?: string;
    standardAvsenderNavn?: string;
  } | null> {
    const config = await this.getSystemConfig(bedriftId);
    if (!config) return null;

    return {
      sendKvitteringTilElev: config.sendKvitteringTilElev,
      sendKopiTilBedrift: config.sendKopiTilBedrift,
      standardAvsenderEpost: config.standardAvsenderEpost || undefined,
      standardAvsenderNavn: config.standardAvsenderNavn || undefined
    };
  }

  async getFakturaConfig(bedriftId: number): Promise<{
    dagerForfallFaktura?: number;
    purregebyr?: number;
    forsinkelsesrente?: number;
    kontonummer?: string;
  } | null> {
    const config = await this.getSystemConfig(bedriftId);
    if (!config) return null;

    return {
      dagerForfallFaktura: config.dagerForfallFaktura,
      purregebyr: config.purregebyr,
      forsinkelsesrente: config.forsinkelsesrente,
      kontonummer: config.kontonummer || undefined
    };
  }

  async updateEmailConfig(
    bedriftId: number, 
    emailConfig: {
      sendKvitteringTilElev?: boolean;
      sendKopiTilBedrift?: boolean;
      standardAvsenderEpost?: string;
      standardAvsenderNavn?: string;
    },
    brukerId: number
  ): Promise<SystemConfig> {
    return this.updatePartialSystemConfig(bedriftId, emailConfig, brukerId);
  }

  async updateVarslingsConfig(
    bedriftId: number,
    varslingsConfig: {
      varsleNyKontrakt?: boolean;
      varsleStatusendring?: boolean;
      varsleForfall?: boolean;
      dagerForVarslingForfall?: number;
    },
    brukerId: number
  ): Promise<SystemConfig> {
    return this.updatePartialSystemConfig(bedriftId, varslingsConfig, brukerId);
  }

  // Test e-postkonfigurasjon
  async testEmailConfig(bedriftId: number): Promise<boolean> {
    const emailConfig = await this.getEmailConfig(bedriftId);
    
    if (!emailConfig?.standardAvsenderEpost) {
      throw new ValidationError('E-postkonfigurasjon ikke komplett');
    }

    try {
      // Her skulle man teste faktisk SMTP-forbindelse
      // For nå simulerer vi bare
      logger.info('Tester e-postkonfigurasjon', { 
        bedriftId,
        avsenderEpost: emailConfig.standardAvsenderEpost 
      });
      
      // Simuler test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      logger.error('E-posttest feilet', { bedriftId, error });
      return false;
    }
  }

  // Valider konfigurasjon data
  private validateConfigData(data: Partial<SystemConfigData>): void {
    // Valider numeriske verdier
    if (data.smtpPort !== undefined && (data.smtpPort < 1 || data.smtpPort > 65535)) {
      throw new ValidationError('SMTP port må være mellom 1 og 65535');
    }

    if (data.fakturaStartNummer !== undefined && data.fakturaStartNummer < 1) {
      throw new ValidationError('Faktura startnummer må være større enn 0');
    }

    if (data.fakturaForfall !== undefined && (data.fakturaForfall < 1 || data.fakturaForfall > 365)) {
      throw new ValidationError('Fakturaforfall må være mellom 1 og 365 dager');
    }

    if (data.fakturaRente !== undefined && (data.fakturaRente < 0 || data.fakturaRente > 100)) {
      throw new ValidationError('Fakturarente må være mellom 0 og 100 prosent');
    }

    if (data.maksAntallElever !== undefined && data.maksAntallElever < 1) {
      throw new ValidationError('Maks antall elever må være større enn 0');
    }

    if (data.maksAntallAnsatte !== undefined && data.maksAntallAnsatte < 1) {
      throw new ValidationError('Maks antall ansatte må være større enn 0');
    }

    if (data.loginUtløpstid !== undefined && (data.loginUtløpstid < 1 || data.loginUtløpstid > 168)) {
      throw new ValidationError('Login utløpstid må være mellom 1 og 168 timer');
    }

    // Valider e-postadresser
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.epost && !emailRegex.test(data.epost)) {
      throw new ValidationError('Ugyldig e-postadresse');
    }

    if (data.emailFrom && !emailRegex.test(data.emailFrom)) {
      throw new ValidationError('Ugyldig avsender e-postadresse');
    }

    if (data.emailReplyTo && !emailRegex.test(data.emailReplyTo)) {
      throw new ValidationError('Ugyldig svar-til e-postadresse');
    }

    // Valider organisasjonsnummer (hvis oppgitt)
    if (data.organisasjonsnummer && !/^\d{9}$/.test(data.organisasjonsnummer)) {
      throw new ValidationError('Organisasjonsnummer må være 9 siffer');
    }

    // Valider postnummer (hvis oppgitt)
    if (data.postnummer && !/^\d{4}$/.test(data.postnummer)) {
      throw new ValidationError('Postnummer må være 4 siffer');
    }
  }

  // Hent alle konfigurasjoner for rapport/admin
  async getAllConfigurations(): Promise<Array<SystemConfig & { bedrift: { navn: string } }>> {
    logger.info('Henter alle systemkonfigurasjoner (admin)');

    return this.prisma.systemConfig.findMany({
      include: {
        bedrift: {
          select: { navn: true }
        }
      },
      orderBy: { oppdatert: 'desc' }
    });
  }

  // Statistikk over konfigurasjoner
  async getConfigurationStats(): Promise<{
    totalConfigurations: number;
    withEmailConfig: number;
    withFakturaConfig: number;
    withVarslerEnabled: number;
    recentlyUpdated: number;
  }> {
    const [
      total,
      withEmail,
      withFaktura,
      withVarsler,
      recentlyUpdated
    ] = await Promise.all([
      this.prisma.systemConfig.count(),
      this.prisma.systemConfig.count({
        where: {
          smtpHost: { not: null }
        }
      }),
      this.prisma.systemConfig.count({
        where: {
          fakturaPrefix: { not: null }
        }
      }),
      this.prisma.systemConfig.count({
        where: {
          emailVarsler: true
        }
      }),
      this.prisma.systemConfig.count({
        where: {
          oppdatert: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Siste 7 dager
          }
        }
      })
    ]);

    return {
      totalConfigurations: total,
      withEmailConfig: withEmail,
      withFakturaConfig: withFaktura,
      withVarslerEnabled: withVarsler,
      recentlyUpdated
    };
  }
} 