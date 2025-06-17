/**
 * Tenant Service
 * 
 * Håndterer multi-tenancy operasjoner
 * - Tenant CRUD operasjoner
 * - Bruker-tenant relasjoner
 * - Rolle-basert tilgangskontroll
 * - Tenant-switching
 */

import { PrismaClient, Tenant, UserTenant, TenantRolle, TenantPlan, GlobalRolle } from '@prisma/client';
import { BaseService } from './base.service';
import logger from '../utils/logger';

export interface CreateTenantData {
  navn: string;
  slug: string;
  domain?: string;
  logo?: string;
  settings?: any;
  plan?: TenantPlan;
  opprettetAvUserId: number;
}

export interface InviteUserToTenantData {
  userId: number;
  tenantId: number;
  rolle: TenantRolle;
  invitedBy: number;
}

export interface TenantWithUsers extends Tenant {
  userTenants: (UserTenant & {
    user: {
      id: number;
      navn: string;
      epost: string;
    };
  })[];
  _count: {
    bedrifter: number;
    userTenants: number;
  };
}

export class TenantService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Opprett ny tenant
   */
  async opprettTenant(data: CreateTenantData): Promise<Tenant> {
    try {
      // Sjekk om slug er unik
      const eksisterendeTenant = await this.prisma.tenant.findUnique({
        where: { slug: data.slug }
      });

      if (eksisterendeTenant) {
        throw new Error('Tenant slug er allerede i bruk');
      }

      // Opprett tenant
      const tenant = await this.prisma.tenant.create({
        data: {
          navn: data.navn,
          slug: data.slug,
          domain: data.domain,
          logo: data.logo,
          settings: data.settings || {},
          plan: data.plan || 'BASIC',
          userTenants: {
            create: {
              userId: data.opprettetAvUserId,
              rolle: 'TENANT_ADMIN',
              acceptedAt: new Date()
            }
          }
        },
        include: {
          userTenants: {
            include: {
              user: {
                select: {
                  id: true,
                  navn: true,
                  epost: true
                }
              }
            }
          }
        }
      });

      logger.info('Tenant opprettet', {
        tenantId: tenant.id,
        navn: tenant.navn,
        opprettetAv: data.opprettetAvUserId
      });

      return tenant;
    } catch (error) {
      logger.error('Feil ved opprettelse av tenant', error);
      throw error;
    }
  }

  /**
   * Hent alle tenants for bruker
   */
  async hentTenantsForBruker(userId: number): Promise<TenantWithUsers[]> {
    try {
      const userTenants = await this.prisma.userTenant.findMany({
        where: {
          userId,
          aktiv: true
        },
        include: {
          tenant: {
            include: {
              userTenants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      navn: true,
                      epost: true
                    }
                  }
                }
              },
              _count: {
                select: {
                  bedrifter: true,
                  userTenants: true
                }
              }
            }
          }
        }
      });

      return userTenants.map(ut => ut.tenant);
    } catch (error) {
      logger.error('Feil ved henting av tenants for bruker', error);
      throw error;
    }
  }

  /**
   * Hent tenant med detaljer
   */
  async hentTenant(tenantId: number): Promise<TenantWithUsers | null> {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          userTenants: {
            include: {
              user: {
                select: {
                  id: true,
                  navn: true,
                  epost: true
                }
              }
            }
          },
          _count: {
            select: {
              bedrifter: true,
              userTenants: true
            }
          }
        }
      });

      return tenant;
    } catch (error) {
      logger.error('Feil ved henting av tenant', error);
      throw error;
    }
  }

  /**
   * Inviter bruker til tenant
   */
  async inviterBrukerTilTenant(data: InviteUserToTenantData): Promise<UserTenant> {
    try {
      // Sjekk om bruker allerede er medlem
      const eksisterendeRelasjon = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: data.userId,
            tenantId: data.tenantId
          }
        }
      });

      if (eksisterendeRelasjon) {
        throw new Error('Bruker er allerede medlem av denne tenant');
      }

      const userTenant = await this.prisma.userTenant.create({
        data: {
          userId: data.userId,
          tenantId: data.tenantId,
          rolle: data.rolle,
          invitedBy: data.invitedBy
        },
        include: {
          user: {
            select: {
              id: true,
              navn: true,
              epost: true
            }
          },
          tenant: {
            select: {
              id: true,
              navn: true
            }
          }
        }
      });

      logger.info('Bruker invitert til tenant', {
        userId: data.userId,
        tenantId: data.tenantId,
        rolle: data.rolle,
        invitedBy: data.invitedBy
      });

      return userTenant;
    } catch (error) {
      logger.error('Feil ved invitasjon til tenant', error);
      throw error;
    }
  }

  /**
   * Aksepter invitasjon til tenant
   */
  async aksepterInvitasjon(userId: number, tenantId: number): Promise<UserTenant> {
    try {
      const userTenant = await this.prisma.userTenant.update({
        where: {
          userId_tenantId: {
            userId,
            tenantId
          }
        },
        data: {
          acceptedAt: new Date(),
          aktiv: true
        },
        include: {
          user: {
            select: {
              id: true,
              navn: true,
              epost: true
            }
          },
          tenant: {
            select: {
              id: true,
              navn: true
            }
          }
        }
      });

      logger.info('Invitasjon akseptert', {
        userId,
        tenantId
      });

      return userTenant;
    } catch (error) {
      logger.error('Feil ved akseptering av invitasjon', error);
      throw error;
    }
  }

  /**
   * Sjekk om bruker har tilgang til tenant
   */
  async harTilgangTilTenant(
    userId: number, 
    tenantId: number, 
    minimumRolle?: TenantRolle
  ): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) return false;

      // System admins har tilgang til alt
      if (user.globalRole === 'SYSTEM_ADMIN' || user.globalRole === 'PLATFORM_ADMIN') {
        return true;
      }

      const userTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId,
            tenantId
          }
        }
      });

      if (!userTenant || !userTenant.aktiv || !userTenant.acceptedAt) {
        return false;
      }

      // Hvis minimum rolle er spesifisert, sjekk det
      if (minimumRolle) {
        return this.harRollePåEllerOver(userTenant.rolle, minimumRolle);
      }

      return true;
    } catch (error) {
      logger.error('Feil ved sjekk av tenant tilgang', error);
      return false;
    }
  }

  /**
   * Oppdater bruker rolle i tenant
   */
  async oppdaterBrukerRolle(
    userId: number,
    tenantId: number,
    nyRolle: TenantRolle,
    oppdatertAv: number
  ): Promise<UserTenant> {
    try {
      const userTenant = await this.prisma.userTenant.update({
        where: {
          userId_tenantId: {
            userId,
            tenantId
          }
        },
        data: {
          rolle: nyRolle
        }
      });

      logger.info('Bruker rolle oppdatert', {
        userId,
        tenantId,
        nyRolle,
        oppdatertAv
      });

      return userTenant;
    } catch (error) {
      logger.error('Feil ved oppdatering av bruker rolle', error);
      throw error;
    }
  }

  /**
   * Fjern bruker fra tenant
   */
  async fjernBrukerFraTenant(
    userId: number,
    tenantId: number,
    fjernetAv: number
  ): Promise<void> {
    try {
      await this.prisma.userTenant.delete({
        where: {
          userId_tenantId: {
            userId,
            tenantId
          }
        }
      });

      logger.info('Bruker fjernet fra tenant', {
        userId,
        tenantId,
        fjernetAv
      });
    } catch (error) {
      logger.error('Feil ved fjerning av bruker fra tenant', error);
      throw error;
    }
  }

  /**
   * Hjelpemetode for rolle-hierarki sjekk
   */
  private harRollePåEllerOver(brukerRolle: TenantRolle, minimumRolle: TenantRolle): boolean {
    const rolleHierarki: Record<TenantRolle, number> = {
      'VIEWER': 1,
      'INSTRUCTOR': 2,
      'BEDRIFT_LEDER': 3,
      'BEDRIFT_ADMIN': 4,
      'TENANT_MANAGER': 5,
      'TENANT_ADMIN': 6,
      'SUPER_ADMIN': 7
    };

    return rolleHierarki[brukerRolle] >= rolleHierarki[minimumRolle];
  }

  /**
   * Soft delete tenant
   */
  async slettTenant(tenantId: number, slettetAv: number): Promise<void> {
    try {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: slettetAv,
          aktiv: false
        }
      });

      logger.info('Tenant slettet', {
        tenantId,
        slettetAv
      });
    } catch (error) {
      logger.error('Feil ved sletting av tenant', error);
      throw error;
    }
  }
} 