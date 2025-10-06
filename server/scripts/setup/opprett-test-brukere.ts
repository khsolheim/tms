import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function opprettTestBrukere() {
  const brukere = [
    { fornavn: 'Test', etternavn: 'Hovedbruker', epost: 'hovedbruker@test.no', rolle: 'HOVEDBRUKER' as const, bedriftId: null },
    { fornavn: 'Test', etternavn: 'Trafikklarer', epost: 'trafikklarer@test.no', rolle: 'TRAFIKKLARER' as const, bedriftId: null },
    { fornavn: 'Admin', etternavn: 'Bruker', epost: 'admin@test.no', rolle: 'HOVEDBRUKER' as const, bedriftId: null }
  ];

  console.log('Oppretter testbrukere...');
  
  for (const bruker of brukere) {
    try {
      const passordHash = await bcrypt.hash('test123', 10);
      const opprettet = await prisma.ansatt.create({
        data: {
          ...bruker,
          passordHash,
          tilganger: bruker.rolle === 'HOVEDBRUKER' ? JSON.stringify(['HOVEDBRUKER', 'TRAFIKKLARER']) : JSON.stringify(['TRAFIKKLARER'])
        }
      });
      console.log(`✅ Opprettet: ${opprettet.fornavn} ${opprettet.etternavn} (${opprettet.rolle})`);
    } catch (error) {
      console.log(`⚠️  Finnes eller feil: ${bruker.fornavn} ${bruker.etternavn}`);
    }
  }
  
  const antall = await prisma.ansatt.count();
  console.log(`\n🎉 Total: ${antall} brukere i systemet`);

  await prisma.$disconnect();
}

opprettTestBrukere()
  .catch((e) => {
    console.error('Feil ved opprettelse av testbrukere:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 