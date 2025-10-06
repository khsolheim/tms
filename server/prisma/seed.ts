import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdminFromEnv() {
  // Sjekk om super admin skal opprettes fra miljøvariabler
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  if (superAdminEmail && superAdminPassword) {
    console.log('Oppretter super admin fra miljøvariabler...');

    // Sjekk om super admin allerede eksisterer
    const existingSuperAdmin = await prisma.ansatt.findUnique({
      where: { epost: superAdminEmail }
    });

    if (existingSuperAdmin) {
      console.log('Super admin eksisterer allerede:', superAdminEmail);
      return existingSuperAdmin;
    }

    // Hash passord med høyere sikkerhet
    const passordHash = await bcrypt.hash(superAdminPassword, 12);

    // Opprett super admin (ikke tilknyttet noen bedrift)
    const superAdmin = await prisma.ansatt.create({
      data: {
        fornavn: superAdminName.split(' ')[0] || 'Super',
        etternavn: superAdminName.split(' ').slice(1).join(' ') || 'Admin',
        epost: superAdminEmail,
        passordHash,
        rolle: 'ADMIN',
        bedriftId: null, // Super admin er ikke tilknyttet en bedrift
        tilganger: JSON.stringify(['ADMIN', 'HOVEDBRUKER', 'TRAFIKKLARER'])
      }
    });

    console.log('✅ Super admin opprettet:', superAdmin.epost);
    return superAdmin;
  }

  return null;
}

async function main() {
  console.log('Seeding database...');

  // Først, prøv å opprett super admin fra miljøvariabler
  await createSuperAdminFromEnv();

  // Sjekk om test admin-brukeren allerede eksisterer
  const existingAdmin = await prisma.ansatt.findUnique({
    where: { epost: 'admin@test.no' }
  });

  if (existingAdmin) {
    console.log('Test admin-bruker eksisterer allerede');
    return;
  }

  // Prøv å finne test-bedriften først med en try-catch
  let testBedrift;
  try {
    testBedrift = await prisma.bedrift.findFirst({
      where: { organisasjonsnummer: '123456789' }
    });
  } catch (error) {
    console.log('Kunne ikke finne bedrift, oppretter ny...');
  }

  if (!testBedrift) {
    // Opprett test-bedrift hvis den ikke eksisterer
    testBedrift = await prisma.bedrift.create({
      data: {
        navn: 'Test Bedrift AS',
        organisasjonsnummer: '123456789', // Test organisasjonsnummer
        adresse: 'Testveien 1',
        postnummer: '0001',
        poststed: 'Oslo',
        telefon: '12345678',
        epost: 'kontakt@testbedrift.no'
      }
    });
    console.log('Opprettet test-bedrift:', testBedrift.navn);
  } else {
    console.log('Test-bedrift eksisterer allerede:', testBedrift.navn);
  }

  // Hash passordet
  const passordHash = await bcrypt.hash('admin123', 10);

  // Opprett test admin-bruker
  const adminBruker = await prisma.ansatt.create({
    data: {
      fornavn: 'Admin',
      etternavn: 'Bruker',
      epost: 'admin@test.no',
      passordHash,
      rolle: 'ADMIN',
      bedriftId: testBedrift.id,
      tilganger: JSON.stringify(['ADMIN', 'HOVEDBRUKER', 'TRAFIKKLARER'])
    }
  });

  console.log('Opprettet test admin-bruker:', adminBruker.epost);

  // Sett admin som hovedbruker for testbedriften
  await prisma.bedrift.update({
    where: { id: testBedrift.id },
    data: { hovedbrukerId: adminBruker.id }
  });

  console.log('Test admin-bruker er opprettet og satt som hovedbruker for testbedriften');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 