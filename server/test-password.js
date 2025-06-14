const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPassword() {
  try {
    console.log('Tester passord for admin@test.no...');
    
    const testBruker = await prisma.ansatt.findUnique({
      where: { epost: 'admin@test.no' }
    });
    
    if (!testBruker) {
      console.log('Bruker ikke funnet!');
      return;
    }
    
    console.log('Bruker funnet:', testBruker.epost);
    console.log('Passord hash:', testBruker.passordHash);
    
    // Test passordet
    const testPassord = 'admin123';
    const erGyldig = await bcrypt.compare(testPassord, testBruker.passordHash);
    
    console.log(`\nTester passord "${testPassord}":`, erGyldig ? 'GYLDIG' : 'UGYLDIG');
    
    // Test også å generere ny hash for sammenligning
    const nyHash = await bcrypt.hash(testPassord, 10);
    console.log('Ny hash for sammenligning:', nyHash);
    
    const erNyGyldig = await bcrypt.compare(testPassord, nyHash);
    console.log('Ny hash test:', erNyGyldig ? 'GYLDIG' : 'UGYLDIG');
    
  } catch (error) {
    console.error('Feil ved passordtesting:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword(); 