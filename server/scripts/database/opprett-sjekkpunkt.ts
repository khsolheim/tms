import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function opprettSjekkpunkt() {
  const sjekkpunkt = [
    {
      tittel: 'Kontroll av førerkort',
      beskrivelse: 'Sjekk at eleven har gyldig førerkorttillatelse',
      typeKontroll: 'VISUELL' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    },
    {
      tittel: 'Hjelmutstyr',
      beskrivelse: 'Kontroller at eleven har korrekt hjelm som oppfyller gjeldende standarder',
      typeKontroll: 'VISUELL' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    },
    {
      tittel: 'Sikkerhetsutstyr',
      beskrivelse: 'Sjekk refleksvest og annet sikkerhetsutstyr',
      typeKontroll: 'VISUELL' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    },
    {
      tittel: 'Kjøretøykontroll - Bremser',
      beskrivelse: 'Kontroller både for- og bakbremser fungerer korrekt',
      typeKontroll: 'FYSISK' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    },
    {
      tittel: 'Kjøretøykontroll - Lys',
      beskrivelse: 'Sjekk at alle lys fungerer (for-, bak-, brems-, blinklys)',
      typeKontroll: 'FYSISK' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    },
    {
      tittel: 'Kjøretøykontroll - Dekk',
      beskrivelse: 'Kontroller dekkenes tilstand og lufttrykk',
      typeKontroll: 'VISUELL' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    },
    {
      tittel: 'Kjøreferdigheter - Manøvrering',
      beskrivelse: 'Grunnleggende manøvrering på øvelsesplass',
      typeKontroll: 'FYSISK' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    },
    {
      tittel: 'Kjøreferdigheter - Balanse',
      beskrivelse: 'Demonstrerer god balanse ved lav hastighet',
      typeKontroll: 'FYSISK' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    },
    {
      tittel: 'Trafikkoppførsel',
      beskrivelse: 'Observerer trafikkregler og viser ansvarlighet',
      typeKontroll: 'VISUELL' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    },
    {
      tittel: 'Kommunikasjon',
      beskrivelse: 'Forstår og følger instruksjoner fra instruktør',
      typeKontroll: 'VISUELL' as const,
      system: 'TRAFIKKLÆRER',
      forerkortklass: ['A1']
    }
  ];

  console.log('Oppretter A1 sjekkpunkt...');
  
  for (const punkt of sjekkpunkt) {
    try {
      const opprettet = await prisma.sjekkpunkt.create({ data: punkt });
      console.log(`✅ Opprettet: ${opprettet.tittel}`);
    } catch (error) {
      console.log(`⚠️  Finnes allerede: ${punkt.tittel}`);
    }
  }
  
  const antall = await prisma.sjekkpunkt.count();
  console.log(`\n🎉 Total: ${antall} sjekkpunkt i biblioteket`);
}

opprettSjekkpunkt()
  .catch((e) => {
    console.error('Feil ved opprettelse av sjekkpunkt:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 