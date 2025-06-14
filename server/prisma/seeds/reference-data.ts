import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sjekkpunkt-systemer som erstatter hardkodede arrays
const sjekkpunktSystemer = [
  {
    navn: 'Bremser',
    beskrivelse: 'Bremsesystem og komponenter - kontroll av bremseeffekt, bremsepedal, håndbrems',
    ikon: 'brake',
    rekkefølge: 1
  },
  {
    navn: 'Dekk',
    beskrivelse: 'Dekk og hjul - kontroll av mønsterdybde, skader, lufttrykk',
    ikon: 'tire',
    rekkefølge: 2
  },
  {
    navn: 'Styring',
    beskrivelse: 'Styresystem - kontroll av rattets funksjon, styrestamme, styremekanikk',
    ikon: 'steering',
    rekkefølge: 3
  },
  {
    navn: 'Lys',
    beskrivelse: 'Lyssystem og belysning - kontroll av alle lys, reflekser, varsellys',
    ikon: 'light',
    rekkefølge: 4
  },
  {
    navn: 'Drivverk',
    beskrivelse: 'Motor og drivlinje - kontroll av motor, girkasse, kløtsj, aksling',
    ikon: 'engine',
    rekkefølge: 5
  },
  {
    navn: 'Karosseri',
    beskrivelse: 'Karosseri og struktur - kontroll av rust, skader, befestigelser',
    ikon: 'body',
    rekkefølge: 6
  },
  {
    navn: 'Sikkerhetsutstyr',
    beskrivelse: 'Sikkerhetsutstyr - kontroll av airbag, sikkerhetsbelte, nødstopp',
    ikon: 'safety',
    rekkefølge: 7
  },
  {
    navn: 'Elektronikk',
    beskrivelse: 'Elektroniske systemer - kontroll av ABS, ESP, elektroniske hjelpesystemer',
    ikon: 'electronics',
    rekkefølge: 8
  },
  {
    navn: 'Miljø',
    beskrivelse: 'Miljø og utslipp - kontroll av utslippssystem, støy, lekasjer',
    ikon: 'environment',
    rekkefølge: 9
  },
  {
    navn: 'Annet',
    beskrivelse: 'Øvrige kontrollpunkter som ikke passer i andre kategorier',
    ikon: 'other',
    rekkefølge: 10
  }
];

// Førerkortklass-referanser som erstatter hardkodede arrays
const førerkortKlasser = [
  // Motorsykkel
  {
    kode: 'A1',
    navn: 'Lett motorsykkel',
    beskrivelse: 'Motorsykkel med motor på maks 125 cm³ og maks 11 kW',
    kategori: 'Motorsykkel',
    minimumsalder: 16,
    krav: ['Teoretisk prøve', 'Obligatorisk opplæring']
  },
  {
    kode: 'A2',
    navn: 'Mellomtung motorsykkel',
    beskrivelse: 'Motorsykkel med motor på maks 35 kW og effekt/vekt-forhold maks 0,2 kW/kg',
    kategori: 'Motorsykkel',
    minimumsalder: 18,
    krav: ['Teoretisk prøve', 'Praktisk prøve', 'Obligatorisk opplæring']
  },
  {
    kode: 'A',
    navn: 'Tung motorsykkel',
    beskrivelse: 'Motorsykkel uten begrensninger i motoreffekt',
    kategori: 'Motorsykkel',
    minimumsalder: 20,
    krav: ['Teoretisk prøve', 'Praktisk prøve', 'Obligatorisk opplæring', '2 års erfaring med A2']
  },
  
  // Bil
  {
    kode: 'B',
    navn: 'Personbil',
    beskrivelse: 'Motorvogn med tillatt totalvekt inntil 3500 kg, maks 8 seteplasser foruten førerplassen',
    kategori: 'Bil',
    minimumsalder: 18,
    krav: ['Teoretisk prøve', 'Praktisk prøve', 'Obligatorisk opplæring', 'Førstehjelp']
  },
  {
    kode: 'BE',
    navn: 'Personbil med tilhenger',
    beskrivelse: 'Bil klasse B med tilhenger som har totalvekt over 750 kg',
    kategori: 'Bil',
    minimumsalder: 18,
    krav: ['Klasse B', 'Praktisk prøve', 'Obligatorisk opplæring']
  },
  
  // Lastebil lette
  {
    kode: 'C1',
    navn: 'Lett lastebil',
    beskrivelse: 'Motorvogn med tillatt totalvekt fra 3500 kg til 7500 kg',
    kategori: 'Lastebil',
    minimumsalder: 18,
    krav: ['Klasse B', 'Teoretisk prøve', 'Praktisk prøve', 'Obligatorisk opplæring']
  },
  {
    kode: 'C1E',
    navn: 'Lett lastebil med tilhenger',
    beskrivelse: 'Lett lastebil klasse C1 med tilhenger som har totalvekt over 750 kg',
    kategori: 'Lastebil',
    minimumsalder: 18,
    krav: ['Klasse C1', 'Praktisk prøve', 'Obligatorisk opplæring']
  },
  
  // Lastebil tunge
  {
    kode: 'C',
    navn: 'Lastebil',
    beskrivelse: 'Motorvogn med tillatt totalvekt over 3500 kg',
    kategori: 'Lastebil',
    minimumsalder: 21,
    krav: ['Klasse B', 'Teoretisk prøve', 'Praktisk prøve', 'Obligatorisk opplæring', 'Yrkessjåfør-kompetanse']
  },
  {
    kode: 'CE',
    navn: 'Lastebil med tilhenger',
    beskrivelse: 'Lastebil klasse C med tilhenger som har totalvekt over 750 kg',
    kategori: 'Lastebil',
    minimumsalder: 21,
    krav: ['Klasse C', 'Praktisk prøve', 'Obligatorisk opplæring']
  },
  
  // Buss lette
  {
    kode: 'D1',
    navn: 'Liten buss',
    beskrivelse: 'Motorvogn beregnet for transport av flere enn 8, men ikke mer enn 16 personer',
    kategori: 'Buss',
    minimumsalder: 21,
    krav: ['Klasse B', 'Teoretisk prøve', 'Praktisk prøve', 'Obligatorisk opplæring']
  },
  {
    kode: 'D1E',
    navn: 'Liten buss med tilhenger',
    beskrivelse: 'Liten buss klasse D1 med tilhenger som har totalvekt over 750 kg',
    kategori: 'Buss',
    minimumsalder: 21,
    krav: ['Klasse D1', 'Praktisk prøve', 'Obligatorisk opplæring']
  },
  
  // Buss store
  {
    kode: 'D',
    navn: 'Buss',
    beskrivelse: 'Motorvogn beregnet for transport av flere enn 8 personer foruten føreren',
    kategori: 'Buss',
    minimumsalder: 24,
    krav: ['Klasse B', 'Teoretisk prøve', 'Praktisk prøve', 'Obligatorisk opplæring', 'Yrkessjåfør-kompetanse']
  },
  {
    kode: 'DE',
    navn: 'Buss med tilhenger',
    beskrivelse: 'Buss klasse D med tilhenger som har totalvekt over 750 kg',
    kategori: 'Buss',
    minimumsalder: 24,
    krav: ['Klasse D', 'Praktisk prøve', 'Obligatorisk opplæring']
  },
  
  // Spesielle klasser
  {
    kode: 'T',
    navn: 'Traktor',
    beskrivelse: 'Traktor, motorredskap og tilhenger til disse',
    kategori: 'Spesiell',
    minimumsalder: 16,
    krav: ['Teoretisk prøve', 'Praktisk prøve']
  },
  {
    kode: 'S',
    navn: 'Snøscooter',
    beskrivelse: 'Motordrevet kjøretøy beregnet for fremføring på snø',
    kategori: 'Spesiell',
    minimumsalder: 16,
    krav: ['Teoretisk prøve', 'Obligatorisk opplæring']
  }
];

