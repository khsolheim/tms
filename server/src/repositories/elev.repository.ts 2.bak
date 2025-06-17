import { PrismaClient, Elev, Prisma, ElevStatus } from '@prisma/client';
import { BaseRepository, PaginationOptions, PaginationResult } from './base.repository';

export interface ElevCreateInput {
  fornavn: string;
  etternavn: string;
  telefon: string;
  epost: string;
  gate: string;
  postnummer: string;
  poststed: string;
  personnummer: string;
  klassekode: string;
  larer?: string;
  status?: ElevStatus;
  bedriftId: number;
}

export interface ElevUpdateInput {
  fornavn?: string;
  etternavn?: string;
  telefon?: string;
  epost?: string;
  gate?: string;
  postnummer?: string;
  poststed?: string;
  personnummer?: string;
  klassekode?: string;
  larer?: string;
  status?: ElevStatus;
  bedriftId?: number;
  sistInnlogget?: Date;
  oppdatert?: Date;
}

export interface ElevSearchFilters {
  fornavn?: string;
  etternavn?: string;
  epost?: string;
  personnummer?: string;
  klassekode?: string;
  larer?: string;
  status?: ElevStatus;
  bedriftId?: number;
  fraDato?: Date;
  tilDato?: Date;
  sistInnloggetFra?: Date;
  sistInnloggetTil?: Date;
}

