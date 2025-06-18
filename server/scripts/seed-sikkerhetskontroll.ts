import { PrismaClient, SikkerhetskontrollVanskelighetsgrad, SikkerhetskontrollMediaType, SikkerhetskontrollAchievementType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSikkerhetskontrollData() {
  console.log('🌱 Seeding sikkerhetskontroll læring data...');

  try {
    // ============================================================================
    // KLASSER
    // ============================================================================
    console.log('📚 Creating førerkortklasser...');
    
    const klasseB = await prisma.sikkerhetskontrollKlasse.upsert({
      where: { navn: 'Klasse B' },
      update: {},
      create: {
        navn: 'Klasse B',
        beskrivelse: 'Personbil opptil 3500 kg',
        ikonUrl: '/icons/bil-klasse-b.svg',
        rekkefolge: 1
      }
    });

    const klasseC = await prisma.sikkerhetskontrollKlasse.upsert({
      where: { navn: 'Klasse C' },
      update: {},
      create: {
        navn: 'Klasse C',
        beskrivelse: 'Lastebil over 3500 kg',
        ikonUrl: '/icons/bil-klasse-c.svg',
        rekkefolge: 2
      }
    });

    // ============================================================================
    // KATEGORIER FOR KLASSE B
    // ============================================================================
    console.log('📂 Creating kategorier for Klasse B...');

    const kategorier = [
      {
        navn: 'Bremser',
        beskrivelse: 'Kontroll av bilens bremsesystem',
        ikonUrl: '/icons/bremser.svg',
        farge: '#ef4444',
        rekkefolge: 1
      },
      {
        navn: 'Lys',
        beskrivelse: 'Kontroll av alle lyskilder på bilen',
        ikonUrl: '/icons/lys.svg',
        farge: '#f59e0b',
        rekkefolge: 2
      },
      {
        navn: 'Motorrom',
        beskrivelse: 'Kontroll under panseret',
        ikonUrl: '/icons/motorrom.svg',
        farge: '#10b981',
        rekkefolge: 3
      },
      {
        navn: 'Dekk og Hjul',
        beskrivelse: 'Kontroll av dekk og hjuloppheng',
        ikonUrl: '/icons/dekk.svg',
        farge: '#3b82f6',
        rekkefolge: 4
      },
      {
        navn: 'Vinduer og Speil',
        beskrivelse: 'Kontroll av siktforhold',
        ikonUrl: '/icons/vinduer.svg',
        farge: '#8b5cf6',
        rekkefolge: 5
      }
    ];

    const kategoriObjekter: any[] = [];
    for (const kat of kategorier) {
      const kategori = await prisma.sikkerhetskontrollKategori.upsert({
        where: {
          unique_kategori_per_klasse: {
            navn: kat.navn,
            klasseId: klasseB.id
          }
        },
        update: kat,
        create: {
          ...kat,
          klasseId: klasseB.id
        }
      });
      kategoriObjekter.push(kategori);
    }

    // ============================================================================
    // SPØRSMÅL FOR BREMSER-KATEGORIEN
    // ============================================================================
    console.log('❓ Creating spørsmål for Bremser...');

    const bremserKategori = kategoriObjekter.find(k => k.navn === 'Bremser')!;

    const bremserSporsmal = [
      {
        sporsmalTekst: 'Hvordan sjekker du bremsepedalens gang?',
        svarKort: 'Trykk pedalen ned til bunns og sjekk motstanden',
        svarDetaljert: 'Trykk bremsepedalene rolig ned til bunns. Pedalen skal ha god motstand og ikke synke til bunns uten motstand. Den skal holde seg fast når du holder trykket.',
        hvorforderVikreligTekst: 'Bremsepedalens gang forteller deg om det er luft i bremsesystemet eller om det er andre problemer som kan påvirke bremseevnen kritisk.',
        vanskelighetsgrad: SikkerhetskontrollVanskelighetsgrad.LETT,
        rekkefolge: 1
      },
      {
        sporsmalTekst: 'Hvor sjekker du bremsevæskenivået?',
        svarKort: 'I bremsevæskebeholderen i motorrommet',
        svarDetaljert: 'Bremsevæskebeholderen er vanligvis plassert på førersiden av motorrommet, festet til brannmuren. Den har MAX og MIN markeringer på siden.',
        hvorforderVikreligTekst: 'For lite bremsevæske kan føre til at bremsene svikter, mens gamle bremsevæske kan ha for høyt vanninnhold og koke under hard bremsing.',
        vanskelighetsgrad: SikkerhetskontrollVanskelighetsgrad.LETT,
        rekkefolge: 2
      },
      {
        sporsmalTekst: 'Hvordan sjekker du parkeringsbremsen?',
        svarKort: 'Trekk håndbrekket og sjekk at bilen holder seg fast i bakke',
        svarDetaljert: 'Sett bilen i en liten bakke, aktiver parkeringsbremsen og slip clutch/gir for å teste at bilen holder seg fast. Du kan også telle antall "klikk" - det skal ikke være mer enn 7-8 klikk til bremsen griper.',
        hvorforderVikreligTekst: 'En parkeringsbrems som ikke holder kan føre til at bilen ruller av sted når den er parkert, noe som kan skade både bil og mennesker.',
        vanskelighetsgrad: SikkerhetskontrollVanskelighetsgrad.MIDDELS,
        rekkefolge: 3
      }
    ];

    for (const sporsmal of bremserSporsmal) {
      await prisma.sikkerhetskontrollSporsmal.create({
        data: {
          ...sporsmal,
          kategoriId: bremserKategori.id
        }
      });
    }

    // ============================================================================
    // SPØRSMÅL FOR LYS-KATEGORIEN
    // ============================================================================
    console.log('💡 Creating spørsmål for Lys...');

    const lysKategori = kategoriObjekter.find(k => k.navn === 'Lys')!;

    const lysSporsmal = [
      {
        sporsmalTekst: 'Hvilke lys må du sjekke foran på bilen?',
        svarKort: 'Nærlys, fjernlys, parkeringslys, blinklys og eventuelt tåkelys',
        svarDetaljert: 'Foran på bilen skal du kontrollere: Nærlys (begge sider), fjernlys (begge sider), parkeringslys/posisjonsLys, blinklys (begge sider). Hvis bilen har tåkelys foran, skal også disse sjekkes.',
        hvorforderVikreligTekst: 'Defekte lys foran reduserer din sikt og gjør at andre trafikanter ikke ser deg. Dette øker risikoen for ulykker dramatisk, spesielt i mørket.',
        vanskelighetsgrad: SikkerhetskontrollVanskelighetsgrad.LETT,
        rekkefolge: 1
      },
      {
        sporsmalTekst: 'Hvordan sjekker du baklyselne?',
        svarKort: 'Be noen stå bak bilen mens du tester alle lys',
        svarDetaljert: 'Be en medpassasjer eller annen person stå bak bilen og gi tilbakemelding mens du aktiverer: Baklys, blinklys, refleks, ryggelys og bremseLys. Alternativt kan du bruke refleksjon i en vegg eller vinduer.',
        hvorforderVikreligTekst: 'Baklyselne varsler andre trafikanter om din tilstedeværelse, intensjoner (blinking) og bremsing. Defekte baklys er en stor ulykksrisiko.',
        vanskelighetsgrad: SikkerhetskontrollVanskelighetsgrad.LETT,
        rekkefolge: 2
      },
      {
        sporsmalTekst: 'Hvordan sjekker du lyskeglenes innstilling?',
        svarKort: 'Kjør mot en vegg eller se på lysbildet på veien',
        svarDetaljert: 'Kjør med nærlys mot en jevn vegg i mørket (ca. 5 meter unna). Lyskeglene skal være symmetriske og ikke peke for høyt opp eller for mye til sidene. På veien skal lyskeglene lyse ca. 50-70 meter fremover uten å blende motgående trafikk.',
        hvorforderVikreligTekst: 'Feil innstilte lys blender andre bilister eller gir dårlig sikt, noe som øker risikoen for frontkollisjoner og andre alvorlige ulykker.',
        vanskelighetsgrad: SikkerhetskontrollVanskelighetsgrad.VANSKELIG,
        rekkefolge: 3
      }
    ];

    for (const sporsmal of lysSporsmal) {
      await prisma.sikkerhetskontrollSporsmal.create({
        data: {
          ...sporsmal,
          kategoriId: lysKategori.id
        }
      });
    }

    // ============================================================================
    // ACHIEVEMENTS
    // ============================================================================
    console.log('🏆 Creating achievements...');

    const achievements = [
      {
        navn: 'God Start',
        beskrivelse: 'Fullført din første test!',
        ikonUrl: '/icons/trophy-bronze.svg',
        type: SikkerhetskontrollAchievementType.INNSATS,
        kriteria: { mestretSporsmal: 5 },
        xpBelonning: 50
      },
      {
        navn: 'Lysmester',
        beskrivelse: 'Mestret alle spørsmål om lys',
        ikonUrl: '/icons/trophy-light.svg',
        type: SikkerhetskontrollAchievementType.FERDIGHET,
        kriteria: { kategori: 'Lys', mestringsprosent: 100 },
        xpBelonning: 100
      },
      {
        navn: 'Bremsemester',
        beskrivelse: 'Mestret alle spørsmål om bremser',
        ikonUrl: '/icons/trophy-brake.svg',
        type: SikkerhetskontrollAchievementType.FERDIGHET,
        kriteria: { kategori: 'Bremser', mestringsprosent: 100 },
        xpBelonning: 100
      },
      {
        navn: 'Utholdende',
        beskrivelse: 'Øvd 5 dager på rad',
        ikonUrl: '/icons/trophy-streak.svg',
        type: SikkerhetskontrollAchievementType.INNSATS,
        kriteria: { dagerPaRad: 5 },
        xpBelonning: 75
      },
      {
        navn: 'Natteravn',
        beskrivelse: 'Fullført en økt etter kl. 23:00',
        ikonUrl: '/icons/trophy-night.svg',
        type: SikkerhetskontrollAchievementType.SPESIELL,
        kriteria: { tidspunkt: 'etter_23' },
        xpBelonning: 25,
        skjult: true
      },
      {
        navn: 'Bil Bygger',
        beskrivelse: 'Nådd 50% progresjon i Klasse B',
        ikonUrl: '/icons/trophy-builder.svg',
        type: SikkerhetskontrollAchievementType.FERDIGHET,
        kriteria: { klasseBProgresjon: 50 },
        xpBelonning: 150
      },
      {
        navn: 'Mester Sjåfør',
        beskrivelse: 'Fullført hele Klasse B med 100% mestring',
        ikonUrl: '/icons/trophy-gold.svg',
        type: SikkerhetskontrollAchievementType.FERDIGHET,
        kriteria: { klasseBProgresjon: 100 },
        xpBelonning: 500,
        sjelden: true
      }
    ];

    for (const achievement of achievements) {
      await prisma.sikkerhetskontrollAchievement.upsert({
        where: { navn: achievement.navn },
        update: achievement,
        create: achievement
      });
    }

    console.log('✅ Sikkerhetskontroll læring data seeded successfully!');
    
    // Print statistikk
    const antallKlasser = await prisma.sikkerhetskontrollKlasse.count();
    const antallKategorier = await prisma.sikkerhetskontrollKategori.count();
    const antallSporsmal = await prisma.sikkerhetskontrollSporsmal.count();
    const antallAchievements = await prisma.sikkerhetskontrollAchievement.count();

    console.log(`📊 Statistikk:`);
    console.log(`   - ${antallKlasser} klasser`);
    console.log(`   - ${antallKategorier} kategorier`);
    console.log(`   - ${antallSporsmal} spørsmål`);
    console.log(`   - ${antallAchievements} achievements`);

  } catch (error) {
    console.error('❌ Error seeding sikkerhetskontroll data:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedSikkerhetskontrollData();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedSikkerhetskontrollData }; 