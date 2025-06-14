import { PrismaClient, Ansatt, Prisma, AnsattRolle } from '@prisma/client';
import { BaseRepository, PaginationOptions, PaginationResult } from './base.repository';

export interface AnsattCreateInput {
  fornavn: string;
  etternavn: string;
  epost: string;
  passordHash: string;
  telefon?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  rolle?: AnsattRolle;
  klasser?: string[];
  kjøretøy?: number[];
  hovedkjøretøy?: number;
  bedriftId?: number;
  tilganger?: string[];
  varslingsinnstillinger?: any;
}

export interface AnsattUpdateInput {
  fornavn?: string;
  etternavn?: string;
  epost?: string;
  passordHash?: string;
  telefon?: string;
  adresse?: string;
  postnummer?: string;
  poststed?: string;
  rolle?: AnsattRolle;
  klasser?: string[];
  kjøretøy?: number[];
  hovedkjøretøy?: number;
  bedriftId?: number;
  tilganger?: string[];
  varslingsinnstillinger?: any;
  oppdatert?: Date;
}

export interface AnsattSearchFilters {
  fornavn?: string;
  etternavn?: string;
  epost?: string;
  rolle?: AnsattRolle;
  bedriftId?: number;
  harBedrift?: boolean;
  aktiv?: boolean;
  fraDato?: Date;
  tilDato?: Date;
  klasser?: string[];
  tilganger?: string[];
}

