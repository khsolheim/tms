import { PrismaClient, Elev, ElevSoknad, Prisma } from '@prisma/client';
import { BaseService } from './base.service';
import logger, { auditLog } from '../utils/logger';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors';

export interface ElevCreateData {
  personnummer: string;
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon: string;
  gate: string;
  postnummer: string;
  poststed: string;
  klassekode: string;
  larer?: string;
  bedriftId: number;
  opprettetAv: number; // Brukes for audit log, men ikke lagret på elev
}

export interface ElevUpdateData {
  fornavn?: string;
  etternavn?: string;
  epost?: string;
  telefon?: string;
  gate?: string;
  postnummer?: string;
  poststed?: string;
  klassekode?: string;
  status?: 'AKTIV' | 'INAKTIV' | 'PENDING';
}

export interface ElevSoknadData {
  personnummer: string;
  fornavn: string;
  etternavn: string;
  epost: string;
  telefon: string;
  gate: string;
  postnummer: string;
  poststed: string;
  klassekode: string;
  larer?: string;
  bedriftId: number;
}

export interface ElevFilters {
  sokeTerm?: string;
  bedriftId?: number;
  klassekode?: string;
  status?: 'AKTIV' | 'INAKTIV' | 'PENDING';
  page?: number;
  limit?: number;
}

export class ElevService extends BaseService {
  constructor() {
    super();
  }

  private validerPersonnummer(personnummer: string): boolean {
    // Fjern eventuelle mellomrom og bindestrek
    const rensetPnr = personnummer.replace(/[\s-]/g, '');
    
    // Sjekk at det er nøyaktig 11 siffer
    if (!/^\d{11}$/.test(rensetPnr)) {
      return false;
    }

    // Utfør modulus 11-kontroll
    const weights1 = [3, 7, 6, 1, 8, 9, 4, 5, 2];
    const weights2 = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    
    const digits = rensetPnr.split('').map(Number);
    
    // Første kontrollsiffer
    let sum1 = 0;
    for (let i = 0; i < 9; i++) {
      sum1 += digits[i] * weights1[i];
    }
    let control1 = 11 - (sum1 % 11);
    if (control1 === 11) control1 = 0;
    if (control1 === 10) return false;
    
    if (control1 !== digits[9]) return false;
    
    // Andre kontrollsiffer
    let sum2 = 0;
    for (let i = 0; i < 10; i++) {
      sum2 += digits[i] * weights2[i];
    }
    let control2 = 11 - (sum2 % 11);
    if (control2 === 11) control2 = 0;
    if (control2 === 10) return false;
    
    return control2 === digits[10];
  }

  private validerAlder(personnummer: string): { alder: number; erGyldig: boolean } {
    const rensetPnr = personnummer.replace(/[\s-]/g, '');
    
    if (rensetPnr.length !== 11) {
      return { alder: 0, erGyldig: false };
    }

    const dag = parseInt(rensetPnr.substring(0, 2));
    const maned = parseInt(rensetPnr.substring(2, 4));
    let ar = parseInt(rensetPnr.substring(4, 6));
    
    // Enkel århundre-bestemmelse (kan forbedres)
    if (ar < 50) {
      ar += 2000;
    } else {
      ar += 1900;
    }
    
    const fodselsdato = new Date(ar, maned - 1, dag);
    const idag = new Date();
    const alder = idag.getFullYear() - fodselsdato.getFullYear();
    
    // Sjekk om personen har hatt bursdag i år
    const harHattBursdag = 
      idag.getMonth() > fodselsdato.getMonth() || 
      (idag.getMonth() === fodselsdato.getMonth() && idag.getDate() >= fodselsdato.getDate());
    
    const faktiskAlder = harHattBursdag ? alder : alder - 1;
    
    return {
      alder: faktiskAlder,
      erGyldig: faktiskAlder >= 16 && faktiskAlder <= 30
    };
  }

  /**
   * Valider elev-data før opprettelse
   */
  private async validerElevData(data: ElevCreateData): Promise<void> {
    // Valider personnummer
    if (!this.validerPersonnummer(data.personnummer)) {
      throw new ValidationError(
        'Ugyldig personnummer',
        { personnummer: ['Personnummer er ikke gyldig'] }
      );
    }

    // Valider alder
    const { alder, erGyldig } = this.validerAlder(data.personnummer);
    if (!erGyldig) {
      throw new ValidationError(
        'Ugyldig alder',
        { personnummer: [`Eleven må være mellom 16 og 30 år (alder: ${alder})`] }
      );
    }

    // Sjekk for duplikat personnummer
    const eksisterendeElev = await this.prisma.elev.findFirst({
      where: {
        personnummer: data.personnummer,
        status: 'AKTIV'
      }
    });

    if (eksisterendeElev) {
      throw new ConflictError('En elev med dette personnummeret er allerede registrert');
    }

    // Sjekk for duplikat e-post i samme bedrift
    const eksisterendeEpost = await this.prisma.elev.findFirst({
      where: {
        epost: data.epost,
        bedriftId: data.bedriftId,
        status: 'AKTIV'
      }
    });

    if (eksisterendeEpost) {
      throw new ConflictError('En elev med denne e-postadressen er allerede registrert i bedriften');
    }

    // Valider at bedrift eksisterer
    const bedrift = await this.prisma.bedrift.findUnique({
      where: { id: data.bedriftId }
    });

    if (!bedrift) {
      throw new NotFoundError('Bedrift', data.bedriftId);
    }

    // Valider at klasse finnes i bedriften
    const klasse = await this.prisma.bedriftsKlasse.findFirst({
      where: {
        bedriftId: data.bedriftId,
        klassekode: data.klassekode
      }
    });

    if (!klasse) {
      throw new ValidationError(
        'Klassekode finnes ikke i bedriften',
        { klassekode: ['Klassekode finnes ikke i bedriften'] }
      );
    }
  }

