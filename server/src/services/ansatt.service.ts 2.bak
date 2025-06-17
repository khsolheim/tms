import { Ansatt, Bedrift } from '@prisma/client';
import { AuthenticationService, LoginRequest, LoginResponse } from './auth/AuthenticationService';
import { AnsattManagementService, AnsattCreateData, AnsattUpdateData, AnsattFilters } from './ansatt/AnsattManagementService';
import logger from '../utils/logger';

/**
 * Refaktorert AnsattService som bruker modulære tjenester
 * 
 * Denne klassen fungerer som en facade som delegerer til spesialiserte tjenester:
 * - AuthenticationService: Håndterer innlogging, passordendring, impersonering
 * - AnsattManagementService: Håndterer CRUD operasjoner for ansatte
 */
export class AnsattService {
  private authService: AuthenticationService;
  private managementService: AnsattManagementService;

  constructor() {
    this.authService = new AuthenticationService();
    this.managementService = new AnsattManagementService();
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Autentiser bruker med e-post og passord
   */
  async autentiserBruker(credentials: LoginRequest): Promise<LoginResponse> {
    logger.debug('AnsattService.autentiserBruker delegerer til AuthenticationService');
    return this.authService.autentiserBruker(credentials);
  }

  /**
   * Endre passord for bruker
   */
  async endrePassord(ansattId: number, gammeltPassord: string, nyttPassord: string): Promise<void> {
    logger.debug('AnsattService.endrePassord delegerer til AuthenticationService');
    return this.authService.endrePassord(ansattId, gammeltPassord, nyttPassord);
  }

  /**
   * Start impersonering (admin funksjon)
   */
  async startImpersonering(targetUserId: number, adminId: number): Promise<LoginResponse> {
    logger.debug('AnsattService.startImpersonering delegerer til AuthenticationService');
    return this.authService.startImpersonering(targetUserId, adminId);
  }

  /**
   * Stopp impersonering
   */
  async stoppImpersonering(originalUserId: number): Promise<LoginResponse> {
    logger.debug('AnsattService.stoppImpersonering delegerer til AuthenticationService');
    return this.authService.stoppImpersonering(originalUserId);
  }

  // ============================================================================
  // EMPLOYEE MANAGEMENT METHODS
  // ============================================================================

  /**
   * Hent ansatt profil
   */
  async hentProfil(ansattId: number): Promise<Ansatt & { bedrift: Bedrift | null }> {
    logger.debug('AnsattService.hentProfil delegerer til AnsattManagementService');
    return this.managementService.hentProfil(ansattId);
  }

  /**
   * Opprett ny ansatt
   */
  async opprettAnsatt(data: AnsattCreateData): Promise<Ansatt> {
    logger.debug('AnsattService.opprettAnsatt delegerer til AnsattManagementService');
    return this.managementService.opprettAnsatt(data);
  }

  /**
   * Oppdater ansatt
   */
  async oppdaterAnsatt(
    ansattId: number,
    data: AnsattUpdateData,
    oppdatertAv: number,
    oppdatererId?: number
  ): Promise<Ansatt> {
    logger.debug('AnsattService.oppdaterAnsatt delegerer til AnsattManagementService');
    return this.managementService.oppdaterAnsatt(ansattId, data, oppdatertAv, oppdatererId);
  }

  /**
   * Slett ansatt
   */
  async slettAnsatt(ansattId: number, slettetAv: number, sletterId?: number): Promise<void> {
    logger.debug('AnsattService.slettAnsatt delegerer til AnsattManagementService');
    return this.managementService.slettAnsatt(ansattId, slettetAv, sletterId);
  }

  /**
   * Hent ansatte for bedrift
   */
  async hentAnsatteForBedrift(bedriftId: number, requesterId: number): Promise<any[]> {
    logger.debug('AnsattService.hentAnsatteForBedrift delegerer til AnsattManagementService');
    return this.managementService.hentAnsatteForBedrift(bedriftId, requesterId);
  }

  /**
   * Hent alle brukere (admin funksjon)
   */
  async hentAlleBrukere(requesterId: number): Promise<(Ansatt & { bedrift: Bedrift | null })[]> {
    logger.debug('AnsattService.hentAlleBrukere delegerer til AnsattManagementService');
    
    // For bakoverkompatibilitet - denne metoden var i original service
    const ansatte = await this.managementService.hentAnsatteForBedrift(0, requesterId);
    
    // Cast til forventet type (kan forbedres ved å oppdatere interface)
    return ansatte as (Ansatt & { bedrift: Bedrift | null })[];
  }

  /**
   * Oppdater tilganger
   */
  async oppdaterTilganger(ansattId: number, tilganger: string[], oppdatertAv: number): Promise<Ansatt> {
    logger.debug('AnsattService.oppdaterTilganger delegerer til AnsattManagementService');
    return this.managementService.oppdaterTilganger(ansattId, tilganger, oppdatertAv);
  }

  /**
   * Søk i ansatte
   */
  async sokAnsatte(sokeTerm: string, filters: AnsattFilters = {}): Promise<any[]> {
    logger.debug('AnsattService.sokAnsatte delegerer til AnsattManagementService');
    return this.managementService.sokAnsatte(sokeTerm, filters);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Cleanup metode for tjenesten
   */
  async cleanup(): Promise<void> {
    logger.info('AnsattService cleanup');
    // Cleanup av underliggende tjenester hvis nødvendig
  }

  /**
   * Health check for tjenesten
   */
  async healthCheck(): Promise<{ status: string; services: any }> {
    return {
      status: 'healthy',
      services: {
        authentication: 'ready',
        management: 'ready'
      }
    };
  }
}

// For bakoverkompatibilitet - eksporter også som default
export default AnsattService; 