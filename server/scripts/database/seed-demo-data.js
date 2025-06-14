const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Demo bedrifter
const DEMO_BEDRIFTER = [
  {
    navn: 'Oslo Trafikkskole AS',
    organisasjonsnummer: '123456789',
    adresse: 'Storgata 15',
    postnummer: '0155',
    poststed: 'Oslo',
    telefon: '22334455',
    epost: 'post@oslotrafikkskole.no',
    dagligLeder: 'Kari Hansen'
  },
  {
    navn: 'Bergen Kjøreskole',
    organisasjonsnummer: '987654321',
    adresse: 'Bryggen 42',
    postnummer: '5003',
    poststed: 'Bergen',
    telefon: '55667788',
    epost: 'info@bergenkjoreskole.no',
    dagligLeder: 'Ole Nordmann'
  },
  {
    navn: 'Trondheim Transport & Logistikk',
    organisasjonsnummer: '456789123',
    adresse: 'Industriveien 88',
    postnummer: '7030',
    poststed: 'Trondheim',
    telefon: '73445566',
    epost: 'kontakt@ttl.no',
    dagligLeder: 'Astrid Vik'
  },
  {
    navn: 'Stavanger Sikkerhetskurs',
    organisasjonsnummer: '789123456',
    adresse: 'Oljeveien 12',
    postnummer: '4020',
    poststed: 'Stavanger',
    telefon: '51778899',
    epost: 'kurs@stavangersikkerhet.no',
    dagligLeder: 'Lars Petersen'
  },
  {
    navn: 'Kristiansand Bil & Motor',
    organisasjonsnummer: '321654987',
    adresse: 'Motorveien 7',
    postnummer: '4630',
    poststed: 'Kristiansand',
    telefon: '38112233',
    epost: 'service@kbm.no',
    dagligLeder: 'Nina Sørensen'
  }
];

// Demo elever (med gyldige norske test-personnummer fra Skatteetaten)
const DEMO_ELEVER = [
  {
    fornavn: 'Emma',
    etternavn: 'Andersen',
    personnummer: '01010150001', // Gyldig test-personnummer
    telefon: '98765432',
    epost: 'emma.andersen@email.com',
    gate: 'Hjemmeveien 1',
    postnummer: '0123',
    poststed: 'Oslo',
    klassekode: 'B',
    status: 'AKTIV'
  },
  {
    fornavn: 'Noah',
    etternavn: 'Hansen',
    personnummer: '02020250002',
    telefon: '87654321',
    epost: 'noah.hansen@email.com',
    gate: 'Skolegata 15',
    postnummer: '5020',
    poststed: 'Bergen',
    klassekode: 'B',
    status: 'AKTIV'
  },
  {
    fornavn: 'Olivia',
    etternavn: 'Johansen',
    personnummer: '03030350003',
    telefon: '76543210',
    epost: 'olivia.johansen@email.com',
    gate: 'Studentveien 42',
    postnummer: '7040',
    poststed: 'Trondheim',
    klassekode: 'C',
    status: 'AKTIV'
  },
  {
    fornavn: 'William',
    etternavn: 'Olsen',
    personnummer: '04040450004',
    telefon: '65432109',
    epost: 'william.olsen@email.com',
    gate: 'Ungdomsveien 8',
    postnummer: '4050',
    poststed: 'Stavanger',
    klassekode: 'A2',
    status: 'AKTIV'
  },
  {
    fornavn: 'Sofie',
    etternavn: 'Larsen',
    personnummer: '05050550005',
    telefon: '54321098',
    epost: 'sofie.larsen@email.com',
    gate: 'Elevgata 23',
    postnummer: '4640',
    poststed: 'Kristiansand',
    klassekode: 'B',
    status: 'AKTIV'
  },
  {
    fornavn: 'Lucas',
    etternavn: 'Nilsen',
    personnummer: '06060650006',
    telefon: '43210987',
    epost: 'lucas.nilsen@email.com',
    gate: 'Kursveien 67',
    postnummer: '0150',
    poststed: 'Oslo',
    klassekode: 'D',
    status: 'AKTIV'
  },
  {
    fornavn: 'Ella',
    etternavn: 'Pettersen',
    personnummer: '07070750007',
    telefon: '32109876',
    epost: 'ella.pettersen@email.com',
    gate: 'Læringsveien 34',
    postnummer: '5010',
    poststed: 'Bergen',
    klassekode: 'B',
    status: 'AKTIV'
  },
  {
    fornavn: 'Oliver',
    etternavn: 'Kristiansen',
    personnummer: '08080850008',
    telefon: '21098765',
    epost: 'oliver.kristiansen@email.com',
    gate: 'Praksisgata 91',
    postnummer: '7020',
    poststed: 'Trondheim',
    klassekode: 'CE',
    status: 'AKTIV'
  }
];

// Demo ansatte
const DEMO_ANSATTE = [
  {
    fornavn: 'Kari',
    etternavn: 'Hansen',
    epost: 'kari.hansen@oslotrafikkskole.no',
    telefon: '22334455',
    rolle: 'TRAFIKKLARER'
  },
  {
    fornavn: 'Ole',
    etternavn: 'Nordmann',
    epost: 'ole.nordmann@bergenkjoreskole.no',
    telefon: '55667788',
    rolle: 'ADMIN'
  },
  {
    fornavn: 'Astrid',
    etternavn: 'Vik',
    epost: 'astrid.vik@ttl.no',
    telefon: '73445566',
    rolle: 'TRAFIKKLARER'
  },
  {
    fornavn: 'Lars',
    etternavn: 'Petersen',
    epost: 'lars.petersen@stavangersikkerhet.no',
    telefon: '51778899',
    rolle: 'HOVEDBRUKER'
  },
  {
    fornavn: 'Nina',
    etternavn: 'Sørensen',
    epost: 'nina.sorensen@kbm.no',
    telefon: '38112233',
    rolle: 'TRAFIKKLARER'
  }
];

// Demo kontrakter (basert på Kontrakt-modellen)
const DEMO_KONTRAKTER_TEMPLATES = [
  {
    lan: 15000,
    lopetid: 12,
    rente: 8.5,
    etableringsgebyr: 500,
    termingebyr: 50,
    terminerPerAr: 12,
    inkludererGebyrerILan: false,
    effektivRente: 9.2,
    renterOgGebyr: 1775,
    terminbelop: 1398,
    totalRente: 1275,
    totalBelop: 16775,
    status: 'AKTIV'
  },
  {
    lan: 35000,
    lopetid: 24,
    rente: 7.5,
    etableringsgebyr: 1000,
    termingebyr: 75,
    terminerPerAr: 12,
    inkludererGebyrerILan: false,
    effektivRente: 8.8,
    renterOgGebyr: 6800,
    terminbelop: 1742,
    totalRente: 6000,
    totalBelop: 42800,
    status: 'AKTIV'
  },
  {
    lan: 8000,
    lopetid: 6,
    rente: 9.0,
    etableringsgebyr: 300,
    termingebyr: 25,
    terminerPerAr: 12,
    inkludererGebyrerILan: true,
    effektivRente: 10.5,
    renterOgGebyr: 450,
    terminbelop: 1408,
    totalRente: 450,
    totalBelop: 8450,
    status: 'AKTIV'
  },
  {
    lan: 18000,
    lopetid: 18,
    rente: 8.0,
    etableringsgebyr: 600,
    termingebyr: 60,
    terminerPerAr: 12,
    inkludererGebyrerILan: false,
    effektivRente: 9.1,
    renterOgGebyr: 2760,
    terminbelop: 1153,
    totalRente: 2160,
    totalBelop: 20760,
    status: 'AKTIV'
  },
  {
    lan: 42000,
    lopetid: 36,
    rente: 7.0,
    etableringsgebyr: 1200,
    termingebyr: 100,
    terminerPerAr: 12,
    inkludererGebyrerILan: false,
    effektivRente: 8.2,
    renterOgGebyr: 12000,
    terminbelop: 1500,
    totalRente: 8400,
    totalBelop: 54000,
    status: 'AKTIV'
  }
];

async function seedDemoData() {
  console.log('🌱 Starter seeding av demo-data...');

  try {
    // 1. Opprett demo bedrifter
    console.log('📊 Oppretter demo bedrifter...');
    const opprettedeBedrifter = [];
    
    for (const bedriftData of DEMO_BEDRIFTER) {
      const eksisterendeBedrift = await prisma.bedrift.findUnique({
        where: { organisasjonsnummer: bedriftData.organisasjonsnummer }
      });

      if (!eksisterendeBedrift) {
        const bedrift = await prisma.bedrift.create({
          data: bedriftData
        });
        opprettedeBedrifter.push(bedrift);
        console.log(`  ✅ Opprettet bedrift: ${bedrift.navn}`);
      } else {
        opprettedeBedrifter.push(eksisterendeBedrift);
        console.log(`  ⏭️  Bedrift eksisterer allerede: ${eksisterendeBedrift.navn}`);
      }
    }

    // 2. Opprett demo ansatte
    console.log('👥 Oppretter demo ansatte...');
    const opprettedeAnsatte = [];
    
    for (let i = 0; i < DEMO_ANSATTE.length; i++) {
      const ansattData = DEMO_ANSATTE[i];
      const bedrift = opprettedeBedrifter[i % opprettedeBedrifter.length];
      
      const eksisterendeAnsatt = await prisma.ansatt.findUnique({
        where: { epost: ansattData.epost }
      });

      if (!eksisterendeAnsatt) {
        const hashedPassword = await bcrypt.hash('demo123', 10);
        
        const ansatt = await prisma.ansatt.create({
          data: {
            ...ansattData,
            passordHash: hashedPassword,
            bedriftId: bedrift.id
          }
        });
        opprettedeAnsatte.push(ansatt);
        console.log(`  ✅ Opprettet ansatt: ${ansatt.fornavn} ${ansatt.etternavn} (${ansatt.rolle})`);
      } else {
        opprettedeAnsatte.push(eksisterendeAnsatt);
        console.log(`  ⏭️  Ansatt eksisterer allerede: ${eksisterendeAnsatt.fornavn} ${eksisterendeAnsatt.etternavn}`);
      }
    }

    // 3. Opprett demo elever
    console.log('🎓 Oppretter demo elever...');
    const opprettedeElever = [];
    
    for (let i = 0; i < DEMO_ELEVER.length; i++) {
      const elevData = DEMO_ELEVER[i];
      const bedrift = opprettedeBedrifter[i % opprettedeBedrifter.length];
      
      const eksisterendeElev = await prisma.elev.findUnique({
        where: { personnummer: elevData.personnummer }
      });

      if (!eksisterendeElev) {
        const elev = await prisma.elev.create({
          data: {
            ...elevData,
            bedriftId: bedrift.id
          }
        });
        opprettedeElever.push(elev);
        console.log(`  ✅ Opprettet elev: ${elev.fornavn} ${elev.etternavn}`);
      } else {
        opprettedeElever.push(eksisterendeElev);
        console.log(`  ⏭️  Elev eksisterer allerede: ${eksisterendeElev.fornavn} ${eksisterendeElev.etternavn}`);
      }
    }

    // 4. Opprett demo kontrakter
    console.log('📋 Oppretter demo kontrakter...');
    let kontraktTeller = 0;
    
    for (let i = 0; i < opprettedeElever.length; i++) {
      const elev = opprettedeElever[i];
      const bedrift = opprettedeBedrifter.find(b => b.id === elev.bedriftId);
      const ansatt = opprettedeAnsatte.find(a => a.bedriftId === bedrift.id);
      const kontraktTemplate = DEMO_KONTRAKTER_TEMPLATES[i % DEMO_KONTRAKTER_TEMPLATES.length];
      
      // Sjekk om kontrakt allerede eksisterer for denne eleven
      const eksisterendeKontrakt = await prisma.kontrakt.findFirst({
        where: { 
          elevId: elev.id,
          bedriftId: bedrift.id,
          lan: kontraktTemplate.lan
        }
      });

      if (!eksisterendeKontrakt) {
        const kontrakt = await prisma.kontrakt.create({
          data: {
            // Elevinfo fra elev-objektet
            elevId: elev.id,
            elevFornavn: elev.fornavn,
            elevEtternavn: elev.etternavn,
            elevPersonnummer: elev.personnummer,
            elevTelefon: elev.telefon,
            elevEpost: elev.epost,
            elevGate: elev.gate,
            elevPostnr: elev.postnummer,
            elevPoststed: elev.poststed,
            
            // Låneinformasjon fra template
            lan: kontraktTemplate.lan,
            lopetid: kontraktTemplate.lopetid,
            rente: kontraktTemplate.rente,
            etableringsgebyr: kontraktTemplate.etableringsgebyr,
            termingebyr: kontraktTemplate.termingebyr,
            terminerPerAr: kontraktTemplate.terminerPerAr,
            inkludererGebyrerILan: kontraktTemplate.inkludererGebyrerILan,
            
            // Beregnet informasjon
            effektivRente: kontraktTemplate.effektivRente,
            renterOgGebyr: kontraktTemplate.renterOgGebyr,
            terminbelop: kontraktTemplate.terminbelop,
            totalRente: kontraktTemplate.totalRente,
            totalBelop: kontraktTemplate.totalBelop,
            
            // Status og relasjoner
            status: kontraktTemplate.status,
            bedriftId: bedrift.id,
            opprettetAv: ansatt?.id || opprettedeAnsatte[0].id
          }
        });
        kontraktTeller++;
        console.log(`  ✅ Opprettet kontrakt: ID ${kontrakt.id} - ${elev.fornavn} ${elev.etternavn} (${kontraktTemplate.lan} kr)`);
      } else {
        console.log(`  ⏭️  Kontrakt eksisterer allerede: ID ${eksisterendeKontrakt.id}`);
      }
    }

    // 5. Opprett noen ekstra kontrakter for variasjon
    console.log('📝 Oppretter ekstra kontrakter for variasjon...');
    
    for (let i = 0; i < 5; i++) {
      const elev = opprettedeElever[Math.floor(Math.random() * opprettedeElever.length)];
      const bedrift = opprettedeBedrifter.find(b => b.id === elev.bedriftId);
      const ansatt = opprettedeAnsatte.find(a => a.bedriftId === bedrift.id);
      const kontraktTemplate = DEMO_KONTRAKTER_TEMPLATES[Math.floor(Math.random() * DEMO_KONTRAKTER_TEMPLATES.length)];
      
      // Sjekk om ekstra kontrakt allerede eksisterer
      const eksisterendeKontrakt = await prisma.kontrakt.findFirst({
        where: { 
          elevId: elev.id,
          bedriftId: bedrift.id,
          lan: kontraktTemplate.lan + 1000 // Litt forskjellig beløp for ekstra kontrakter
        }
      });

      if (!eksisterendeKontrakt) {
        const kontrakt = await prisma.kontrakt.create({
          data: {
            // Elevinfo fra elev-objektet
            elevId: elev.id,
            elevFornavn: elev.fornavn,
            elevEtternavn: elev.etternavn,
            elevPersonnummer: elev.personnummer,
            elevTelefon: elev.telefon,
            elevEpost: elev.epost,
            elevGate: elev.gate,
            elevPostnr: elev.postnummer,
            elevPoststed: elev.poststed,
            
            // Låneinformasjon (litt variert)
            lan: kontraktTemplate.lan + 1000,
            lopetid: kontraktTemplate.lopetid,
            rente: kontraktTemplate.rente + (Math.random() * 2 - 1), // ±1% variasjon
            etableringsgebyr: kontraktTemplate.etableringsgebyr,
            termingebyr: kontraktTemplate.termingebyr,
            terminerPerAr: kontraktTemplate.terminerPerAr,
            inkludererGebyrerILan: kontraktTemplate.inkludererGebyrerILan,
            
            // Beregnet informasjon (justert)
            effektivRente: kontraktTemplate.effektivRente + 0.5,
            renterOgGebyr: kontraktTemplate.renterOgGebyr + 200,
            terminbelop: kontraktTemplate.terminbelop + 100,
            totalRente: kontraktTemplate.totalRente + 150,
            totalBelop: kontraktTemplate.totalBelop + 1350,
            
            // Status og relasjoner
            status: Math.random() > 0.3 ? 'AKTIV' : 'AVSLUTTET',
            bedriftId: bedrift.id,
            opprettetAv: ansatt?.id || opprettedeAnsatte[0].id
          }
        });
        kontraktTeller++;
        console.log(`  ✅ Opprettet ekstra kontrakt: ID ${kontrakt.id} - ${elev.fornavn} ${elev.etternavn} (${kontrakt.lan} kr)`);
      }
    }

    console.log('\n🎉 Demo-data seeding fullført!');
    console.log(`📊 Opprettet/bekreftet:`);
    console.log(`   - ${opprettedeBedrifter.length} bedrifter`);
    console.log(`   - ${opprettedeAnsatte.length} ansatte`);
    console.log(`   - ${opprettedeElever.length} elever`);
    console.log(`   - ${kontraktTeller} kontrakter`);
    
    // Vis statistikk
    const stats = await prisma.$transaction([
      prisma.bedrift.count(),
      prisma.ansatt.count(),
      prisma.elev.count(),
      prisma.kontrakt.count()
    ]);
    
    console.log(`\n📈 Total statistikk i databasen:`);
    console.log(`   - ${stats[0]} bedrifter totalt`);
    console.log(`   - ${stats[1]} ansatte totalt`);
    console.log(`   - ${stats[2]} elever totalt`);
    console.log(`   - ${stats[3]} kontrakter totalt`);

  } catch (error) {
    console.error('❌ Feil under seeding av demo-data:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedDemoData();
  } catch (error) {
    console.error('❌ Kritisk feil:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Kjør script hvis det kalles direkte
if (require.main === module) {
  main();
}

module.exports = { seedDemoData }; 