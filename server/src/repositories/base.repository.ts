import { PrismaClient } from '@prisma/client';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export abstract class BaseRepository<T, TCreateInput, TUpdateInput, TWhereInput = any> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Henter model delegat fra Prisma
   */
  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  /**
   * Opprett ny entitet
   */
  async create(data: TCreateInput, include?: any): Promise<T> {
    return await this.model.create({
      data,
      ...(include && { include })
    });
  }

  /**
   * Finn entitet med ID
   */
  async findById(id: number | string, include?: any): Promise<T | null> {
    return await this.model.findUnique({
      where: { id },
      ...(include && { include })
    });
  }

  /**
   * Finn første entitet som matcher kriterier
   */
  async findFirst(where: TWhereInput, include?: any): Promise<T | null> {
    return await this.model.findFirst({
      where,
      ...(include && { include })
    });
  }

  /**
   * Finn alle entiteter som matcher kriterier
   */
  async findMany(
    where?: TWhereInput,
    options?: {
      include?: any;
      orderBy?: any;
      take?: number;
      skip?: number;
    }
  ): Promise<T[]> {
    return await this.model.findMany({
      ...(where && { where }),
      ...options
    });
  }

  /**
   * Finn entiteter med paginering
   */
  async findManyPaginated(
    where: TWhereInput,
    pagination: PaginationOptions,
    options?: {
      include?: any;
      orderBy?: any;
    }
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Tell total antall
    const totalCount = await this.model.count({ where });

    // Hent data
    const data = await this.model.findMany({
      where,
      skip,
      take: limit,
      ...options
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      totalCount,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }

  /**
   * Oppdater entitet
   */
  async update(
    id: number | string,
    data: TUpdateInput,
    include?: any
  ): Promise<T> {
    return await this.model.update({
      where: { id },
      data,
      ...(include && { include })
    });
  }

  /**
   * Oppdater entitet med vilkår
   */
  async updateWhere(
    where: TWhereInput,
    data: TUpdateInput,
    include?: any
  ): Promise<T> {
    return await this.model.update({
      where,
      data,
      ...(include && { include })
    });
  }

  /**
   * Slett entitet
   */
  async delete(id: number | string): Promise<T> {
    return await this.model.delete({
      where: { id }
    });
  }

  /**
   * Slett entitet med vilkår
   */
  async deleteWhere(where: TWhereInput): Promise<T> {
    return await this.model.delete({ where });
  }

  /**
   * Tell antall entiteter som matcher kriterier
   */
  async count(where?: TWhereInput): Promise<number> {
    return await this.model.count({
      ...(where && { where })
    });
  }

  /**
   * Sjekk om entitet eksisterer
   */
  async exists(where: TWhereInput): Promise<boolean> {
    const count = await this.model.count({ where });
    return count > 0;
  }

  /**
   * Upsert (opprett eller oppdater)
   */
  async upsert(
    where: TWhereInput,
    create: TCreateInput,
    update: TUpdateInput,
    include?: any
  ): Promise<T> {
    return await this.model.upsert({
      where,
      create,
      update,
      ...(include && { include })
    });
  }

  /**
   * Bulk opprett
   */
  async createMany(data: TCreateInput[]): Promise<{ count: number }> {
    return await this.model.createMany({ data });
  }

  /**
   * Bulk oppdater
   */
  async updateMany(where: TWhereInput, data: TUpdateInput): Promise<{ count: number }> {
    return await this.model.updateMany({ where, data });
  }

  /**
   * Bulk slett
   */
  async deleteMany(where: TWhereInput): Promise<{ count: number }> {
    return await this.model.deleteMany({ where });
  }

  /**
   * Aggregering operasjoner
   */
  async aggregate(aggregation: any): Promise<any> {
    return await this.model.aggregate(aggregation);
  }

  /**
   * Group by operasjoner
   */
  async groupBy(params: any): Promise<any> {
    return await this.model.groupBy(params);
  }

  /**
   * Transaksjoner
   */
  async transaction<R>(fn: (prisma: any) => Promise<R>): Promise<R> {
    return await this.prisma.$transaction(fn);
  }
} 