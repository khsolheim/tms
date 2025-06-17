import { PrismaClient, Prisma } from '@prisma/client';
import logger from '../utils/logger';

export abstract class BaseService {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Clean shutdown - close database connection
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * Execute in transaction
   */
  async withTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  /**
   * Pagination helper
   */
  protected calculatePagination(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 items per page
    
    return { skip, take };
  }

  /**
   * Calculate pagination metadata
   */
  protected getPaginationMeta(totalCount: number, page: number, limit: number) {
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
} 