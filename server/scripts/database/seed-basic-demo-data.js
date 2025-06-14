const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Demo bedrifter
const DEMO_BEDRIFTER = [
  {
    navn: 'Oslo Trafikkskole AS',
    organisasjonsnummer: '123456789',
    adresse: 'Storgata 15',
    postnummer: '0155',
    poststed: 'Oslo',
    telefon: '22334455',
    epost: 'post@oslotrafikkskole.no',
    dagligLeder: 'Kari Hansen'
  },
  {
    navn: 'Bergen Kjøreskole',
    organisasjonsnummer: '987654321',
    adresse: 'Bryggen 42',
    postnummer: '5003',
    poststed: 'Bergen',
    telefon: '55667788',
    epost: 'info@bergenkjoreskole.no',
    dagligLeder: 'Ole Nordmann'
  },
  {
    navn: 'Trondheim Transport & Logistikk',
    organisasjonsnummer: '456789123',
    adresse: 'Industriveien 88',
    postnummer: '7030',
    poststed: 'Trondheim',
    telefon: '73445566',
    epost: 'kontakt@ttl.no',
    dagligLeder: 'Astrid Vik'
  }
];

// Demo ansatte
const DEMO_ANSATTE = [
  {
    fornavn: 'Kari',
    etternavn: 'Hansen',
    epost: 'kari.hansen@oslotrafikkskole.no',
    telefon: '22334455',
    rolle: 'TRAFIKKLARER'
  },
  {
    fornavn: 'Ole',
    etternavn: 'Nordmann',
    epost: 'ole.nordmann@bergenkjoreskole.no',
    telefon: '55667788',
    rolle: 'ADMIN'
  },
  {
    fornavn: 'Astrid',
    etternavn: 'Vik',
    epost: 'astrid.vik@ttl.no',
    telefon: '73445566',
    rolle: 'TRAFIKKLARER'
  }
];

async function seedBasicDemoData() {
  console.log('🌱 Starter seeding av grunnleggende demo-data...');

  try {
    // 1. Opprett demo bedrifter
    console.log('📊 Oppretter demo bedrifter...');
    const opprettedeBedrifter = [];
    
    for (const bedriftData of DEMO_BEDRIFTER) {
      const eksisterendeBedrift = await prisma.bedrift.findUnique({
        where: { organisasjonsnummer: bedriftData.organisasjonsnummer }
      });

      if (!eksisterendeBedrift) {
        const bedrift = await prisma.bedrift.create({
          data: bedriftData
        });
        opprettedeBedrifter.push(bedrift);
        console.log(`  ✅ Opprettet bedrift: ${bedrift.navn}`);
      } else {
        opprettedeBedrifter.push(eksisterendeBedrift);
        console.log(`  ⏭️  Bedrift eksisterer allerede: ${eksisterendeBedrift.navn}`);
      }
    }

    // 2. Opprett demo ansatte
    console.log('👥 Oppretter demo ansatte...');
    const opprettedeAnsatte = [];
    
    for (let i = 0; i < DEMO_ANSATTE.length; i++) {
      const ansattData = DEMO_ANSATTE[i];
      const bedrift = opprettedeBedrifter[i % opprettedeBedrifter.length];
      
      const eksisterendeAnsatt = await prisma.ansatt.findUnique({
        where: { epost: ansattData.epost }
      });

      if (!eksisterendeAnsatt) {
        const hashedPassword = await bcrypt.hash('demo123', 10);
        
        const ansatt = await prisma.ansatt.create({
          data: {
            ...ansattData,
            passordHash: hashedPassword,
            bedriftId: bedrift.id
          }
        });
        opprettedeAnsatte.push(ansatt);
        console.log(`  ✅ Opprettet ansatt: ${ansatt.fornavn} ${ansatt.etternavn} (${ansatt.rolle})`);
      } else {
        opprettedeAnsatte.push(eksisterendeAnsatt);
        console.log(`  ⏭️  Ansatt eksisterer allerede: ${eksisterendeAnsatt.fornavn} ${eksisterendeAnsatt.etternavn}`);
      }
    }

    console.log('\n🎉 Grunnleggende demo-data seeding fullført!');
    console.log(`📊 Opprettet/bekreftet:`);
    console.log(`   - ${opprettedeBedrifter.length} bedrifter`);
    console.log(`   - ${opprettedeAnsatte.length} ansatte`);
    
    // Vis statistikk
    const stats = await prisma.$transaction([
      prisma.bedrift.count(),
      prisma.ansatt.count(),
      prisma.sjekkpunktSystem.count(),
      prisma.førerkortKlasse.count()
    ]);
    
    console.log(`\n📈 Total statistikk i databasen:`);
    console.log(`   - ${stats[0]} bedrifter totalt`);
    console.log(`   - ${stats[1]} ansatte totalt`);
    console.log(`   - ${stats[2]} sjekkpunkt-systemer`);
    console.log(`   - ${stats[3]} førerkortklasser`);

  } catch (error) {
    console.error('❌ Feil under seeding av demo-data:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedBasicDemoData();
  } catch (error) {
    console.error('❌ Kritisk feil:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Kjør script hvis det kalles direkte
if (require.main === module) {
  main();
}

module.exports = { seedBasicDemoData }; 