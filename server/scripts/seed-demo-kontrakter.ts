import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDemoKontrakter() {
  console.log('🌱 Lager demo kontrakter...');

  try {
    // Sjekk om det allerede finnes kontrakter
    const existing = await prisma.kontrakt.count();
    if (existing > 0) {
      console.log(`📋 ${existing} kontrakter finnes allerede`);
      return;
    }

    // Opprett demo kontrakter
    const kontrakter = await prisma.kontrakt.createMany({
      data: [
        {
          elevFornavn: 'Ola',
          elevEtternavn: 'Nordmann',
          elevPersonnummer: '01015012345',
          elevTelefon: '12345678',
          elevEpost: 'ola@example.com',
          elevGate: 'Storgata 1',
          elevPostnr: '0001',
          elevPoststed: 'Oslo',
          lan: 250000,
          lopetid: 60,
          rente: 4.5,
          etableringsgebyr: 2500,
          termingebyr: 50,
          terminerPerAr: 12,
          effektivRente: 4.85,
          renterOgGebyr: 15000,
          terminbelop: 4650,
          totalRente: 15000,
          totalBelop: 279000,
          status: 'AKTIV',
          bedriftId: 1,
          opprettetAv: 1
        },
        {
          elevFornavn: 'Kari',
          elevEtternavn: 'Hansen',
          elevPersonnummer: '15028512346',
          elevTelefon: '87654321',
          elevEpost: 'kari@example.com',
          elevGate: 'Lille gate 5',
          elevPostnr: '1234',
          elevPoststed: 'Bergen',
          lan: 150000,
          lopetid: 36,
          rente: 3.8,
          etableringsgebyr: 1500,
          termingebyr: 50,
          terminerPerAr: 12,
          effektivRente: 4.1,
          renterOgGebyr: 8500,
          terminbelop: 4425,
          totalRente: 8500,
          totalBelop: 159300,
          status: 'AKTIV',
          bedriftId: 1,
          opprettetAv: 1
        },
        {
          elevFornavn: 'Per',
          elevEtternavn: 'Olsen',
          elevPersonnummer: '20059012347',
          elevTelefon: '11223344',
          elevEpost: 'per@example.com',
          elevGate: 'Hovedveien 12',
          elevPostnr: '5678',
          elevPoststed: 'Trondheim',
          lan: 100000,
          lopetid: 24,
          rente: 5.2,
          etableringsgebyr: 1000,
          termingebyr: 50,
          terminerPerAr: 12,
          effektivRente: 5.65,
          renterOgGebyr: 6200,
          terminbelop: 4425,
          totalRente: 6200,
          totalBelop: 106200,
          status: 'UTKAST',
          bedriftId: 1,
          opprettetAv: 1
        }
      ]
    });

    console.log(`✅ Opprettet ${kontrakter.count} demo kontrakter`);
  } catch (error) {
    console.error('❌ Feil ved oppretting av demo kontrakter:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Kjør seeding hvis scriptet kalles direkte
if (require.main === module) {
  seedDemoKontrakter();
}

export { seedDemoKontrakter }; 