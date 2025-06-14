import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Oppretter test-data...');

  const bedriftNavnene = ['Test Bedrift A', 'Test Bedrift B', 'Test Bedrift C', 'Test Bedrift D', 'Test Bedrift E', 'Test Bedrift F', 'Test Bedrift G', 'Test Bedrift H'];
  const bedriftBokstaver = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // Standard passord for alle test-brukere
  const testPassord = 'test123';
  const passordHash = await bcrypt.hash(testPassord, 10);

  for (let i = 0; i < bedriftNavnene.length; i++) {
    const bedriftNavn = bedriftNavnene[i];
    const bokstav = bedriftBokstaver[i];
    
    console.log(`Oppretter ${bedriftNavn}...`);

    // Opprett bedrift
    const bedrift = await prisma.bedrift.create({
      data: {
        navn: bedriftNavn,
        orgNummer: `${100000000 + i}`, // Unike org.nummer
        adresse: `Testveien ${i + 1}`,
        postnummer: `000${i + 1}`,
        poststed: 'Oslo',
        telefon: `1234567${i}`,
        epost: `kontakt@testbedrift${bokstav.toLowerCase()}.no`
      }
    });

    // Opprett 5 ansatte for hver bedrift
    const ansatte: any[] = [];
    for (let j = 1; j <= 5; j++) {
      const ansatt = await prisma.ansatt.create({
        data: {
          navn: `Bedrift ${bokstav} Ansatt ${j}`,
          epost: `ansatt${j}@testbedrift${bokstav.toLowerCase()}.no`,
          passordHash,
          rolle: j === 1 ? 'HOVEDBRUKER' : 'TRAFIKKLARER', // Første ansatt blir hovedbruker
          bedriftId: bedrift.id,
          tilganger: j === 1 ? ['HOVEDBRUKER', 'TRAFIKKLARER'] : ['TRAFIKKLARER']
        }
      });
      ansatte.push(ansatt);
      
      console.log(`  - Opprettet ansatt: ${ansatt.navn}`);
    }

    // Sett første ansatt som hovedbruker for bedriften
    await prisma.bedrift.update({
      where: { id: bedrift.id },
      data: { hovedbrukerId: ansatte[0].id }
    });

    // Opprett 5 elever for hver bedrift
    for (let k = 1; k <= 5; k++) {
      const elev = await prisma.user.create({
        data: {
          navn: `Test Elev Bedrift ${bokstav} ${k}`,
          epost: `elev${k}@testbedrift${bokstav.toLowerCase()}.no`,
          rolle: 'ELEV'
        }
      });
      
      console.log(`  - Opprettet elev: ${elev.navn}`);
    }

    console.log(`✅ Ferdig med ${bedriftNavn}\n`);
  }

  console.log('🎉 Alle test-data er opprettet!');
  console.log('\n📋 Oversikt:');
  console.log('- 8 test-bedrifter (A-H)');
  console.log('- 40 ansatte (5 per bedrift)');
  console.log('- 40 elever (5 per bedrift)');
  console.log('\n🔑 Login-info:');
  console.log('Alle ansatte: passord = "test123"');
  console.log('Eksempel: ansatt1@testbedrifta.no / test123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 