// Seed data konfigurasjon
const seedDataConfig = [
  {
    type: 'demo_bedrifter',
    enabled: false,
    beskrivelse: 'Aktiverer demo-bedrifter for testing og utvikling'
  },
  {
    type: 'demo_elever',
    enabled: false,
    beskrivelse: 'Aktiverer demo-elever for testing og utvikling'
  },
  {
    type: 'demo_kontrakter',
    enabled: false,
    beskrivelse: 'Aktiverer demo-kontrakter for testing og utvikling'
  },
  {
    type: 'demo_quiz',
    enabled: false,
    beskrivelse: 'Aktiverer demo quiz-spørsmål og kategorier'
  },
  {
    type: 'demo_sikkerhetskontroll',
    enabled: false,
    beskrivelse: 'Aktiverer demo sikkerhetskontroll-data'
  },
  {
    type: 'reference_data',
    enabled: true,
    beskrivelse: 'Aktiverer referanse-data (systemer, klasser, etc.)'
  }
];

export async function seedReferenceData() {
  console.log('🌱 Seeding referanse-data...');
  
  try {
    // Seed Sjekkpunkt-systemer
    console.log('📝 Seeding sjekkpunkt-systemer...');
    for (const system of sjekkpunktSystemer) {
      await prisma.sjekkpunktSystem.upsert({
        where: { navn: system.navn },
        update: {
          beskrivelse: system.beskrivelse,
          ikon: system.ikon,
          rekkefølge: system.rekkefølge
        },
        create: system
      });
    }
    console.log(`✅ Opprettet ${sjekkpunktSystemer.length} sjekkpunkt-systemer`);
    
    // Seed Førerkortklass-referanser
    console.log('🚗 Seeding førerkortklass-referanser...');
    for (const klasse of førerkortKlasser) {
      await prisma.førerkortKlasse.upsert({
        where: { kode: klasse.kode },
        update: {
          navn: klasse.navn,
          beskrivelse: klasse.beskrivelse,
          kategori: klasse.kategori,
          minimumsalder: klasse.minimumsalder,
          krav: klasse.krav
        },
        create: klasse
      });
    }
    console.log(`✅ Opprettet ${førerkortKlasser.length} førerkortklass-referanser`);
    
    // Seed data-konfigurasjon
    console.log('⚙️ Seeding data-konfigurasjon...');
    for (const config of seedDataConfig) {
      await prisma.seedDataConfig.upsert({
        where: { type: config.type },
        update: {
          enabled: config.enabled,
          beskrivelse: config.beskrivelse
        },
        create: config
      });
    }
    console.log(`✅ Opprettet ${seedDataConfig.length} konfigurasjon-elementer`);
    
    console.log('🎉 Referanse-data seeding fullført!');
    
  } catch (error) {
    console.error('❌ Feil under seeding av referanse-data:', error);
    throw error;
  }
}

// Kjør seeding hvis scriptet kalles direkte
if (require.main === module) {
  seedReferenceData()
    .then(() => {
      console.log('✅ Referanse-data seed fullført');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Referanse-data seed feilet:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { sjekkpunktSystemer, førerkortKlasser, seedDataConfig }; 