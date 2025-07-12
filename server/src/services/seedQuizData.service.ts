import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SeedQuizDataService {
  
  async seedBasicQuizData(): Promise<void> {
    console.log('🌱 Seeding quiz data...');

    try {
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

      // Create quiz questions for category 1 (Trafikkregler)
      const sporsmal1 = await prisma.quizSporsmal.create({
        data: {
          tekst: 'Hva er fartsgrensen i tettbebygd strøk?',
          svaralternativer: JSON.stringify(['30 km/h', '50 km/h', '60 km/h', '80 km/h']),
          riktigSvar: 1,
          forklaring: 'Fartsgrensen i tettbebygd strøk er 50 km/h dersom ikke annet er skiltet.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori1.id,
          vanskelighetsgrad: 'Lett',
          estimertTid: 30,
          aiGenerated: false
        }
      });

      const sporsmal2 = await prisma.quizSporsmal.create({
        data: {
          tekst: 'Hvor lang er stopplengden ved 50 km/h på tørr asfalt?',
          svaralternativer: JSON.stringify(['15 meter', '25 meter', '35 meter', '50 meter']),
          riktigSvar: 1,
          forklaring: 'Stopplengden ved 50 km/h på tørr asfalt er cirka 25 meter (reaksjonsstrekning + bremsevei).',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori1.id,
          vanskelighetsgrad: 'Middels',
          estimertTid: 45,
          aiGenerated: false
        }
      });

      const sporsmal3 = await prisma.quizSporsmal.create({
        data: {
          tekst: 'Når er det påbudt å bruke nærlys på bil?',
          svaralternativer: JSON.stringify([
            'Bare når det er mørkt',
            'Bare i tunnel',
            'Alltid når du kjører',
            'Bare ved dårlig sikt'
          ]),
          riktigSvar: 2,
          forklaring: 'Du skal alltid kjøre med nærlys på bil, hele døgnet.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori1.id,
          vanskelighetsgrad: 'Lett',
          estimertTid: 25,
          aiGenerated: false
        }
      });

      // Create quiz questions for category 2 (Sikkerhet)
      const sporsmal4 = await prisma.quizSporsmal.create({
        data: {
          tekst: 'Hva er riktig rekkefølge for sikkerhetskontroll før kjøring?',
          svaralternativer: JSON.stringify([
            'Speil, belysning, dekk, bremser',
            'Dekk, speil, belysning, bremser',
            'Speil, dekk, belysning, bremser',
            'Belysning, speil, dekk, bremser'
          ]),
          riktigSvar: 0,
          forklaring: 'Riktig rekkefølge er: speil, belysning, dekk, bremser.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori2.id,
          vanskelighetsgrad: 'Middels',
          estimertTid: 40,
          aiGenerated: false
        }
      });

      const sporsmal5 = await prisma.quizSporsmal.create({
        data: {
          tekst: 'Hvor dypt skal dekkenes hovedrillegruver være minimum?',
          svaralternativer: JSON.stringify(['1,0 mm', '1,6 mm', '2,0 mm', '3,0 mm']),
          riktigSvar: 1,
          forklaring: 'Dekkenes hovedrillegruver skal være minimum 1,6 mm dype.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori2.id,
          vanskelighetsgrad: 'Lett',
          estimertTid: 20,
          aiGenerated: false
        }
      });

      // Create quiz questions for category 3 (Miljø og Økonomi)
      const sporsmal6 = await prisma.quizSporsmal.create({
        data: {
          tekst: 'Hvilken kjøreteknikk gir lavest drivstofforbruk?',
          svaralternativer: JSON.stringify([
            'Høy hastighet med lav turtall',
            'Lav hastighet med høy turtall',
            'Jevn hastighet med moderat turtall',
            'Varierende hastighet'
          ]),
          riktigSvar: 2,
          forklaring: 'Jevn hastighet med moderat turtall gir det laveste drivstofforbruket.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori3.id,
          vanskelighetsgrad: 'Middels',
          estimertTid: 35,
          aiGenerated: false
        }
      });

      const sporsmal7 = await prisma.quizSporsmal.create({
        data: {
          tekst: 'Hva er den mest miljøvennlige måten å starte en kald motor på?',
          svaralternativer: JSON.stringify([
            'La motoren gå på tomgang i 10 minutter',
            'Kjør forsiktig med det samme',
            'La motoren gå på tomgang i 5 minutter',
            'Gi gass før du kjører'
          ]),
          riktigSvar: 1,
          forklaring: 'Kjør forsiktig med det samme. Moderne motorer trenger ikke oppvarming på tomgang.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori3.id,
          vanskelighetsgrad: 'Lett',
          estimertTid: 30,
          aiGenerated: false
        }
      });

      console.log('✅ Quiz spørsmål opprettet');

      // Create a test user and quiz session
      const testUser = await prisma.ansatt.findFirst({
        where: { epost: { contains: '@' } }
      });

      if (testUser) {
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

        // Create sample quiz session
        const session = await prisma.quizSession.create({
          data: {
            userId: testUser.id,
            kategoriId: kategori1.id,
            quizType: 'standard',
            questionsTotal: 5,
            questionsAnswered: 5,
            questionsCorrect: 4,
            difficulty: 'Middels',
            completed: true,
            score: 80,
            percentage: 80,
            timeSpent: 180,
            sessionIntegrity: 'sample-hash'
          }
        });

        // Create sample answers
        await prisma.quizSessionAnswer.createMany({
          data: [
            {
              sessionId: session.id,
              questionId: sporsmal1.id,
              userAnswer: 1,
              correctAnswer: 1,
              isCorrect: true,
              timeSpent: 35
            },
            {
              sessionId: session.id,
              questionId: sporsmal2.id,
              userAnswer: 2,
              correctAnswer: 1,
              isCorrect: false,
              timeSpent: 45
            },
            {
              sessionId: session.id,
              questionId: sporsmal3.id,
              userAnswer: 2,
              correctAnswer: 2,
              isCorrect: true,
              timeSpent: 30
            }
          ]
        });

        // Award some XP
        await prisma.quizXP.createMany({
          data: [
            {
              userId: testUser.id,
              sessionId: session.id,
              xpGained: 80,
              xpType: 'quiz_completion',
              source: session.id
            },
            {
              userId: testUser.id,
              xpGained: 20,
              xpType: 'daily_bonus',
              source: 'daily_login'
            }
          ]
        });

        // Create an achievement
        await prisma.userAchievement.create({
          data: {
            userId: testUser.id,
            achievementId: 'first_steps',
            progress: 100,
            metadata: { name: 'Første skritt', description: 'Fullført første quiz' }
          }
        });

        console.log('✅ Sample brukerdata opprettet');
      }

      // Create some additional categories with subcategories
      const hovedkategori = await prisma.quizKategori.create({
        data: {
          navn: 'Avansert Kjøring',
          klasse: 'B',
          beskrivelse: 'Avanserte kjøreteknikker',
          farge: '#8B5CF6',
          ikon: 'StarIcon',
          moduleType: 'standard',
          estimatedDuration: 25,
          aktiv: true
        }
      });

      await prisma.quizKategori.create({
        data: {
          navn: 'Vinterkjøring',
          klasse: 'B',
          beskrivelse: 'Kjøring under vinterforhold',
          farge: '#06B6D4',
          ikon: 'SnowflakeIcon',
          hovedkategoriId: hovedkategori.id,
          moduleType: 'micro',
          estimatedDuration: 12,
          aktiv: true
        }
      });

      await prisma.quizKategori.create({
        data: {
          navn: 'Motorveikjøring',
          klasse: 'B',
          beskrivelse: 'Sikker kjøring på motorvei',
          farge: '#F59E0B',
          ikon: 'RocketLaunchIcon',
          hovedkategoriId: hovedkategori.id,
          moduleType: 'adaptive',
          estimatedDuration: 18,
          aktiv: true
        }
      });

      console.log('✅ Hierarkiske kategorier opprettet');

      // Create some multimedia questions
      await prisma.quizSporsmal.create({
        data: {
          tekst: 'Se på bildet. Hvilken trafikkregel gjelder her?',
          svaralternativer: JSON.stringify([
            'Høyre har forkjørsrett',
            'Venstre har forkjørsrett', 
            'Stoppskilt gjelder',
            'Vikeplikt for alle'
          ]),
          riktigSvar: 2,
          forklaring: 'Stoppskilt har forkjørsrett over andre reguleringer.',
          klasser: JSON.stringify(['B']),
          kategoriId: kategori1.id,
          vanskelighetsgrad: 'Vanskelig',
          mediaType: 'image',
          mediaUrl: '/images/quiz/stoppskilt-kryss.jpg',
          mediaMetadata: JSON.stringify({
            width: 800,
            height: 600,
            alt: 'Veikryss med stoppskilt'
          }),
          estimertTid: 60,
          aiGenerated: false
        }
      });

      console.log('✅ Multimedia spørsmål opprettet');

      console.log('🎉 Quiz data seeding komplett!');

    } catch (error) {
      console.error('❌ Feil ved seeding av quiz data:', error);
      throw error;
    }
  }

  async createSamplePerformanceData(): Promise<void> {
    console.log('📊 Creating sample performance data...');

    try {
      const users = await prisma.ansatt.findMany({
        take: 5,
        where: { aktiv: true }
      });

      for (const user of users) {
        // Create performance metrics for different periods
        const currentDate = new Date();
        
        await prisma.performanceMetrics.createMany({
          data: [
            {
              userId: user.id,
              period: 'daily',
              periodDate: currentDate,
              totalSessions: Math.floor(Math.random() * 5) + 1,
              averageScore: Math.random() * 40 + 60, // 60-100%
              averageTime: Math.random() * 30 + 20, // 20-50 seconds per question
              improvementRate: (Math.random() - 0.5) * 20, // -10 to +10%
              streakCount: Math.floor(Math.random() * 7),
              metadata: { source: 'seed_data' }
            },
            {
              userId: user.id,
              period: 'weekly',
              periodDate: new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay())),
              totalSessions: Math.floor(Math.random() * 20) + 5,
              averageScore: Math.random() * 30 + 65,
              averageTime: Math.random() * 25 + 25,
              improvementRate: (Math.random() - 0.5) * 15,
              streakCount: Math.floor(Math.random() * 14),
              metadata: { source: 'seed_data' }
            }
          ]
        });

        // Create learning patterns
        await prisma.learningPattern.create({
          data: {
            userId: user.id,
            patternType: 'learning_style',
            patternData: {
              style: ['VISUAL', 'AUDITORY', 'KINESTHETIC'][Math.floor(Math.random() * 3)],
              confidence: 0.8
            },
            confidence: 0.8,
            strength: Math.random() * 0.5 + 0.5
          }
        });
      }

      console.log('✅ Sample performance data created');

    } catch (error) {
      console.error('❌ Error creating performance data:', error);
      throw error;
    }
  }
}

export default new SeedQuizDataService();