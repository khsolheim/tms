import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function opprettBedriftData() {
  try {
    console.log('📊 Henter alle bedrifter...');
    
    // Hent alle bedrifter
    const bedrifter = await prisma.bedrift.findMany({
      select: { id: true, navn: true }
    });
    
    console.log(`🏢 Fant ${bedrifter.length} bedrifter`);
    
    for (const bedrift of bedrifter) {
      console.log(`\n🔄 Behandler bedrift: ${bedrift.navn} (ID: ${bedrift.id})`);
      
      // Sjekk om bedrift allerede har brukere
      const eksisterendeBrukere = await prisma.ansatt.findMany({
        where: { bedriftId: bedrift.id }
      });
      
      if (eksisterendeBrukere.length >= 3) {
        console.log(`⚠️  Bedrift ${bedrift.navn} har allerede ${eksisterendeBrukere.length} brukere, hopper over`);
      } else {
        console.log(`👥 Oppretter brukere for ${bedrift.navn}...`);
        
        // Hash passord en gang
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        // Opprett 3 brukere per bedrift hvis de ikke allerede finnes
        const brukereAaLage = 3 - eksisterendeBrukere.length;
        const startNummer = eksisterendeBrukere.length + 1;
        
        for (let i = 0; i < brukereAaLage; i++) {
          const brukerNr = startNummer + i;
          const rolleArray = ['HOVEDBRUKER', 'TRAFIKKLARER', 'TRAFIKKLARER'];
          const rolle = rolleArray[brukerNr - 1] || 'TRAFIKKLARER';
          
          const nyBruker = await prisma.ansatt.create({
            data: {
              navn: `${rolle === 'HOVEDBRUKER' ? 'Hovedbruker' : 'Trafikklærer'} ${brukerNr}`,
              epost: `bruker${brukerNr}@${bedrift.navn.toLowerCase().replace(/[^a-z0-9]/g, '')}.no`,
              passordHash: hashedPassword,
              rolle: rolle as any,
              bedriftId: bedrift.id,
              telefon: `${40000000 + (bedrift.id * 100) + brukerNr}`
            }
          });
          
          console.log(`✅ Opprettet bruker: ${nyBruker.navn} (${nyBruker.epost})`);
        }
      }
      
      // Sjekk eksisterende kjøretøy
      const eksisterendeKjoretoy = await prisma.kjoretoy.findMany({
        where: { bedriftId: bedrift.id }
      });
      
      if (eksisterendeKjoretoy.length >= 5) {
        console.log(`⚠️  Bedrift ${bedrift.navn} har allerede ${eksisterendeKjoretoy.length} kjøretøy, hopper over`);
      } else {
        console.log(`🚗 Oppretter kjøretøy for ${bedrift.navn}...`);
        
        const kjoretoyAaLage = 5 - eksisterendeKjoretoy.length;
        
        for (let i = 0; i < kjoretoyAaLage; i++) {
          const kjoretoyNr = eksisterendeKjoretoy.length + i + 1;
          const erKlasseA = (kjoretoyNr <= 3); // Første 3 er klasse A, resten klasse B
          
          const merker = ['Toyota', 'Volkswagen', 'Ford', 'Volvo', 'BMW'];
          const modeller = erKlasseA ? 
            ['Corolla', 'Golf', 'Focus', 'V40', '318i'] : 
            ['Hiace', 'Crafter', 'Transit', 'FH', 'X5'];
          
          const regnr = `${String.fromCharCode(65 + (bedrift.id % 26))}${String.fromCharCode(65 + (kjoretoyNr % 26))}${(10000 + (bedrift.id * 100) + kjoretoyNr).toString().slice(-5)}`;
          
          const nyttKjoretoy = await prisma.kjoretoy.create({
            data: {
              registreringsnummer: regnr,
              merke: merker[kjoretoyNr % merker.length],
              modell: modeller[kjoretoyNr % modeller.length],
              aarsmodell: 2018 + (kjoretoyNr % 6),
              type: erKlasseA ? 'Personbil' : 'Varebil',
              status: 'Aktiv',
              forerkortklass: erKlasseA ? ['A1', 'A', 'B'] : ['B', 'C1', 'C'],
              bedriftId: bedrift.id
            }
          });
          
          console.log(`✅ Opprettet kjøretøy: ${nyttKjoretoy.merke} ${nyttKjoretoy.modell} (${nyttKjoretoy.registreringsnummer}) - Klasse ${erKlasseA ? 'A' : 'B'}`);
        }
      }
      
      // Opprett klasser for bedriften hvis de ikke finnes
      const eksisterendeKlasser = await prisma.bedriftsKlasse.findMany({
        where: { bedriftId: bedrift.id }
      });
      
      if (eksisterendeKlasser.length === 0) {
        const klasser = ['A1', 'A', 'B', 'C1', 'C'];
        for (const klassekode of klasser) {
          await prisma.bedriftsKlasse.create({
            data: {
              klassekode,
              bedriftId: bedrift.id
            }
          });
        }
        console.log(`✅ Opprettet ${klasser.length} klasser for ${bedrift.navn}`);
      }
    }
    
    console.log('\n🎉 Ferdig med å opprette bedrift data!');
    
    // Vis sammendrag
    const totaltAnsatte = await prisma.ansatt.count();
    const totaltKjoretoy = await prisma.kjoretoy.count();
    const totaltKlasser = await prisma.bedriftsKlasse.count();
    
    console.log(`\n📊 SAMMENDRAG:`);
    console.log(`👥 Totalt ansatte: ${totaltAnsatte}`);
    console.log(`🚗 Totalt kjøretøy: ${totaltKjoretoy}`);
    console.log(`📚 Totalt klasser: ${totaltKlasser}`);
    
  } catch (error) {
    console.error('❌ Feil ved opprettelse av bedrift data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

opprettBedriftData(); 