import { KontraktService } from '../../src/services/kontrakt.service';
import { createMockPrisma, testKontrakt, testUser } from '../setup';
import { NotFoundError, ValidationError } from '../../src/utils/errors';

describe('KontraktService', () => {
  let kontraktService: KontraktService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    kontraktService = new KontraktService(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('opprettKontrakt', () => {
    it('should create a new kontrakt successfully', async () => {
      // Arrange
      const kontraktData = { ...testKontrakt };
      delete (kontraktData as any).id; // Remove ID for creation
      
      mockPrisma.kontrakt.create.mockResolvedValue(testKontrakt);

      // Act
      const result = await kontraktService.opprettKontrakt(kontraktData);

      // Assert
      expect(mockPrisma.kontrakt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          elevFornavn: kontraktData.elevFornavn,
          elevEtternavn: kontraktData.elevEtternavn,
          elevPersonnummer: kontraktData.elevPersonnummer,
          lan: kontraktData.lan,
          status: 'UTKAST'
        })
      });
      expect(result).toEqual(testKontrakt);
    });

    it('should throw ValidationError for invalid data', async () => {
      // Arrange
      const invalidData = { ...testKontrakt, lan: -1000 }; // Negative loan amount
      delete (invalidData as any).id;

      // Act & Assert
      await expect(kontraktService.opprettKontrakt(invalidData)).rejects.toThrow(ValidationError);
    });

    it('should calculate financial values correctly', async () => {
      // Arrange
      const kontraktData = {
        ...testKontrakt,
        lan: 100000,
        rente: 5.0,
        lopetid: 24,
        etableringsgebyr: 1900,
        termingebyr: 50
      };
      delete kontraktData.id;

      mockPrisma.kontrakt.create.mockImplementation((args) => ({
        ...testKontrakt,
        ...args.data
      }));

      // Act
      const result = await kontraktService.create(kontraktData);

      // Assert
      expect(mockPrisma.kontrakt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          lan: 100000,
          rente: 5.0,
          lopetid: 24,
          totalBelop: expect.any(Number),
          totalRente: expect.any(Number),
          terminbelop: expect.any(Number),
          effektivRente: expect.any(Number)
        })
      });
    });
  });

  describe('findById', () => {
    it('should return kontrakt when found', async () => {
      // Arrange
      mockPrisma.kontrakt.findUnique.mockResolvedValue(testKontrakt);

      // Act
      const result = await kontraktService.findById(1);

      // Assert
      expect(mockPrisma.kontrakt.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object)
      });
      expect(result).toEqual(testKontrakt);
    });

    it('should throw NotFoundError when kontrakt not found', async () => {
      // Arrange
      mockPrisma.kontrakt.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(kontraktService.findById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('findByBedrift', () => {
    it('should return kontrakter for bedrift with pagination', async () => {
      // Arrange
      const kontrakter = [testKontrakt];
      mockPrisma.kontrakt.findMany.mockResolvedValue(kontrakter);
      mockPrisma.kontrakt.count.mockResolvedValue(1);

      // Act
      const result = await kontraktService.findByBedrift(1, { page: 1, limit: 10 });

      // Assert
      expect(mockPrisma.kontrakt.findMany).toHaveBeenCalledWith({
        where: { bedriftId: 1 },
        include: expect.any(Object),
        orderBy: { opprettet: 'desc' },
        skip: 0,
        take: 10
      });
      
      expect(result).toEqual({
        kontrakter,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });

    it('should apply filters correctly', async () => {
      // Arrange
      mockPrisma.kontrakt.findMany.mockResolvedValue([]);
      mockPrisma.kontrakt.count.mockResolvedValue(0);

      const filters = {
        status: 'AKTIV',
        elevNavn: 'Test',
        page: 1,
        limit: 10
      };

      // Act
      await kontraktService.findByBedrift(1, filters);

      // Assert
      expect(mockPrisma.kontrakt.findMany).toHaveBeenCalledWith({
        where: {
          bedriftId: 1,
          status: 'AKTIV',
          OR: [
            { elevFornavn: { contains: 'Test', mode: 'insensitive' } },
            { elevEtternavn: { contains: 'Test', mode: 'insensitive' } }
          ]
        },
        include: expect.any(Object),
        orderBy: { opprettet: 'desc' },
        skip: 0,
        take: 10
      });
    });
  });

  describe('update', () => {
    it('should update kontrakt successfully', async () => {
      // Arrange
      const updateData = { elevTelefon: '87654321' };
      const updatedKontrakt = { ...testKontrakt, ...updateData };
      
      mockPrisma.kontrakt.findUnique.mockResolvedValue(testKontrakt);
      mockPrisma.kontrakt.update.mockResolvedValue(updatedKontrakt);

      // Act
      const result = await kontraktService.update(1, updateData);

      // Assert
      expect(mockPrisma.kontrakt.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: expect.any(Object)
      });
      expect(result).toEqual(updatedKontrakt);
    });

    it('should throw NotFoundError when updating non-existent kontrakt', async () => {
      // Arrange
      mockPrisma.kontrakt.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(kontraktService.update(999, { elevTelefon: '12345678' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete kontrakt successfully', async () => {
      // Arrange
      mockPrisma.kontrakt.findUnique.mockResolvedValue(testKontrakt);
      mockPrisma.kontrakt.delete.mockResolvedValue(testKontrakt);

      // Act
      await kontraktService.delete(1);

      // Assert
      expect(mockPrisma.kontrakt.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should throw NotFoundError when deleting non-existent kontrakt', async () => {
      // Arrange
      mockPrisma.kontrakt.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(kontraktService.delete(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getStats', () => {
    it('should return kontrakt statistics for bedrift', async () => {
      // Arrange
      const mockStats = [
        { status: 'UTKAST', _count: { status: 5 } },
        { status: 'AKTIV', _count: { status: 10 } },
        { status: 'AVSLUTTET', _count: { status: 3 } }
      ];
      
      mockPrisma.kontrakt.groupBy.mockResolvedValue(mockStats);

      // Act
      const result = await kontraktService.getStats(1);

      // Assert
      expect(mockPrisma.kontrakt.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: { bedriftId: 1 },
        _count: { status: true }
      });

      expect(result).toEqual({
        UTKAST: 5,
        AKTIV: 10,
        AVSLUTTET: 3,
        total: 18
      });
    });
  });
}); 