/// <reference types="jest" />
import { PrismaClient } from '@prisma/client';

// Mock console methods to reduce noise in tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Restore console methods after tests
afterAll(() => {
  jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(10000);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5433/test_db';

// Export test utilities
export const createMockPrisma = () => {
  return {
    ansatt: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    bedrift: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    kontrakt: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    elev: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  } as unknown as jest.Mocked<PrismaClient>;
};

// Mock JWT for testing
export const mockJWT = {
  sign: jest.fn(() => 'mock-token'),
  verify: jest.fn(() => ({ id: 1, bedriftId: 1, rolle: 'ADMIN' })),
};

// Test user data
export const testUser = {
  id: 1,
  fornavn: 'Test',
  etternavn: 'Bruker',
  epost: 'test@example.com',
  rolle: 'ADMIN' as const,
  bedriftId: 1,
  aktiv: true,
};

export const testBedrift = {
  id: 1,
  navn: 'Test Bedrift AS',
  orgNummer: '123456789',
  adresse: 'Testgate 1',
  postnummer: '0123',
  poststed: 'Oslo',
};

export const testKontrakt = {
  id: 1,
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
  effektivRente: 5.5,
  renterOgGebyr: 3300,
  terminbelop: 2220,
  totalRente: 3300,
  totalBelop: 53300,
  status: 'UTKAST' as const,
  bedriftId: 1,
  opprettetAv: 1,
}; 