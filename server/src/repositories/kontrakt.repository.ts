import { PrismaClient, Kontrakt, Prisma, KontraktStatus } from '@prisma/client';
import { BaseRepository, PaginationOptions, PaginationResult } from './base.repository';

export interface KontraktCreateInput {
  elevFornavn: string;
  elevEtternavn: string;
  elevPersonnummer: string;
  elevTelefon: string;
  elevEpost: string;
  elevGate: string;
  elevPostnr: string;
  elevPoststed: string;
  bedriftId: number;
  lan: number;
  lopetid: number;
  rente: number;
  etableringsgebyr: number;
  termingebyr: number;
  status?: KontraktStatus;
}

export interface KontraktUpdateInput {
  elevPersonnummer?: string;
  elevNavn?: string;
  bedriftId?: number;
  bedriftNavn?: string;
  laerer?: string;
  totalSum?: number;
  egenbetaling?: number;
  nedbetalingsplan?: any;
  status?: KontraktStatus;
}

export interface KontraktSearchFilters {
  bedriftId?: number;
  status?: KontraktStatus;
  elevPersonnummer?: string;
  laerer?: string;
  fraDato?: Date;
  tilDato?: Date;
  minTotalSum?: number;
  maxTotalSum?: number;
}

export class KontraktRepository extends BaseRepository<
  Kontrakt,
  KontraktCreateInput,
  KontraktUpdateInput,
  Prisma.KontraktWhereInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'kontrakt');
  }

  /**
   * Finn kontrakter med avanserte søkefiltre
   */
  async findWithFilters(
    filters: KontraktSearchFilters,
    pagination?: PaginationOptions,
    orderBy?: Prisma.KontraktOrderByWithRelationInput[]
  ): Promise<PaginationResult<Kontrakt> | Kontrakt[]> {
    const where: Prisma.KontraktWhereInput = {};

    // Bygge where-klausul basert på filtre
    if (filters.bedriftId) {
      where.bedriftId = filters.bedriftId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.elevPersonnummer) {
      where.elevPersonnummer = {
        contains: filters.elevPersonnummer,
        mode: 'insensitive'
      };
    }

    // Note: laerer felt finnes ikke i Kontrakt modellen, så vi kommenterer ut
    // hvis det trengs, kan det legges til i schema
    // if (filters.laerer) {
    //   where.laerer = {
    //     contains: filters.laerer,
    //     mode: 'insensitive'
    //   };
    // }

    if (filters.fraDato || filters.tilDato) {
      where.opprettet = {};
      if (filters.fraDato) {
        where.opprettet.gte = filters.fraDato;
      }
      if (filters.tilDato) {
        where.opprettet.lte = filters.tilDato;
      }
    }

    if (filters.minTotalSum || filters.maxTotalSum) {
      where.totalBelop = {};
      if (filters.minTotalSum) {
        where.totalBelop.gte = filters.minTotalSum;
      }
      if (filters.maxTotalSum) {
        where.totalBelop.lte = filters.maxTotalSum;
      }
    }

    const include = {
      bedrift: {
        select: { navn: true, organisasjonsnummer: true }
      },
      elev: {
        select: { fornavn: true, etternavn: true, epost: true }
      }
    };

    if (pagination) {
      return this.findManyPaginated(where, pagination, {
        include,
        orderBy: orderBy || [{ opprettet: 'desc' }]
      });
    }

    return this.findMany(where, {
      include,
      orderBy: orderBy || [{ opprettet: 'desc' }]
    });
  }

  /**
   * Finn kontrakter for en spesifikk bedrift
   */
  async findByBedrift(
    bedriftId: number,
    pagination?: PaginationOptions
  ): Promise<PaginationResult<Kontrakt> | Kontrakt[]> {
    const where = { bedriftId };
    const include = {
      elev: {
        select: { fornavn: true, etternavn: true, epost: true }
      }
    };

    if (pagination) {
      return this.findManyPaginated(where, pagination, {
        include,
        orderBy: [{ opprettet: 'desc' }]
      });
    }

    return this.findMany(where, {
      include,
      orderBy: [{ opprettet: 'desc' }]
    });
  }

  /**
   * Finn kontrakter for en spesifikk elev
   */
  async findByElev(elevPersonnummer: string): Promise<Kontrakt[]> {
    return this.findMany(
      { elevPersonnummer },
      {
        include: {
          bedrift: {
            select: { navn: true, organisasjonsnummer: true }
          }
        },
        orderBy: [{ opprettet: 'desc' }]
      }
    );
  }

  /**
   * Finn aktive kontrakter (ikke fullført eller kansellert)
   */
  async findActive(bedriftId?: number): Promise<Kontrakt[]> {
    const where: Prisma.KontraktWhereInput = {
      status: {
        notIn: ['AVSLUTTET', 'KANSELLERT']
      }
    };

    if (bedriftId) {
      where.bedriftId = bedriftId;
    }

    return this.findMany(where, {
      include: {
        bedrift: {
          select: { navn: true }
        },
        elev: {
          select: { fornavn: true, etternavn: true }
        }
      },
      orderBy: [{ opprettet: 'desc' }]
    });
  }

  /**
   * Finn kontrakter som trenger oppfølging (forfalt betaling, etc.)
   */
  async findRequiringFollowUp(): Promise<Kontrakt[]> {
    // Implementer logikk for å finne kontrakter som trenger oppfølging
    // Dette kan inkludere forfalt betaling, manglende dokumentasjon, etc.
    return this.findMany(
      {
        status: 'AKTIV',
        // Legg til mer spesifikke kriterier når business rules er definert
      },
      {
        include: {
          bedrift: {
            select: { navn: true, epost: true }
          },
          elev: {
            select: { fornavn: true, etternavn: true, epost: true }
          }
        }
      }
    );
  }

  /**
   * Statistikk for kontrakter
   */
  async getStatistics(bedriftId?: number): Promise<{
    total: number;
    aktive: number;
    fullforte: number;
    kansellerte: number;
    totalSum: number;
    gjennomsnittligSum: number;
  }> {
    const where: Prisma.KontraktWhereInput = bedriftId ? { bedriftId } : {};

    const [total, aktive, fullforte, kansellerte, sumStats] = await Promise.all([
      this.count(where),
      this.count({ ...where, status: 'AKTIV' }),
      this.count({ ...where, status: 'AVSLUTTET' }),
      this.count({ ...where, status: 'KANSELLERT' }),
      this.aggregate({
        where,
        _sum: { totalBelop: true },
        _avg: { totalBelop: true }
      })
    ]);

    return {
      total,
      aktive,
      fullforte,
      kansellerte,
      totalSum: sumStats._sum.totalBelop || 0,
      gjennomsnittligSum: sumStats._avg.totalBelop || 0
    };
  }

  /**
   * Finn duplikate kontrakter (samme elev og bedrift)
   */
  async findDuplicates(): Promise<Array<{
    elevPersonnummer: string;
    bedriftId: number;
    count: number;
    kontrakter: Kontrakt[];
  }>> {
    // Group by for å finne duplikater
    const duplicates = await this.groupBy({
      by: ['elevPersonnummer', 'bedriftId'],
      having: {
        id: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        id: true
      }
    });

    // Hent faktiske kontrakter for hver duplikat gruppe
    const result = [];
    for (const duplicate of duplicates) {
      const kontrakter = await this.findMany({
        elevPersonnummer: duplicate.elevPersonnummer,
        bedriftId: duplicate.bedriftId
      });

      result.push({
        elevPersonnummer: duplicate.elevPersonnummer,
        bedriftId: duplicate.bedriftId,
        count: duplicate._count.id,
        kontrakter
      });
    }

    return result;
  }

  /**
   * Bulk oppdater status
   */
  async bulkUpdateStatus(
    kontraktIds: number[],
    newStatus: KontraktStatus
  ): Promise<{ count: number }> {
    return this.updateMany(
      { id: { in: kontraktIds } },
      { status: newStatus }
    );
  }
} 