export class ElevRepository extends BaseRepository<
  Elev,
  ElevCreateInput,
  ElevUpdateInput,
  Prisma.ElevWhereInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'elev');
  }

  /**
   * Finn elev ved personnummer
   */
  async findByPersonnummer(personnummer: string): Promise<Elev | null> {
    return this.findFirst(
      { personnummer },
      {
        bedrift: {
          select: { 
            id: true, 
            navn: true, 
            organisasjonsnummer: true 
          }
        },
        _count: {
          select: {
            kontrakter: true
          }
        }
      }
    );
  }

  /**
   * Finn elev ved e-post
   */
  async findByEpost(epost: string): Promise<Elev | null> {
    return this.findFirst(
      { epost },
      {
        bedrift: {
          select: { 
            id: true, 
            navn: true 
          }
        }
      }
    );
  }

  /**
   * Finn elever med avanserte søkefiltre
   */
  async findWithFilters(
    filters: ElevSearchFilters,
    pagination?: PaginationOptions,
    orderBy?: Prisma.ElevOrderByWithRelationInput[]
  ): Promise<PaginationResult<Elev> | Elev[]> {
    const where: Prisma.ElevWhereInput = {};

    if (filters.fornavn) {
      where.fornavn = {
        contains: filters.fornavn,
        mode: 'insensitive'
      };
    }

    if (filters.etternavn) {
      where.etternavn = {
        contains: filters.etternavn,
        mode: 'insensitive'
      };
    }

    if (filters.epost) {
      where.epost = {
        contains: filters.epost,
        mode: 'insensitive'
      };
    }

    if (filters.personnummer) {
      where.personnummer = {
        contains: filters.personnummer.replace(/\s/g, ''),
        mode: 'insensitive'
      };
    }

    if (filters.klassekode) {
      where.klassekode = {
        contains: filters.klassekode,
        mode: 'insensitive'
      };
    }

    if (filters.larer) {
      where.larer = {
        contains: filters.larer,
        mode: 'insensitive'
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.bedriftId) {
      where.bedriftId = filters.bedriftId;
    }

    if (filters.fraDato || filters.tilDato) {
      where.opprettet = {};
      if (filters.fraDato) {
        where.opprettet.gte = filters.fraDato;
      }
      if (filters.tilDato) {
        where.opprettet.lte = filters.tilDato;
      }
    }

    if (filters.sistInnloggetFra || filters.sistInnloggetTil) {
      where.sistInnlogget = {};
      if (filters.sistInnloggetFra) {
        where.sistInnlogget.gte = filters.sistInnloggetFra;
      }
      if (filters.sistInnloggetTil) {
        where.sistInnlogget.lte = filters.sistInnloggetTil;
      }
    }

    const include = {
      bedrift: {
        select: { 
          id: true, 
          navn: true, 
          organisasjonsnummer: true 
        }
      },
      _count: {
        select: {
          kontrakter: true
        }
      }
    };

    if (pagination) {
      return this.findManyPaginated(where, pagination, {
        include,
        orderBy: orderBy || [{ fornavn: 'asc' }, { etternavn: 'asc' }]
      });
    }

    return this.findMany(where, {
      include,
      orderBy: orderBy || [{ fornavn: 'asc' }, { etternavn: 'asc' }]
    });
  }

  /**
   * Finn alle elever for en bedrift
   */
  async findByBedrift(
    bedriftId: number,
    pagination?: PaginationOptions
  ): Promise<PaginationResult<Elev> | Elev[]> {
    const where = { bedriftId };
    const include = {
      _count: {
        select: {
          kontrakter: true
        }
      }
    };

    if (pagination) {
      return this.findManyPaginated(where, pagination, {
        include,
        orderBy: [{ status: 'asc' }, { fornavn: 'asc' }]
      });
    }

    return this.findMany(where, {
      include,
      orderBy: [{ status: 'asc' }, { fornavn: 'asc' }]
    });
  }

  /**
   * Finn elever med spesifikk status
   */
  async findByStatus(
    status: ElevStatus,
    bedriftId?: number
  ): Promise<Elev[]> {
    const where: Prisma.ElevWhereInput = { status };
    
    if (bedriftId) {
      where.bedriftId = bedriftId;
    }

    return this.findMany(where, {
      include: {
        bedrift: {
          select: { navn: true }
        },
        _count: {
          select: {
            kontrakter: true
          }
        }
      },
      orderBy: [{ opprettet: 'desc' }]
    });
  }

  /**
   * Finn elever i en klasse
   */
  async findByKlasse(
    klassekode: string,
    bedriftId?: number
  ): Promise<Elev[]> {
    const where: Prisma.ElevWhereInput = { klassekode };
    
    if (bedriftId) {
      where.bedriftId = bedriftId;
    }

    return this.findMany(where, {
      include: {
        _count: {
          select: {
            kontrakter: true
          }
        }
      },
      orderBy: [{ fornavn: 'asc' }, { etternavn: 'asc' }]
    });
  }

  /**
   * Finn elever med lærer
   */
  async findByLarer(
    larer: string,
    bedriftId?: number
  ): Promise<Elev[]> {
    const where: Prisma.ElevWhereInput = { 
      larer: {
        contains: larer,
        mode: 'insensitive'
      }
    };
    
    if (bedriftId) {
      where.bedriftId = bedriftId;
    }

    return this.findMany(where, {
      include: {
        bedrift: {
          select: { navn: true }
        }
      },
      orderBy: [{ fornavn: 'asc' }, { etternavn: 'asc' }]
    });
  }

  /**
   * Søk elever med tekstsøk
   */
  async search(
    searchTerm: string,
    bedriftId?: number,
    pagination?: PaginationOptions
  ): Promise<PaginationResult<Elev> | Elev[]> {
    const where: Prisma.ElevWhereInput = {
      OR: [
        {
          fornavn: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          etternavn: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          epost: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          personnummer: {
            contains: searchTerm.replace(/\s/g, ''),
            mode: 'insensitive'
          }
        },
        {
          klassekode: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        }
      ]
    };

    if (bedriftId) {
      where.bedriftId = bedriftId;
    }

    const include = {
      bedrift: {
        select: { 
          id: true, 
          navn: true 
        }
      },
      _count: {
        select: {
          kontrakter: true
        }
      }
    };

    if (pagination) {
      return this.findManyPaginated(where, pagination, {
        include,
        orderBy: [{ fornavn: 'asc' }, { etternavn: 'asc' }]
      });
    }

    return this.findMany(where, {
      include,
      orderBy: [{ fornavn: 'asc' }, { etternavn: 'asc' }]
    });
  }

  /**
   * Valider unik e-post
   */
  async isEpostUnique(epost: string, excludeId?: number): Promise<boolean> {
    const where: Prisma.ElevWhereInput = { epost };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.count(where);
    return count === 0;
  }

  /**
   * Valider unikt personnummer
   */
  async isPersonnummerUnique(personnummer: string, excludeId?: number): Promise<boolean> {
    const where: Prisma.ElevWhereInput = { personnummer };
    
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.count(where);
    return count === 0;
  }

  /**
   * Oppdater siste innlogging
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.update(id, {
      sistInnlogget: new Date(),
      oppdatert: new Date()
    });
  }

  /**
   * Hent statistikk for elever
   */
  async getStatistics(bedriftId?: number): Promise<{
    total: number;
    aktive: number;
    inaktive: number;
    pending: number;
    totalKontrakter: number;
    gjennomsnittligKontrakterPerElev: number;
    klassefordeling: Array<{
      klassekode: string;
      antall: number;
    }>;
    statusfordeling: Array<{
      status: ElevStatus;
      antall: number;
    }>;
  }> {
    const where: Prisma.ElevWhereInput = bedriftId ? { bedriftId } : {};

    const [total, aktive, inaktive, pending, kontraktStats] = await Promise.all([
      this.count(where),
      this.count({ ...where, status: 'AKTIV' }),
      this.count({ ...where, status: 'INAKTIV' }),
      this.count({ ...where, status: 'PENDING' }),
      this.prisma.kontrakt.count({ 
        where: bedriftId ? { bedriftId } : {} 
      })
    ]);

    // Klassefordeling
    const klasseStats = await this.groupBy({
      where,
      by: ['klassekode'],
      _count: {
        id: true
      },
      orderBy: {
        klassekode: 'asc'
      }
    });

    const klassefordeling = klasseStats.map((stat: any) => ({
      klassekode: stat.klassekode,
      antall: stat._count.id
    }));

    // Statusfordeling
    const statusStats = await this.groupBy({
      where,
      by: ['status'],
      _count: {
        id: true
      }
    });

    const statusfordeling = statusStats.map((stat: any) => ({
      status: stat.status,
      antall: stat._count.id
    }));

    return {
      total,
      aktive,
      inaktive,
      pending,
      totalKontrakter: kontraktStats,
      gjennomsnittligKontrakterPerElev: total > 0 ? kontraktStats / total : 0,
      klassefordeling,
      statusfordeling
    };
  }

  /**
   * Finn elever som trenger oppfølging
   */
  async findRequiringAttention(): Promise<Elev[]> {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return this.findMany(
      {
        OR: [
          // Elever med PENDING status
          { status: 'PENDING' },
          // Elever som ikke har logget inn på lenge
          { 
            status: 'AKTIV',
            sistInnlogget: { 
              lt: oneMonthAgo 
            }
          },
          // Elever uten kontrakter
          {
            status: 'AKTIV',
            kontrakter: { 
              none: {} 
            }
          }
        ]
      },
      {
        include: {
          bedrift: {
            select: { navn: true, epost: true }
          },
          _count: {
            select: {
              kontrakter: true
            }
          }
        },
        orderBy: [{ opprettet: 'desc' }]
      }
    );
  }

  /**
   * Bulk oppdater status
   */
  async bulkUpdateStatus(
    elevIds: number[],
    newStatus: ElevStatus
  ): Promise<{ count: number }> {
    return this.updateMany(
      { id: { in: elevIds } },
      { status: newStatus, oppdatert: new Date() }
    );
  }

  /**
   * Finn duplikate personnummer
   */
  async findDuplicatePersonnummer(): Promise<Array<{
    personnummer: string;
    count: number;
    elever: Elev[];
  }>> {
    // Group by for å finne duplikater
    const duplicates = await this.groupBy({
      by: ['personnummer'],
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

    // Hent faktiske elever for hver duplikat personnummer
    const result = [];
    for (const duplicate of duplicates) {
      const elever = await this.findMany({
        personnummer: duplicate.personnummer
      });

      result.push({
        personnummer: duplicate.personnummer,
        count: duplicate._count.id,
        elever
      });
    }

    return result;
  }

  /**
   * Finn duplikate e-post adresser
   */
  async findDuplicateEmails(): Promise<Array<{
    epost: string;
    count: number;
    elever: Elev[];
  }>> {
    // Group by for å finne duplikater
    const duplicates = await this.groupBy({
      by: ['epost'],
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

    // Hent faktiske elever for hver duplikat e-post
    const result = [];
    for (const duplicate of duplicates) {
      const elever = await this.findMany({
        epost: duplicate.epost
      });

      result.push({
        epost: duplicate.epost,
        count: duplicate._count.id,
        elever
      });
    }

    return result;
  }
} 