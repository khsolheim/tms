const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedQuizData() {
  console.log('🌱 Starting quiz data seeding...');

  try {
    // Check if any quiz data already exists
    const existingCategories = await prisma.quizKategori.count();
    if (existingCategories > 0) {
      console.log('⚠️  Quiz data already exists. Skipping seeding.');
      return;
    }

    // Create quiz categories
    const kategori1 = await prisma.quizKategori.create({
      data: {
        navn: 'Trafikkregler',
        klasse: 'B',
        beskrivelse: 'Grunnleggende trafikkregler for bil',
        farge: '#3B82F6',
        ikon: 'TrafficLightIcon',
        moduleType: 'standard',
        estimatedDuration: 15,
        aktiv: true
      }
    });

    const kategori2 = await prisma.quizKategori.create({
      data: {
        navn: 'Sikkerhet',
        klasse: 'B',
        beskrivelse: 'Sikkerhet i trafikken',
        farge: '#EF4444',
        ikon: 'ShieldCheckIcon',
        moduleType: 'micro',
        estimatedDuration: 10,
        aktiv: true
      }
    });

    const kategori3 = await prisma.quizKategori.create({
      data: {
        navn: 'Miljø og Økonomi',
        klasse: 'B',
        beskrivelse: 'Miljøvennlig og økonomisk kjøring',
        farge: '#10B981',
        ikon: 'LeafIcon',
        moduleType: 'adaptive',
        estimatedDuration: 20,
        aktiv: true
      }
    });

    console.log('✅ Quiz kategorier opprettet');

    // Create quiz questions
    await prisma.quizSporsmal.createMany({
      data: [
        {
          tekst: 'Hva er fartsgrensen i tettbebygd strøk?',
          svaralternativer: JSON.stringify(['30 km/h', '50 km/h', '60 km/h', '80 km/h']),
          riktigSvar: 1,
          forklaring: 'Fartsgrensen i tettbebygd strøk er 50 km/h dersom ikke annet er skiltet.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori1.id,
          vanskelighetsgrad: 'Lett',
          estimertTid: 30,
          aiGenerated: false
        },
        {
          tekst: 'Hvor lang er stopplengden ved 50 km/h på tørr asfalt?',
          svaralternativer: JSON.stringify(['15 meter', '25 meter', '35 meter', '50 meter']),
          riktigSvar: 1,
          forklaring: 'Stopplengden ved 50 km/h på tørr asfalt er cirka 25 meter.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori1.id,
          vanskelighetsgrad: 'Middels',
          estimertTid: 45,
          aiGenerated: false
        },
        {
          tekst: 'Når er det påbudt å bruke nærlys på bil?',
          svaralternativer: JSON.stringify(['Bare når det er mørkt', 'Bare i tunnel', 'Alltid når du kjører', 'Bare ved dårlig sikt']),
          riktigSvar: 2,
          forklaring: 'Du skal alltid kjøre med nærlys på bil, hele døgnet.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori1.id,
          vanskelighetsgrad: 'Lett',
          estimertTid: 25,
          aiGenerated: false
        },
        {
          tekst: 'Hvor dypt skal dekkenes hovedrillegruver være minimum?',
          svaralternativer: JSON.stringify(['1,0 mm', '1,6 mm', '2,0 mm', '3,0 mm']),
          riktigSvar: 1,
          forklaring: 'Dekkenes hovedrillegruver skal være minimum 1,6 mm dype.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori2.id,
          vanskelighetsgrad: 'Lett',
          estimertTid: 20,
          aiGenerated: false
        },
        {
          tekst: 'Hvilken kjøreteknikk gir lavest drivstofforbruk?',
          svaralternativer: JSON.stringify(['Høy hastighet med lav turtall', 'Lav hastighet med høy turtall', 'Jevn hastighet med moderat turtall', 'Varierende hastighet']),
          riktigSvar: 2,
          forklaring: 'Jevn hastighet med moderat turtall gir det laveste drivstofforbruket.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori3.id,
          vanskelighetsgrad: 'Middels',
          estimertTid: 35,
          aiGenerated: false
        }
      ]
    });

    console.log('✅ Quiz spørsmål opprettet');

    // Create a test user if it doesn't exist
    let testUser = await prisma.ansatt.findFirst({
      where: { epost: 'test@example.com' }
    });

    if (!testUser) {
      testUser = await prisma.ansatt.create({
        data: {
          fornavn: 'Test',
          etternavn: 'Bruker',
          epost: 'test@example.com',
          passordHash: '$2b$12$...',
          tilganger: JSON.stringify(['quiz']),
          klasser: JSON.stringify(['B']),
          kjoretoy: JSON.stringify([]),
          rolle: 'TRAFIKKLARER',
          aktiv: true
        }
      });
    }

    // Create user preferences
    await prisma.userPreferences.upsert({
      where: { userId: testUser.id },
      create: {
        userId: testUser.id,
        preferredDifficulty: 'Middels',
        learningStyle: 'VISUAL',
        sessionDuration: 15,
        notifications: { email: true, push: false },
        accessibility: { highContrast: false, textScale: 1.0 },
        themes: { darkMode: false }
      },
      update: {}
    });

    console.log('✅ Test bruker opprettet');

    console.log('🎉 Quiz data seeding fullført!');

  } catch (error) {
    console.error('❌ Feil ved seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedQuizData();
}

module.exports = { seedQuizData };