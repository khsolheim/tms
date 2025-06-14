/**
 * BedriftService Tests
 * 
 * Omfattende tester for BedriftService med alle CRUD operasjoner,
 * valideringslogikk og edge cases
 */

import { PrismaClient } from '@prisma/client';
import { BedriftService } from '../../src/services/BedriftService';
import { logger } from '../setup';

// Mock Prisma
const mockPrisma = {
  bedrift: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  ansatt: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
} as unknown as PrismaClient;

describe('BedriftService', () => {
  let bedriftService: BedriftService;

  beforeEach(() => {
    // Reset alle mocks før hver test
    jest.clearAllMocks();
    
    // Opprett service instans med mock prisma
    bedriftService = new BedriftService(mockPrisma);
  });

  describe('hentAlleBedrifter', () => {
    it('skal returnere alle bedrifter uten filtre', async () => {
      // Arrange
      const mockBedrifter = [
        {
          id: 1,
          navn: 'Bedrift A',
          orgnummer: '123456789',
          kontaktperson: 'Test Person',
          telefon: '12345678',
          epost: 'test@bedrifta.no',
          adresse: 'Testveien 1',
          postnummer: '0001',
          poststed: 'Oslo',
          opprettet: new Date(),
          oppdatert: new Date(),
        },
        {
          id: 2,
          navn: 'Bedrift B',
          orgnummer: '987654321',
          kontaktperson: 'Test Person 2',
          telefon: '87654321',
          epost: 'test@bedriftb.no',
          adresse: 'Testveien 2',
          postnummer: '0002',
          poststed: 'Bergen',
          opprettet: new Date(),
          oppdatert: new Date(),
        },
      ];

      mockPrisma.bedrift.findMany.mockResolvedValue(mockBedrifter);

      // Act
      const result = await bedriftService.hentAlleBedrifter();

      // Assert
      expect(result).toEqual(mockBedrifter);
      expect(mockPrisma.bedrift.findMany).toHaveBeenCalledWith({
        orderBy: { navn: 'asc' }
      });
    });

    it('skal returnere bedrifter med søkefilter', async () => {
      // Arrange
      const søketerm = 'Bedrift A';
      const mockBedrifter = [
        {
          id: 1,
          navn: 'Bedrift A',
          orgnummer: '123456789',
          kontaktperson: 'Test Person',
          telefon: '12345678',
          epost: 'test@bedrifta.no',
          adresse: 'Testveien 1',
          postnummer: '0001',
          poststed: 'Oslo',
          opprettet: new Date(),
          oppdatert: new Date(),
        },
      ];

      mockPrisma.bedrift.findMany.mockResolvedValue(mockBedrifter);

      // Act
      const result = await bedriftService.hentAlleBedrifter({ søk: søketerm });

      // Assert
      expect(result).toEqual(mockBedrifter);
      expect(mockPrisma.bedrift.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { navn: { contains: søketerm, mode: 'insensitive' } },
            { orgnummer: { contains: søketerm } },
            { kontaktperson: { contains: søketerm, mode: 'insensitive' } },
          ]
        },
        orderBy: { navn: 'asc' }
      });
    });

    it('skal håndtere database feil gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockPrisma.bedrift.findMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(bedriftService.hentAlleBedrifter()).rejects.toThrow('Database connection failed');
    });
  });

  describe('hentBedrift', () => {
    it('skal returnere bedrift med gyldig ID', async () => {
      // Arrange
      const bedriftId = 1;
      const mockBedrift = {
        id: bedriftId,
        navn: 'Test Bedrift',
        orgnummer: '123456789',
        kontaktperson: 'Test Person',
        telefon: '12345678',
        epost: 'test@test.no',
        adresse: 'Testveien 1',
        postnummer: '0001',
        poststed: 'Oslo',
        opprettet: new Date(),
        oppdatert: new Date(),
        ansatte: [],
        kontrakter: [],
      };

      mockPrisma.bedrift.findUnique.mockResolvedValue(mockBedrift);

      // Act
      const result = await bedriftService.hentBedrift(bedriftId);

      // Assert
      expect(result).toEqual(mockBedrift);
      expect(mockPrisma.bedrift.findUnique).toHaveBeenCalledWith({
        where: { id: bedriftId },
        include: {
          ansatte: true,
          kontrakter: {
            include: {
              elev: true
            }
          }
        }
      });
    });

    it('skal returnere null for ikke-eksisterende bedrift', async () => {
      // Arrange
      const bedriftId = 999;
      mockPrisma.bedrift.findUnique.mockResolvedValue(null);

      // Act
      const result = await bedriftService.hentBedrift(bedriftId);

      // Assert
      expect(result).toBeNull();
    });

    it('skal kaste error for ugyldig ID format', async () => {
      // Arrange
      const ugyldigId = -1;

      // Act & Assert
      await expect(bedriftService.hentBedrift(ugyldigId)).rejects.toThrow('Ugyldig bedrift ID');
    });
  });

  describe('opprettBedrift', () => {
    const validBedriftData = {
      navn: 'Ny Bedrift',
      orgnummer: '123456789',
      kontaktperson: 'Kontakt Person',
      telefon: '12345678',
      epost: 'kontakt@nybedrift.no',
      adresse: 'Nyveien 1',
      postnummer: '0001',
      poststed: 'Oslo',
    };

    it('skal opprette ny bedrift med gyldig data', async () => {
      // Arrange
      const mockOpprettetBedrift = {
        id: 1,
        ...validBedriftData,
        opprettet: new Date(),
        oppdatert: new Date(),
      };

      mockPrisma.bedrift.findUnique.mockResolvedValue(null); // Ingen eksisterende bedrift
      mockPrisma.bedrift.create.mockResolvedValue(mockOpprettetBedrift);

      // Act
      const result = await bedriftService.opprettBedrift(validBedriftData);

      // Assert
      expect(result).toEqual(mockOpprettetBedrift);
      expect(mockPrisma.bedrift.findUnique).toHaveBeenCalledWith({
        where: { orgnummer: validBedriftData.orgnummer }
      });
      expect(mockPrisma.bedrift.create).toHaveBeenCalledWith({
        data: validBedriftData
      });
    });

    it('skal kaste error for duplikat orgnummer', async () => {
      // Arrange
      const eksisterendeBedrift = { id: 1, orgnummer: validBedriftData.orgnummer };
      mockPrisma.bedrift.findUnique.mockResolvedValue(eksisterendeBedrift);

      // Act & Assert
      await expect(bedriftService.opprettBedrift(validBedriftData)).rejects.toThrow(
        'Bedrift med orgnummer 123456789 eksisterer allerede'
      );
    });

    it('skal validere obligatoriske felter', async () => {
      // Arrange
      const ugyldigData = {
        navn: '', // Tomt navn
        orgnummer: validBedriftData.orgnummer,
        kontaktperson: validBedriftData.kontaktperson,
        telefon: validBedriftData.telefon,
        epost: validBedriftData.epost,
        adresse: validBedriftData.adresse,
        postnummer: validBedriftData.postnummer,
        poststed: validBedriftData.poststed,
      };

      // Act & Assert
      await expect(bedriftService.opprettBedrift(ugyldigData)).rejects.toThrow(
        'Navn er obligatorisk'
      );
    });

    it('skal validere orgnummer format', async () => {
      // Arrange
      const ugyldigData = {
        ...validBedriftData,
        orgnummer: '12345', // For kort orgnummer
      };

      // Act & Assert
      await expect(bedriftService.opprettBedrift(ugyldigData)).rejects.toThrow(
        'Orgnummer må være 9 siffer'
      );
    });

    it('skal validere epost format', async () => {
      // Arrange
      const ugyldigData = {
        ...validBedriftData,
        epost: 'ugyldig-epost', // Ugyldig epost format
      };

      // Act & Assert
      await expect(bedriftService.opprettBedrift(ugyldigData)).rejects.toThrow(
        'Ugyldig epost format'
      );
    });
  });

  describe('oppdaterBedrift', () => {
    const oppdateringsData = {
      navn: 'Oppdatert Bedrift',
      kontaktperson: 'Ny Kontakt',
      telefon: '87654321',
    };

    it('skal oppdatere eksisterende bedrift', async () => {
      // Arrange
      const bedriftId = 1;
      const mockOppdatertBedrift = {
        id: bedriftId,
        ...oppdateringsData,
        orgnummer: '123456789',
        epost: 'test@test.no',
        adresse: 'Testveien 1',
        postnummer: '0001',
        poststed: 'Oslo',
        opprettet: new Date(),
        oppdatert: new Date(),
      };

      mockPrisma.bedrift.findUnique.mockResolvedValue({ id: bedriftId });
      mockPrisma.bedrift.update.mockResolvedValue(mockOppdatertBedrift);

      // Act
      const result = await bedriftService.oppdaterBedrift(bedriftId, oppdateringsData);

      // Assert
      expect(result).toEqual(mockOppdatertBedrift);
      expect(mockPrisma.bedrift.update).toHaveBeenCalledWith({
        where: { id: bedriftId },
        data: {
          ...oppdateringsData,
          oppdatert: expect.any(Date),
        }
      });
    });

    it('skal kaste error for ikke-eksisterende bedrift', async () => {
      // Arrange
      const bedriftId = 999;
      mockPrisma.bedrift.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(bedriftService.oppdaterBedrift(bedriftId, oppdateringsData)).rejects.toThrow(
        'Bedrift med ID 999 finnes ikke'
      );
    });

    it('skal validere data ved oppdatering', async () => {
      // Arrange
      const bedriftId = 1;
      const ugyldigData = {
        epost: 'ugyldig-epost-format',
      };

      mockPrisma.bedrift.findUnique.mockResolvedValue({ id: bedriftId });

      // Act & Assert
      await expect(bedriftService.oppdaterBedrift(bedriftId, ugyldigData)).rejects.toThrow(
        'Ugyldig epost format'
      );
    });
  });

  describe('slettBedrift', () => {
    it('skal slette bedrift uten tilknyttede data', async () => {
      // Arrange
      const bedriftId = 1;
      mockPrisma.bedrift.findUnique.mockResolvedValue({ 
        id: bedriftId,
        _count: { ansatte: 0, kontrakter: 0 }
      });
      mockPrisma.bedrift.delete.mockResolvedValue({ id: bedriftId });

      // Act
      const result = await bedriftService.slettBedrift(bedriftId);

      // Assert
      expect(result).toBe(true);
      expect(mockPrisma.bedrift.delete).toHaveBeenCalledWith({
        where: { id: bedriftId }
      });
    });

    it('skal ikke slette bedrift med tilknyttede ansatte', async () => {
      // Arrange
      const bedriftId = 1;
      mockPrisma.bedrift.findUnique.mockResolvedValue({ 
        id: bedriftId,
        _count: { ansatte: 2, kontrakter: 0 }
      });

      // Act & Assert
      await expect(bedriftService.slettBedrift(bedriftId)).rejects.toThrow(
        'Kan ikke slette bedrift med tilknyttede ansatte eller kontrakter'
      );
    });

    it('skal ikke slette bedrift med tilknyttede kontrakter', async () => {
      // Arrange
      const bedriftId = 1;
      mockPrisma.bedrift.findUnique.mockResolvedValue({ 
        id: bedriftId,
        _count: { ansatte: 0, kontrakter: 3 }
      });

      // Act & Assert
      await expect(bedriftService.slettBedrift(bedriftId)).rejects.toThrow(
        'Kan ikke slette bedrift med tilknyttede ansatte eller kontrakter'
      );
    });

    it('skal kaste error for ikke-eksisterende bedrift', async () => {
      // Arrange
      const bedriftId = 999;
      mockPrisma.bedrift.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(bedriftService.slettBedrift(bedriftId)).rejects.toThrow(
        'Bedrift med ID 999 finnes ikke'
      );
    });
  });

  describe('hentBedriftStatistikk', () => {
    it('skal returnere korrekt statistikk', async () => {
      // Arrange
      const bedriftId = 1;
      const mockStatistikk = {
        totalAnsatte: 5,
        aktiveKontrakter: 3,
        fullførteKontrakter: 7,
        ventendeSikkerhetskontroller: 2,
      };

      mockPrisma.bedrift.findUnique.mockResolvedValue({ id: bedriftId });
      mockPrisma.ansatt.count.mockResolvedValue(mockStatistikk.totalAnsatte);
      
      // Mock for kontrakter statistikk
      mockPrisma.$transaction.mockResolvedValue([
        mockStatistikk.aktiveKontrakter,
        mockStatistikk.fullførteKontrakter,
        mockStatistikk.ventendeSikkerhetskontroller,
      ]);

      // Act
      const result = await bedriftService.hentBedriftStatistikk(bedriftId);

      // Assert
      expect(result).toEqual(mockStatistikk);
    });

    it('skal returnere null for ikke-eksisterende bedrift', async () => {
      // Arrange
      const bedriftId = 999;
      mockPrisma.bedrift.findUnique.mockResolvedValue(null);

      // Act
      const result = await bedriftService.hentBedriftStatistikk(bedriftId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('søkBedrifter', () => {
    it('skal returnere søkeresultater med paginering', async () => {
      // Arrange
      const søketerm = 'test';
      const side = 1;
      const antallPerSide = 10;
      
      const mockResultater = [
        { id: 1, navn: 'Test Bedrift 1' },
        { id: 2, navn: 'Test Bedrift 2' },
      ];
      
      const mockTotalAntall = 25;

      mockPrisma.bedrift.findMany.mockResolvedValue(mockResultater);
      mockPrisma.bedrift.count.mockResolvedValue(mockTotalAntall);

      // Act
      const result = await bedriftService.søkBedrifter(søketerm, side, antallPerSide);

      // Assert
      expect(result).toEqual({
        bedrifter: mockResultater,
        totalAntall: mockTotalAntall,
        side,
        antallPerSide,
        totalSider: Math.ceil(mockTotalAntall / antallPerSide),
      });

      expect(mockPrisma.bedrift.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { navn: { contains: søketerm, mode: 'insensitive' } },
            { orgnummer: { contains: søketerm } },
            { kontaktperson: { contains: søketerm, mode: 'insensitive' } },
          ]
        },
        skip: (side - 1) * antallPerSide,
        take: antallPerSide,
        orderBy: { navn: 'asc' }
      });
    });
  });
}); 