  /**
   * Opprett ny elev
   */
  async opprettElev(data: ElevCreateData): Promise<Elev> {
    logger.info('Oppretter ny elev', {
      personnummer: data.personnummer.substring(0, 6) + '*****', // Maskert for sikkerhet
      bedriftId: data.bedriftId,
      opprettetAv: data.opprettetAv
    });

    // Valider data
    await this.validerElevData(data);

    // Ekstraher felter som ikke skal lagres på elev
    const { opprettetAv, ...elevData } = data;

    const elev = await this.prisma.elev.create({
      data: {
        ...elevData,
        status: 'AKTIV'
      }
    });

    auditLog(
      opprettetAv,
      'CREATE_ELEV',
      'Elev',
      {
        elevId: elev.id,
        bedriftId: data.bedriftId,
        personnummer: data.personnummer.substring(0, 6) + '*****'
      }
    );

    logger.info('Elev opprettet vellykket', {
      elevId: elev.id,
      bedriftId: data.bedriftId
    });

    return elev;
  }

  /**
   * Hent elev etter ID
   */
  async hentElev(id: number, bedriftId: number): Promise<Elev> {
    const elev = await this.prisma.elev.findFirst({
      where: {
        id,
        bedriftId
      }
    });

    if (!elev) {
      throw new NotFoundError('Elev', id);
    }

    return elev;
  }

  /**
   * Hent elever med filtrering og paginering
   */
  async hentElever(filters: ElevFilters): Promise<{
    elever: Elev[];
    totalAntall: number;
    side: number;
    antallSider: number;
  }> {
    const { skip, take } = this.calculatePagination(filters.page, filters.limit);
    
    const where: Prisma.ElevWhereInput = {};

    if (filters.bedriftId) {
      where.bedriftId = filters.bedriftId;
    }

    if (filters.klassekode) {
      where.klassekode = filters.klassekode;
    }

    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    if (filters.sokeTerm) {
      where.OR = [
        { fornavn: { contains: filters.sokeTerm, mode: 'insensitive' } },
        { etternavn: { contains: filters.sokeTerm, mode: 'insensitive' } },
        { epost: { contains: filters.sokeTerm, mode: 'insensitive' } },
        { klassekode: { contains: filters.sokeTerm, mode: 'insensitive' } },
      ];
    }

    const [elever, totalAntall] = await Promise.all([
      this.prisma.elev.findMany({
        where,
        skip,
        take,
        orderBy: [
          { etternavn: 'asc' },
          { fornavn: 'asc' }
        ]
      }),
      this.prisma.elev.count({ where })
    ]);

    const antallSider = Math.ceil(totalAntall / (filters.limit || 50));

    return {
      elever,
      totalAntall,
      side: filters.page || 1,
      antallSider
    };
  }

  /**
   * Oppdater elev
   */
  async oppdaterElev(id: number, bedriftId: number, data: ElevUpdateData, oppdatertAv: number): Promise<Elev> {
    const eksisterendeElev = await this.hentElev(id, bedriftId);

    // Valider e-post unikhet hvis den endres
    if (data.epost && data.epost !== eksisterendeElev.epost) {
      const eksisterendeEpost = await this.prisma.elev.findFirst({
        where: {
          epost: data.epost,
          bedriftId,
          status: 'AKTIV',
          id: { not: id }
        }
      });

      if (eksisterendeEpost) {
        throw new ConflictError('En elev med denne e-postadressen er allerede registrert i bedriften');
      }
    }

    // Valider klassekode hvis den endres
    if (data.klassekode && data.klassekode !== eksisterendeElev.klassekode) {
      const klasse = await this.prisma.bedriftsKlasse.findFirst({
        where: {
          bedriftId,
          klassekode: data.klassekode
        }
      });

      if (!klasse) {
        throw new ValidationError(
          'Klassekode finnes ikke i bedriften',
          { klassekode: ['Klassekode finnes ikke i bedriften'] }
        );
      }
    }

    const oppdatertElev = await this.prisma.elev.update({
      where: { id },
      data
    });

    auditLog(
      oppdatertAv,
      'UPDATE_ELEV',
      'Elev',
      {
        elevId: id,
        bedriftId,
        endringer: data
      }
    );

    logger.info('Elev oppdatert vellykket', {
      elevId: id,
      bedriftId
    });

    return oppdatertElev;
  }

