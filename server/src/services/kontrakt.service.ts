import { PrismaClient, Kontrakt, Prisma } from '@prisma/client';
import { NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export interface KontraktCreateData {
  elevFornavn: string;
  elevEtternavn: string;
  elevPersonnummer: string;
  elevTelefon: string;
  elevEpost: string;
  elevGate: string;
  elevPostnr: string;
  elevPoststed: string;
  harFakturaansvarlig: boolean;
  fakturaansvarligFornavn?: string;
  fakturaansvarligEtternavn?: string;
  fakturaansvarligPersonnummer?: string;
  fakturaansvarligTelefon?: string;
  fakturaansvarligEpost?: string;
  fakturaansvarligGate?: string;
  fakturaansvarligPostnr?: string;
  fakturaansvarligPoststed?: string;
  lan: number;
  lopetid: number;
  rente: number;
  etableringsgebyr: number;
  termingebyr: number;
  terminerPerAr: number;
  inkludererGebyrerILan: boolean;
  bedriftId: number;
  opprettetAv: number;
}

export interface KontraktUpdateData {
  elevFornavn?: string;
  elevEtternavn?: string;
  elevTelefon?: string;
  elevEpost?: string;
  elevGate?: string;
  elevPostnr?: string;
  elevPoststed?: string;
  harFakturaansvarlig?: boolean;
  fakturaansvarligFornavn?: string;
  fakturaansvarligEtternavn?: string;
  fakturaansvarligPersonnummer?: string;
  fakturaansvarligTelefon?: string;
  fakturaansvarligEpost?: string;
  fakturaansvarligGate?: string;
  fakturaansvarligPostnr?: string;
  fakturaansvarligPoststed?: string;
  lan?: number;
  lopetid?: number;
  rente?: number;
  etableringsgebyr?: number;
  termingebyr?: number;
  terminerPerAr?: number;
  inkludererGebyrerILan?: boolean;
  status?: 'UTKAST' | 'AKTIV' | 'AVSLUTTET' | 'KANSELLERT';
}

export interface KontraktFilters {
  status?: string;
  elevNavn?: string;
  bedriftId?: number;
  opprettetFra?: Date;
  opprettetTil?: Date;
  page?: number;
  limit?: number;
}

export class KontraktService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Beregner kontrakt detaljer basert på grunndata
   */
  private beregnKontraktDetaljer(data: Pick<KontraktCreateData, 'lan' | 'lopetid' | 'rente' | 'etableringsgebyr' | 'termingebyr' | 'terminerPerAr' | 'inkludererGebyrerILan'>) {
    const { lan, lopetid, rente, etableringsgebyr, termingebyr, terminerPerAr, inkludererGebyrerILan } = data;
    
    // Beregn månedlig rente
    const maanedligRente = rente / 100 / 12;
    const antallTerminer = lopetid;
    
    // Hvis gebyrer inkluderes i lånet
    let justerlLaan = lan;
    if (inkludererGebyrerILan) {
      justerlLaan = lan + etableringsgebyr;
    }
    
    // Beregn terminbeløp (annuitet)
    let terminbelop: number;
    if (maanedligRente === 0) {
      // Uten rente
      terminbelop = justerlLaan / antallTerminer + termingebyr;
    } else {
      // Med rente - annuitetsberegning
      const annuitetsfaktor = (maanedligRente * Math.pow(1 + maanedligRente, antallTerminer)) / 
                             (Math.pow(1 + maanedligRente, antallTerminer) - 1);
      terminbelop = justerlLaan * annuitetsfaktor + termingebyr;
    }
    
    // Beregn total rente og gebyrer
    const totalTerminbeloep = terminbelop * antallTerminer;
    const totalRente = totalTerminbeloep - justerlLaan - (termingebyr * antallTerminer);
    const renterOgGebyr = totalRente + (termingebyr * antallTerminer) + (inkludererGebyrerILan ? 0 : etableringsgebyr);
    const totalBelop = lan + renterOgGebyr;
    
    // Beregn effektiv rente (forenklet)
    const effektivRente = ((totalBelop - lan) / lan) / (lopetid / 12) * 100;
    
    return {
      effektivRente: Math.round(effektivRente * 100) / 100,
      renterOgGebyr: Math.round(renterOgGebyr),
      terminbelop: Math.round(terminbelop),
      totalRente: Math.round(totalRente),
      totalBelop: Math.round(totalBelop),
    };
  }

  /**
   * Validerer business rules for kontrakt
   */
  private async validerKontrakt(data: KontraktCreateData): Promise<void> {
    // Sjekk for duplikat kontrakt (samme personnummer og bedrift med aktiv status)
    const eksisterendeKontrakt = await this.prisma.kontrakt.findFirst({
      where: {
        elevPersonnummer: data.elevPersonnummer,
        bedriftId: data.bedriftId,
        status: {
          in: ['UTKAST', 'AKTIV']
        }
      }
    });

    if (eksisterendeKontrakt) {
      throw new ValidationError(
        'Det eksisterer allerede en aktiv kontrakt for denne eleven i bedriften',
        { 
          elevPersonnummer: ['Eleven har allerede en aktiv kontrakt'] 
        }
      );
    }

    // Valider lånebeløp (minimum og maksimum)
    if (data.lan < 1000) {
      throw new ValidationError(
        'Lånebeløp må være minst 1000 kr',
        { lan: ['Minimum lånebeløp er 1000 kr'] }
      );
    }

    if (data.lan > 500000) {
      throw new ValidationError(
        'Lånebeløp kan ikke overstige 500.000 kr',
        { lan: ['Maksimum lånebeløp er 500.000 kr'] }
      );
    }

    // Valider løpetid
    if (data.lopetid < 6 || data.lopetid > 60) {
      throw new ValidationError(
        'Løpetid må være mellom 6 og 60 måneder',
        { lopetid: ['Løpetid må være mellom 6 og 60 måneder'] }
      );
    }

    // Valider rente
    if (data.rente < 0 || data.rente > 25) {
      throw new ValidationError(
        'Rente må være mellom 0% og 25%',
        { rente: ['Rente må være mellom 0% og 25%'] }
      );
    }
  }

  /**
   * Opprett ny kontrakt
   */
  async opprettKontrakt(data: KontraktCreateData): Promise<Kontrakt> {
    logger.info('Oppretter ny kontrakt', { 
      elevPersonnummer: data.elevPersonnummer,
      bedriftId: data.bedriftId,
      lan: data.lan 
    });

    // Valider business rules
    await this.validerKontrakt(data);

    // Beregn kontrakt detaljer
    const beregnede = this.beregnKontraktDetaljer(data);

    // Opprett kontrakt i database
    const kontrakt = await this.prisma.kontrakt.create({
      data: {
        ...data,
        ...beregnede,
        status: 'UTKAST',
        opprettet: new Date(),
        oppdatert: new Date(),
      },
      include: {
        bedrift: {
          select: {
            navn: true,
            organisasjonsnummer: true
          }
        },
        opprettetAvAnsatt: {
          select: {
            fornavn: true,
            etternavn: true,
            epost: true
          }
        }
      }
    });

    logger.info('Kontrakt opprettet', { kontraktId: kontrakt.id });
    return kontrakt;
  }

  /**
   * Hent kontrakt med ID
   */
  async hentKontrakt(id: number, bedriftId: number): Promise<Kontrakt> {
    const kontrakt = await this.prisma.kontrakt.findUnique({
      where: { 
        id,
        bedriftId // Sikkerhet: kun kontrakter i brukerens bedrift
      },
      include: {
        bedrift: {
          select: {
            navn: true,
            organisasjonsnummer: true,
            adresse: true,
            postnummer: true,
            poststed: true,
            telefon: true,
            epost: true,

          }
        },
        opprettetAvAnsatt: {
          select: {
            fornavn: true,
            etternavn: true,
            epost: true
          }
        }
      }
    });

    if (!kontrakt) {
      throw new NotFoundError('Kontrakten ble ikke funnet');
    }

    return kontrakt;
  }

  /**
   * Hent kontrakter med filtrering
   */
  async hentKontrakter(filters: KontraktFilters): Promise<{
    kontrakter: Kontrakt[];
    totalAntall: number;
    side: number;
    antallSider: number;
  }> {
    const {
      status,
      elevNavn,
      bedriftId,
      opprettetFra,
      opprettetTil,
      page = 1,
      limit = 20
    } = filters;

    // Bygg where clause
    const where: Prisma.KontraktWhereInput = {
      ...(bedriftId && { bedriftId }),
      ...(status && { status: status as any }),
      ...(opprettetFra && { opprettet: { gte: opprettetFra } }),
      ...(opprettetTil && { opprettet: { lte: opprettetTil } }),
      ...(elevNavn && {
        OR: [
          { elevFornavn: { contains: elevNavn, mode: 'insensitive' } },
          { elevEtternavn: { contains: elevNavn, mode: 'insensitive' } }
        ]
      })
    };

    // Hent total antall for paginering
    const totalAntall = await this.prisma.kontrakt.count({ where });

    // Hent kontrakter med paginering
    const kontrakter = await this.prisma.kontrakt.findMany({
      where,
      include: {
        bedrift: {
          select: {
            navn: true,
            organisasjonsnummer: true
          }
        },
        opprettetAvAnsatt: {
          select: {
            fornavn: true,
            etternavn: true
          }
        }
      },
      orderBy: {
        opprettet: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const antallSider = Math.ceil(totalAntall / limit);

    return {
      kontrakter,
      totalAntall,
      side: page,
      antallSider
    };
  }

  /**
   * Oppdater kontrakt
   */
  async oppdaterKontrakt(id: number, bedriftId: number, data: KontraktUpdateData): Promise<Kontrakt> {
    logger.info('Oppdaterer kontrakt', { kontraktId: id, oppdateringer: Object.keys(data) });

    // Sjekk at kontrakt eksisterer og tilhører bedrift
    const eksisterendeKontrakt = await this.hentKontrakt(id, bedriftId);

    // Hvis finansielle data oppdateres, beregn på nytt
    let beregnede = {};
    if (data.lan || data.lopetid || data.rente || data.etableringsgebyr || data.termingebyr || data.terminerPerAr || data.inkludererGebyrerILan !== undefined) {
      const beregnData = {
        lan: data.lan ?? eksisterendeKontrakt.lan,
        lopetid: data.lopetid ?? eksisterendeKontrakt.lopetid,
        rente: data.rente ?? eksisterendeKontrakt.rente,
        etableringsgebyr: data.etableringsgebyr ?? eksisterendeKontrakt.etableringsgebyr,
        termingebyr: data.termingebyr ?? eksisterendeKontrakt.termingebyr,
        terminerPerAr: data.terminerPerAr ?? eksisterendeKontrakt.terminerPerAr,
        inkludererGebyrerILan: data.inkludererGebyrerILan ?? eksisterendeKontrakt.inkludererGebyrerILan,
      };
      beregnede = this.beregnKontraktDetaljer(beregnData);
    }

    // Oppdater kontrakt
    const oppdatertKontrakt = await this.prisma.kontrakt.update({
      where: { id },
      data: {
        ...data,
        ...beregnede,
        oppdatert: new Date(),
      },
      include: {
        bedrift: {
          select: {
            navn: true,
            organisasjonsnummer: true
          }
        },
        opprettetAvAnsatt: {
          select: {
            fornavn: true,
            etternavn: true
          }
        }
      }
    });

    logger.info('Kontrakt oppdatert', { kontraktId: id });
    return oppdatertKontrakt;
  }

  /**
   * Slett kontrakt
   */
  async slettKontrakt(id: number, bedriftId: number): Promise<void> {
    logger.info('Sletter kontrakt', { kontraktId: id });

    // Sjekk at kontrakt eksisterer og tilhører bedrift
    await this.hentKontrakt(id, bedriftId);

    // Slett kontrakt
    await this.prisma.kontrakt.delete({
      where: { id }
    });

    logger.info('Kontrakt slettet', { kontraktId: id });
  }

  /**
   * Hent kontraktsstatistikk for bedrift
   */
  async hentKontraktsstatistikk(bedriftId: number): Promise<{
    totaltAntall: number;
    antallUtkast: number;
    antallAktive: number;
    antallAvsluttede: number;
    antallKansellerte: number;
    totalLaanebeloep: number;
    gjennomsnittligLaan: number;
  }> {
    const [
      totalt,
      utkast,
      aktive,
      avsluttede,
      kansellerte,
      statistikk
    ] = await Promise.all([
      this.prisma.kontrakt.count({ where: { bedriftId } }),
      this.prisma.kontrakt.count({ where: { bedriftId, status: 'UTKAST' } }),
      this.prisma.kontrakt.count({ where: { bedriftId, status: 'AKTIV' } }),
      this.prisma.kontrakt.count({ where: { bedriftId, status: 'AVSLUTTET' } }),
      this.prisma.kontrakt.count({ where: { bedriftId, status: 'KANSELLERT' } }),
      this.prisma.kontrakt.aggregate({
        where: { bedriftId },
        _sum: { lan: true },
        _avg: { lan: true }
      })
    ]);

    return {
      totaltAntall: totalt,
      antallUtkast: utkast,
      antallAktive: aktive,
      antallAvsluttede: avsluttede,
      antallKansellerte: kansellerte,
      totalLaanebeloep: statistikk._sum.lan || 0,
      gjennomsnittligLaan: Math.round(statistikk._avg.lan || 0)
    };
  }
} 