const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function leggTilKontrollMaler() {
  try {
    console.log('Starter å legge til kontrollmaler...');

    // Finn en ADMIN bruker
    const adminBruker = await prisma.ansatt.findFirst({
      where: { rolle: 'ADMIN' }
    });

    if (!adminBruker) {
      console.log('Ingen ADMIN bruker funnet, oppretter en...');
      return;
    }

    // Hent noen sjekkpunkter
    const sjekkpunkter = await prisma.sjekkpunkt.findMany({
      take: 20
    });

    if (sjekkpunkter.length === 0) {
      console.log('Ingen sjekkpunkter funnet i databasen');
      return;
    }

    console.log(`Funnet ${sjekkpunkter.length} sjekkpunkter`);

    // Mal 1: A1 Standard førerkontroll
    const a1Sjekkpunkter = sjekkpunkter.filter(s => 
      s.forerkortklass.includes('A1') && 
      (s.tittel.includes('Kontroll av førerkort') || 
       s.tittel.includes('Hjelmutstyr') || 
       s.tittel.includes('Sikkerhetsutstyr') ||
       s.tittel.includes('Kjøretøykontroll'))
    ).slice(0, 6);

    if (a1Sjekkpunkter.length > 0) {
      const a1Mal = await prisma.kontrollMal.create({
        data: {
          navn: 'A1 Standard førerkontroll',
          beskrivelse: 'Fullstendig førerkontroll for A1 motorcykel inkludert utstyr og kjøretøy',
          kategori: 'A1',
          tags: ['standard', 'førerkontroll', 'motorcykel', 'utstyr'],
          opprettetAvId: adminBruker.id,
          offentlig: true,
          punkter: {
            create: a1Sjekkpunkter.map((punkt, index) => ({
              sjekkpunktId: punkt.id,
              rekkefølge: index + 1,
              kanGodkjennesAv: 'LAERER',
              påkrevd: true
            }))
          }
        }
      });
      console.log(`Opprettet A1 mal med ID: ${a1Mal.id}`);
    }

    // Mal 2: B klasse basissjekk
    const bSjekkpunkter = sjekkpunkter.filter(s => 
      s.system === 'Bremser' || 
      s.system === 'Lys' || 
      s.system === 'Dekk'
    ).slice(0, 5);

    if (bSjekkpunkter.length > 0) {
      const bMal = await prisma.kontrollMal.create({
        data: {
          navn: 'B klasse basissjekk',
          beskrivelse: 'Grunnleggende sikkerhetskontroll for personbil',
          kategori: 'B',
          tags: ['basis', 'personbil', 'sikkerhet'],
          opprettetAvId: adminBruker.id,
          offentlig: true,
          punkter: {
            create: bSjekkpunkter.map((punkt, index) => ({
              sjekkpunktId: punkt.id,
              rekkefølge: index + 1,
              kanGodkjennesAv: index < 2 ? 'LAERER' : 'BEGGE',
              påkrevd: true
            }))
          }
        }
      });
      console.log(`Opprettet B klasse mal med ID: ${bMal.id}`);
    }

    // Mal 3: Generell pre-trip inspeksjon
    const generelleSjekkpunkter = sjekkpunkter.filter(s => 
      s.typeKontroll === 'VISUELL'
    ).slice(0, 4);

    if (generelleSjekkpunkter.length > 0) {
      const generellMal = await prisma.kontrollMal.create({
        data: {
          navn: 'Generell pre-trip inspeksjon',
          beskrivelse: 'Visuell kontroll som bør gjøres før enhver kjøretur',
          kategori: 'Generell',
          tags: ['pre-trip', 'visuell', 'daglig', 'alle-klasser'],
          opprettetAvId: adminBruker.id,
          offentlig: true,
          punkter: {
            create: generelleSjekkpunkter.map((punkt, index) => ({
              sjekkpunktId: punkt.id,
              rekkefølge: index + 1,
              kanGodkjennesAv: 'ELEV',
              påkrevd: index < 2
            }))
          }
        }
      });
      console.log(`Opprettet generell mal med ID: ${generellMal.id}`);
    }

    // Mal 4: C klasse tungbil inspeksjon  
    const cSjekkpunkter = sjekkpunkter.filter(s => 
      s.system === 'Bremser' || 
      s.system === 'Drivverk' ||
      s.typeKontroll === 'FYSISK'
    ).slice(0, 8);

    if (cSjekkpunkter.length > 0) {
      const cMal = await prisma.kontrollMal.create({
        data: {
          navn: 'C klasse tungbil inspeksjon',
          beskrivelse: 'Omfattende kontroll for tungbil inkludert bremsesystem og drivverk',
          kategori: 'C',
          tags: ['tungbil', 'omfattende', 'kommersiell', 'bremsesystem'],
          opprettetAvId: adminBruker.id,
          offentlig: true,
          punkter: {
            create: cSjekkpunkter.map((punkt, index) => ({
              sjekkpunktId: punkt.id,
              rekkefølge: index + 1,
              kanGodkjennesAv: 'LAERER',
              påkrevd: index < 5
            }))
          }
        }
      });
      console.log(`Opprettet C klasse mal med ID: ${cMal.id}`);
    }

    // Mal 5: Vinter-spesifikk kontroll
    const vinterSjekkpunkter = sjekkpunkter.filter(s => 
      s.system === 'Dekk' || 
      s.system === 'Lys' ||
      s.tittel.toLowerCase().includes('kjøretøy')
    ).slice(0, 5);

    if (vinterSjekkpunkter.length > 0) {
      const vinterMal = await prisma.kontrollMal.create({
        data: {
          navn: 'Vinter-spesifikk kontroll',
          beskrivelse: 'Ekstra kontrollpunkter for vinterkjøring med fokus på dekk og lys',
          kategori: 'Generell',
          tags: ['vinter', 'vinterdekk', 'lys', 'sesongrelatert'],
          opprettetAvId: adminBruker.id,
          offentlig: true,
          punkter: {
            create: vinterSjekkpunkter.map((punkt, index) => ({
              sjekkpunktId: punkt.id,
              rekkefølge: index + 1,
              kanGodkjennesAv: index === 0 ? 'LAERER' : 'BEGGE',
              påkrevd: true
            }))
          }
        }
      });
      console.log(`Opprettet vinter mal med ID: ${vinterMal.id}`);
    }

    console.log('Alle kontrollmaler er lagt til!');

  } catch (error) {
    console.error('Feil ved oppretting av kontrollmaler:', error);
  } finally {
    await prisma.$disconnect();
  }
}

leggTilKontrollMaler(); 