const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simulateLogin() {
  try {
    console.log('🔍 Simulerer innloggingslogikk...');
    
    // Eksakt samme variabler som sendes fra klienten
    const epost = 'admin@test.no';
    const passord = 'admin123';
    
    console.log(`📧 E-post: ${epost}`);
    console.log(`🔑 Passord: ${passord}`);
    
    console.log('\n🔍 Søker etter bruker i database...');
    
    const ansatt = await prisma.ansatt.findUnique({
      where: { epost },
      include: { bedrift: true }
    });

    console.log('🔍 Database-respons:', ansatt ? 'BRUKER FUNNET' : 'BRUKER IKKE FUNNET');
    
    if (!ansatt) {
      console.log('❌ Bruker ikke funnet - dette er problemet!');
      return;
    }

    console.log('✅ Bruker funnet:', {
      id: ansatt.id,
      epost: ansatt.epost,
      fornavn: ansatt.fornavn,
      etternavn: ansatt.etternavn
    });

    console.log('\n🔍 Sjekker passord...');
    const gyldigPassord = await bcrypt.compare(passord, ansatt.passordHash);
    
    if (!gyldigPassord) {
      console.log('❌ Ugyldig passord');
      return;
    }

    console.log('✅ Passord er gyldig');
    console.log('🎉 Innlogging skulle være vellykket!');
    
  } catch (error) {
    console.error('❌ Feil under simulering:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateLogin(); 