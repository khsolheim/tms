const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('Kobler til database...');
    
    // Sjekk alle brukere
    const alleAnsatte = await prisma.ansatt.findMany({
      select: {
        id: true,
        epost: true,
        fornavn: true,
        etternavn: true,
        rolle: true
      }
    });
    
    console.log('Alle ansatte i databasen:');
    console.log(alleAnsatte);
    
    // Søk spesifikt etter testbrukeren
    const testBruker = await prisma.ansatt.findUnique({
      where: { epost: 'admin@test.no' }
    });
    
    console.log('\nTestbruker (admin@test.no):');
    console.log(testBruker);
    
  } catch (error) {
    console.error('Feil ved sjekk av database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 