export class AnsattRepository extends BaseRepository<
  Ansatt,
  AnsattCreateInput,
  AnsattUpdateInput,
  Prisma.AnsattWhereInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'ansatt');
  }

  /**
   * Finn ansatt ved e-post (for autentisering)
   */
  async findByEpost(epost: string): Promise<Ansatt | null> {
    return this.findFirst(
      { epost },
      {
        bedrift: {
          select: { 
            id: true, 
            navn: true, 
            organisasjonsnummer: true 
          }
        },
        hovedbrukerFor: {
          select: { 
            id: true, 
            navn: true 
          }
        }
      }
    );
  }

  /**
   * Finn ansatte med avanserte søkefiltre
   */
  async findWithFilters(
    filters: AnsattSearchFilters,
    pagination?: PaginationOptions,
    orderBy?: Prisma.AnsattOrderByWithRelationInput[]
  ): Promise<PaginationResult<Ansatt> | Ansatt[]> {
    const where: Prisma.AnsattWhereInput = {};

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

    if (filters.rolle) {
      where.rolle = filters.rolle;
    }

    if (filters.bedriftId) {
      where.bedriftId = filters.bedriftId;
    }

    if (filters.harBedrift !== undefined) {
      where.bedriftId = filters.harBedrift 
        ? { not: null } 
        : null;
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

    if (filters.klasser && filters.klasser.length > 0) {
      where.klasser = {
        hasSome: filters.klasser
      };
    }

    if (filters.tilganger && filters.tilganger.length > 0) {
      where.tilganger = {
        hasSome: filters.tilganger
      };
    }

    const include = {
      bedrift: {
        select: { 
          id: true, 
          navn: true, 
          organisasjonsnummer: true 
        }
      },
      hovedbrukerFor: {
        select: { 
          id: true, 
          navn: true 
        }
      },
      _count: {
        select: {
          opprettedeKontrollMaler: true,
          opprettedeSikkerhetskontroller: true,
          opprettedeKontrakter: true
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
   * Finn alle ansatte for en bedrift
   */
  async findByBedrift(
    bedriftId: number,
    pagination?: PaginationOptions
  ): Promise<PaginationResult<Ansatt> | Ansatt[]> {
    const where = { bedriftId };
    const include = {
      _count: {
        select: {
          opprettedeKontrakter: true,
          opprettedeKontrollMaler: true
        }
      }
    };

    if (pagination) {
      return this.findManyPaginated(where, pagination, {
        include,
        orderBy: [{ rolle: 'asc' }, { fornavn: 'asc' }]
      });
    }

    return this.findMany(where, {
      include,
      orderBy: [{ rolle: 'asc' }, { fornavn: 'asc' }]
    });
  }

  /**
   * Finn ansatte med spesifikk rolle
   */
  async findByRolle(
    rolle: AnsattRolle,
    bedriftId?: number
  ): Promise<Ansatt[]> {
    const where: Prisma.AnsattWhereInput = { rolle };
    
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
   * Finn hovedbrukere
   */
  async findHovedbrukere(): Promise<Ansatt[]> {
    return this.findMany(
      {
        hovedbrukerFor: {
          isNot: null
        }
      },
      {
        include: {
          hovedbrukerFor: {
            select: { 
              id: true, 
              navn: true, 
              organisasjonsnummer: true 
            }
          },
          bedrift: {
            select: { 
              id: true, 
              navn: true 
            }
          }
        },
        orderBy: [{ fornavn: 'asc' }, { etternavn: 'asc' }]
      }
    );
  }

  /**
   * Søk ansatte med tekstsøk
   */
  async search(
    searchTerm: string,
    bedriftId?: number,
    pagination?: PaginationOptions
  ): Promise<PaginationResult<Ansatt> | Ansatt[]> {
    const where: Prisma.AnsattWhereInput = {
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
          opprettedeKontrakter: true
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
    const where: Prisma.AnsattWhereInput = { epost };
    
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
      oppdatert: new Date()
    });
  }

  /**
   * Hent statistikk for ansatte
   */
  async getStatistics(bedriftId?: number): Promise<{
    total: number;
    hovedbrukere: number;
    trafikklarere: number;
    admins: number;
    medBedrift: number;
    utenBedrift: number;
    aktivitetsstatistikk: {
      totalKontrakter: number;
      totalKontrollMaler: number;
      totalSikkerhetskontroller: number;
    };
  }> {
    const where: Prisma.AnsattWhereInput = bedriftId ? { bedriftId } : {};

    const [total, hovedbrukere, trafikklarere, admins, medBedrift, utenBedrift] = await Promise.all([
      this.count(where),
      this.count({ ...where, rolle: 'HOVEDBRUKER' }),
      this.count({ ...where, rolle: 'TRAFIKKLARER' }),
      this.count({ ...where, rolle: 'ADMIN' }),
      this.count({ ...where, bedriftId: { not: null } }),
      this.count({ ...where, bedriftId: null })
    ]);

    // Aktivitetsstatistikk
    const aktivitetsStats = await this.aggregate({
      where,
      _count: {
        opprettedeKontrakter: true,
        opprettedeKontrollMaler: true,
        opprettedeSikkerhetskontroller: true
      }
    });

    return {
      total,
      hovedbrukere,
      trafikklarere,
      admins,
      medBedrift,
      utenBedrift,
      aktivitetsstatistikk: {
        totalKontrakter: aktivitetsStats._count.opprettedeKontrakter || 0,
        totalKontrollMaler: aktivitetsStats._count.opprettedeKontrollMaler || 0,
        totalSikkerhetskontroller: aktivitetsStats._count.opprettedeSikkerhetskontroller || 0
      }
    };
  }

  /**
   * Finn ansatte som trenger oppfølging
   */
  async findRequiringAttention(): Promise<Ansatt[]> {
    return this.findMany(
      {
        OR: [
          // Ansatte uten bedrift
          { bedriftId: null },
          // Ansatte som ikke har logget inn på lenge (kunne implementeres med sistInnlogget felt)
          // { sistInnlogget: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        ]
      },
      {
        include: {
          bedrift: {
            select: { navn: true }
          },
          _count: {
            select: {
              opprettedeKontrakter: true
            }
          }
        },
        orderBy: [{ opprettet: 'desc' }]
      }
    );
  }

  /**
   * Bulk oppdater rolle
   */
  async bulkUpdateRolle(
    ansattIds: number[],
    newRolle: AnsattRolle
  ): Promise<{ count: number }> {
    return this.updateMany(
      { id: { in: ansattIds } },
      { rolle: newRolle }
    );
  }

  /**
   * Finn duplikate e-post adresser
   */
  async findDuplicateEmails(): Promise<Array<{
    epost: string;
    count: number;
    ansatte: Ansatt[];
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

    // Hent faktiske ansatte for hver duplikat e-post
    const result = [];
    for (const duplicate of duplicates) {
      const ansatte = await this.findMany({
        epost: duplicate.epost
      });

      result.push({
        epost: duplicate.epost,
        count: duplicate._count.id,
        ansatte
      });
    }

    return result;
  }
} 