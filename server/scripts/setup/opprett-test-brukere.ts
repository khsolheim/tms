import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function opprettTestBrukere() {
  const brukere = [
    { navn: 'Test Hovedbruker', epost: 'hovedbruker@test.no', rolle: 'HOVEDBRUKER' as const, bedriftId: 1 },
    { navn: 'Test Trafikklærer', epost: 'trafikklarer@test.no', rolle: 'TRAFIKKLARER' as const, bedriftId: 1 },
    { navn: 'Anna Nordmann', epost: 'anna@transportfirma.no', rolle: 'HOVEDBRUKER' as const, bedriftId: 4 },
    { navn: 'Erik Hansen', epost: 'erik@kjoresenteret.no', rolle: 'TRAFIKKLARER' as const, bedriftId: 5 }
  ];

  console.log('Oppretter testbrukere...');
  
  for (const bruker of brukere) {
    try {
      const passordHash = await bcrypt.hash('test123', 10);
      const opprettet = await prisma.ansatt.create({
        data: {
          ...bruker,
          passordHash,
          tilganger: bruker.rolle === 'HOVEDBRUKER' ? ['HOVEDBRUKER', 'TRAFIKKLARER'] : ['TRAFIKKLARER']
        }
      });
      console.log(`✅ Opprettet: ${opprettet.navn} (${opprettet.rolle})`);
    } catch (error) {
      console.log(`⚠️  Finnes eller feil: ${bruker.navn}`);
    }
  }
  
  const antall = await prisma.ansatt.count();
  console.log(`\n🎉 Total: ${antall} brukere i systemet`);
}

opprettTestBrukere()
  .catch((e) => {
    console.error('Feil ved opprettelse av testbrukere:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 