  /**
   * Slett elev (soft delete)
   */
  async slettElev(id: number, bedriftId: number, slettetAv: number): Promise<void> {
    const eksisterendeElev = await this.hentElev(id, bedriftId);

    await this.prisma.elev.update({
      where: { id },
      data: {
        status: 'INAKTIV'
      }
    });

    auditLog(
      slettetAv,
      'DELETE_ELEV',
      'Elev',
      {
        elevId: id,
        bedriftId,
        personnummer: eksisterendeElev.personnummer.substring(0, 6) + '*****'
      }
    );

    logger.info('Elev slettet (soft delete)', {
      elevId: id,
      bedriftId
    });
  }

  /**
   * Opprett elev-søknad
   */
  async opprettElevSoknad(data: ElevSoknadData): Promise<ElevSoknad> {
    logger.info('Oppretter elev-søknad', {
      personnummer: data.personnummer.substring(0, 6) + '*****',
      bedriftId: data.bedriftId
    });

    // Valider personnummer
    if (!this.validerPersonnummer(data.personnummer)) {
      throw new ValidationError(
        'Ugyldig personnummer',
        { personnummer: ['Personnummer er ikke gyldig'] }
      );
    }

    // Sjekk om det allerede finnes en aktiv søknad
    const eksisterendeSoknad = await this.prisma.elevSoknad.findFirst({
      where: {
        personnummer: data.personnummer,
        status: {
          in: ['PENDING', 'GODKJENT']
        }
      }
    });

    if (eksisterendeSoknad) {
      throw new ConflictError('Det finnes allerede en aktiv søknad for dette personnummeret');
    }

    // Sjekk om eleven allerede er registrert
    const eksisterendeElev = await this.prisma.elev.findFirst({
      where: {
        personnummer: data.personnummer,
        status: 'AKTIV'
      }
    });

    if (eksisterendeElev) {
      throw new ConflictError('En elev med dette personnummeret er allerede registrert');
    }

    const soknad = await this.prisma.elevSoknad.create({
      data: {
        ...data,
        status: 'PENDING'
      }
    });

    logger.info('Elev-søknad opprettet', {
      soknadId: soknad.id,
      bedriftId: data.bedriftId
    });

    return soknad;
  }

  /**
   * Behandle elev-søknad
   */
  async behandleElevSoknad(
    soknadId: number, 
    action: 'godkjenn' | 'avvis', 
    merknad: string | undefined,
    behandletAv: number
  ): Promise<ElevSoknad> {
    const soknad = await this.prisma.elevSoknad.findUnique({
      where: { id: soknadId }
    });

    if (!soknad) {
      throw new NotFoundError('Elevsøknad', soknadId);
    }

    if (soknad.status !== 'PENDING') {
      throw new ValidationError('Søknaden er allerede behandlet');
    }

    const oppdatertSoknad = await this.prisma.elevSoknad.update({
      where: { id: soknadId },
      data: {
        status: action === 'godkjenn' ? 'GODKJENT' : 'AVVIST'
      }
    });

    if (action === 'godkjenn') {
      // Opprett elev basert på søknad
      await this.prisma.elev.create({
        data: {
          fornavn: soknad.fornavn,
          etternavn: soknad.etternavn,
          telefon: soknad.telefon || '',
          epost: soknad.epost,
          gate: soknad.gate,
          postnummer: soknad.postnummer,
          poststed: soknad.poststed,
          personnummer: soknad.personnummer,
          klassekode: soknad.klassekode,
          larer: soknad.larer,
          status: 'AKTIV',
          bedriftId: soknad.bedriftId
        }
      });
    }

    auditLog(
      behandletAv,
      action === 'godkjenn' ? 'APPROVE_ELEV_SOKNAD' : 'REJECT_ELEV_SOKNAD',
      'ElevSoknad',
      {
        soknadId,
        bedriftId: soknad.bedriftId,
        personnummer: soknad.personnummer.substring(0, 6) + '*****',
        merknad
      }
    );

    logger.info(`Elev-søknad ${action === 'godkjenn' ? 'godkjent' : 'avvist'}`, {
      soknadId,
      bedriftId: soknad.bedriftId
    });

    return oppdatertSoknad;
  }

  /**
   * Søk etter elever
   */
  async sokElever(sokeTerm: string, bedriftId?: number): Promise<Elev[]> {
    const where: Prisma.ElevWhereInput = {
      status: 'AKTIV',
      OR: [
        { fornavn: { contains: sokeTerm, mode: 'insensitive' } },
        { etternavn: { contains: sokeTerm, mode: 'insensitive' } },
        { epost: { contains: sokeTerm, mode: 'insensitive' } },
        { klassekode: { contains: sokeTerm, mode: 'insensitive' } },
      ]
    };

    if (bedriftId) {
      where.bedriftId = bedriftId;
    }

    return this.prisma.elev.findMany({
      where,
      take: 20, // Begrenset til 20 resultater
      orderBy: [
        { etternavn: 'asc' },
        { fornavn: 'asc' }
      ]
    });
  }
} 