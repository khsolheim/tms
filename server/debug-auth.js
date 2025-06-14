const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugAuth() {
  try {
    console.log('=== 🔍 AVANSERT AUTH DEBUG ===\n');
    
    // Test 1: Sjekk database-kobling
    console.log('1. 🔗 Tester database-kobling...');
    await prisma.$connect();
    console.log('✅ Database-kobling vellykket\n');
    
    // Test 2: Sjekk alle brukere
    console.log('2. 👥 Alle brukere i database:');
    const alleAnsatte = await prisma.ansatt.findMany({
      select: {
        id: true,
        epost: true,
        fornavn: true,
        etternavn: true,
        rolle: true,
        aktiv: true
      }
    });
    console.table(alleAnsatte);
    
    // Test 3: Sjekk spesifikk e-post med ulike varianter
    const epostVarianter = [
      'admin@test.no',
      'Admin@test.no',
      'ADMIN@TEST.NO',
      'admin@test.no ',
      ' admin@test.no'
    ];
    
    console.log('\n3. 📧 Tester e-post-varianter:');
    for (const epost of epostVarianter) {
      console.log(`\nTester: "${epost}" (lengde: ${epost.length})`);
      const bruker = await prisma.ansatt.findUnique({
        where: { epost }
      });
      console.log('Resultat:', bruker ? `✅ FUNNET (ID: ${bruker.id})` : '❌ IKKE FUNNET');
    }
    
    // Test 4: Søk med LIKE for å finne tilsvarende
    console.log('\n4. 🔍 Søker med LIKE-operatør:');
    const likeSok = await prisma.ansatt.findMany({
      where: {
        epost: {
          contains: 'admin@test'
        }
      },
      select: {
        id: true,
        epost: true,
        fornavn: true,
        etternavn: true
      }
    });
    console.log('LIKE-søk resultat:', likeSok);
    
    // Test 5: Database-schema
    console.log('\n5. 📋 Database-schema info:');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Ansatt' AND column_name = 'epost';
    `;
    console.log('E-post kolonne info:', tableInfo);
    
    // Test 6: Sjekk indekser
    console.log('\n6. 🔍 Indekser på Ansatt-tabellen:');
    const indexes = await prisma.$queryRaw`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'Ansatt';
    `;
    console.log('Indekser:', indexes);
    
  } catch (error) {
    console.error('❌ Feil under debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth(); 