/**
 * Mock Data for Testing
 * 
 * Realistiske mock objekter for testing av komponenter og integration flows
 */

export const mockUser = {
  id: 1,
  fornavn: 'Test',
  etternavn: 'Admin',
  epost: 'admin@testbedrift.no',
  rolle: 'ADMIN' as const,
  bedriftId: 1,
  aktiv: true,
  telefon: '12345678',
  opprettet: new Date('2024-01-01'),
  oppdatert: new Date('2024-01-01'),
};

export const mockBedrift = {
  id: 1,
  navn: 'Test Trafikksikkerhet AS',
  orgNummer: '987654321',
  epost: 'post@testbedrift.no',
  telefon: '12345678',
  adresse: 'Testveien 1',
  postnr: '0123',
  poststed: 'Oslo',
  aktiv: true,
  opprettet: new Date('2024-01-01'),
  oppdatert: new Date('2024-01-01'),
};

export const mockKontrakt = {
  id: 1,
  bedriftId: 1,
  elevFornavn: 'Test',
  elevEtternavn: 'Elev',
  elevPersonnummer: '12345678901',
  elevTelefon: '87654321',
  elevEpost: 'test@elev.no',
  elevGate: 'Elevgate 1',
  elevPostnr: '0123',
  elevPoststed: 'Oslo',
  harFakturaansvarlig: false,
  fakturaansvarligFornavn: null,
  fakturaansvarligEtternavn: null,
  fakturaansvarligPersonnummer: null,
  fakturaansvarligTelefon: null,
  fakturaansvarligEpost: null,
  fakturaansvarligGate: null,
  fakturaansvarligPostnr: null,
  fakturaansvarligPoststed: null,
  lan: 100000,
  lopetid: 24,
  rente: 5.5,
  etableringsgebyr: 1900,
  termingebyr: 50,
  terminerPerAr: 12,
  inkludererGebyrerILan: false,
  effektivRente: 6.2,
  totalRente: 12000,
  totalBelop: 112000,
  terminbelop: 4667,
  status: 'UTKAST' as const,
  opprettet: new Date('2024-01-01'),
  oppdatert: new Date('2024-01-01'),
  opprettetAv: 1,
};

export const mockElev = {
  id: 1,
  fornavn: 'Test',
  etternavn: 'Elev',
  personnummer: '12345678901',
  telefon: '87654321',
  epost: 'test@elev.no',
  adresse: 'Elevgate 1',
  postnummer: '0123',
  poststed: 'Oslo',
  status: 'AKTIV' as const,
  bedriftId: 1,
  opprettet: new Date('2024-01-01'),
  oppdatert: new Date('2024-01-01'),
};

export const mockAnsatt = {
  id: 2,
  fornavn: 'Test',
  etternavn: 'Lærer',
  epost: 'laerer@testbedrift.no',
  rolle: 'TRAFIKKLÆRER' as const,
  bedriftId: 1,
  aktiv: true,
  telefon: '12345679',
  adresse: 'Lærergate 2',
  postnummer: '0124',
  poststed: 'Oslo',
  opprettet: new Date('2024-01-01'),
  oppdatert: new Date('2024-01-01'),
};

// API Response wrappers
export const mockApiResponse = <T>(data: T, success = true, message?: string) => ({
  success,
  data,
  message,
});

export const mockApiError = (message: string, status = 400) => ({
  success: false,
  message,
  status,
});

// Mock arrays for lists
export const mockKontrakter = [
  mockKontrakt,
  {
    ...mockKontrakt,
    id: 2,
    elevFornavn: 'Anna',
    elevEtternavn: 'Hansen',
    elevPersonnummer: '10987654321',
    lan: 75000,
    status: 'AKTIV' as const,
  },
  {
    ...mockKontrakt,
    id: 3,
    elevFornavn: 'Lars',
    elevEtternavn: 'Olsen',
    elevPersonnummer: '11223344556',
    lan: 120000,
    status: 'FULLFØRT' as const,
  },
];

export const mockElever = [
  mockElev,
  {
    ...mockElev,
    id: 2,
    fornavn: 'Anna',
    etternavn: 'Hansen',
    personnummer: '10987654321',
    epost: 'anna@elev.no',
  },
];

export const mockAnsatte = [
  mockUser,
  mockAnsatt,
  {
    ...mockAnsatt,
    id: 3,
    fornavn: 'Kari',
    etternavn: 'Nordmann',
    epost: 'kari@testbedrift.no',
    rolle: 'SEKRETÆR' as const,
  },
]; 