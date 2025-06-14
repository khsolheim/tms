import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import kontraktRouter from '../../src/routes/kontrakt.routes';
import { createMockPrisma, testUser, testBedrift, testKontrakt } from '../setup';

// Mock Prisma
jest.mock('@prisma/client');
const mockPrisma = createMockPrisma();

// Mock authentication middleware
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = testUser;
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => next(),
}));

describe('Kontrakt Routes', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/kontrakter', kontraktRouter);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /api/kontrakter', () => {
    it('skal opprette ny kontrakt med gyldig data', async () => {
      const nyKontrakt = {
        elevFornavn: 'Test',
        elevEtternavn: 'Elev',
        elevPersonnummer: '12345678901',
        elevTelefon: '12345678',
        elevEpost: 'elev@test.no',
        elevGate: 'Elevgate 1',
        elevPostnr: '0123',
        elevPoststed: 'Oslo',
        harFakturaansvarlig: false,
        lan: 50000,
        lopetid: 24,
        rente: 5.0,
        etableringsgebyr: 1900,
        termingebyr: 50,
        terminerPerAr: 12,
        inkludererGebyrerILan: false,
      };

      mockPrisma.kontrakt.create.mockResolvedValue({
        ...testKontrakt,
        ...nyKontrakt,
      });

      const response = await request(app)
        .post('/api/kontrakter')
        .send(nyKontrakt)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.elevFornavn).toBe('Test');
      expect(mockPrisma.kontrakt.create).toHaveBeenCalledTimes(1);
    });

    it('skal feile med ugyldig personnummer', async () => {
      const ugyldigKontrakt = {
        elevFornavn: 'Test',
        elevEtternavn: 'Elev',
        elevPersonnummer: '123', // Ugyldig
        elevTelefon: '12345678',
        elevEpost: 'elev@test.no',
        elevGate: 'Elevgate 1',
        elevPostnr: '0123',
        elevPoststed: 'Oslo',
        harFakturaansvarlig: false,
        lan: 50000,
        lopetid: 24,
        rente: 5.0,
        etableringsgebyr: 1900,
        termingebyr: 50,
        terminerPerAr: 12,
        inkludererGebyrerILan: false,
      };

      const response = await request(app)
        .post('/api/kontrakter')
        .send(ugyldigKontrakt)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Valideringsfeil');
    });

    it('skal kreve fakturaansvarlig felt når harFakturaansvarlig er true', async () => {
      const kontraktMedFakturaansvarlig = {
        elevFornavn: 'Test',
        elevEtternavn: 'Elev',
        elevPersonnummer: '12345678901',
        elevTelefon: '12345678',
        elevEpost: 'elev@test.no',
        elevGate: 'Elevgate 1',
        elevPostnr: '0123',
        elevPoststed: 'Oslo',
        harFakturaansvarlig: true,
        // Mangler fakturaansvarlig felt
        lan: 50000,
        lopetid: 24,
        rente: 5.0,
        etableringsgebyr: 1900,
        termingebyr: 50,
        terminerPerAr: 12,
        inkludererGebyrerILan: false,
      };

      const response = await request(app)
        .post('/api/kontrakter')
        .send(kontraktMedFakturaansvarlig)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Valideringsfeil');
    });
  });

  describe('GET /api/kontrakter/:id', () => {
    it('skal hente kontrakt med gyldig ID', async () => {
      mockPrisma.kontrakt.findUnique.mockResolvedValue(testKontrakt);

      const response = await request(app)
        .get('/api/kontrakter/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(mockPrisma.kontrakt.findUnique).toHaveBeenCalledWith({
        where: { id: 1, bedriftId: testUser.bedriftId },
        include: expect.any(Object),
      });
    });

    it('skal returnere 404 for ikke-eksisterende kontrakt', async () => {
      mockPrisma.kontrakt.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/kontrakter/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('ikke funnet');
    });

    it('skal feile med ugyldig ID format', async () => {
      const response = await request(app)
        .get('/api/kontrakter/abc')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Valideringsfeil');
    });
  });

  describe('PUT /api/kontrakter/:id', () => {
    it('skal oppdatere eksisterende kontrakt', async () => {
      const oppdatertData = {
        elevTelefon: '87654321',
        status: 'AKTIV',
      };

      mockPrisma.kontrakt.findUnique.mockResolvedValue(testKontrakt);
      mockPrisma.kontrakt.update.mockResolvedValue({
        ...testKontrakt,
        ...oppdatertData,
      });

      const response = await request(app)
        .put('/api/kontrakter/1')
        .send(oppdatertData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.elevTelefon).toBe('87654321');
      expect(mockPrisma.kontrakt.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE /api/kontrakter/:id', () => {
    it('skal slette kontrakt med gyldig ID', async () => {
      mockPrisma.kontrakt.findUnique.mockResolvedValue(testKontrakt);
      mockPrisma.kontrakt.delete.mockResolvedValue(testKontrakt);

      const response = await request(app)
        .delete('/api/kontrakter/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('slettet');
      expect(mockPrisma.kontrakt.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
}); 