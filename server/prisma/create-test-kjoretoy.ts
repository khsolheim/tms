import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const kjøretøyTyper = [
  'Personbil', 'Lastebil', 'Buss', 'Varebil', 'Motorsykkel'
];

const merker = [
  'Toyota', 'Volvo', 'Mercedes', 'BMW', 'Audi', 'Ford', 'Volkswagen', 'Scania', 'MAN', 'Iveco'
];

const modeller = {
  'Toyota': ['Corolla', 'Avensis', 'Camry', 'Yaris', 'RAV4'],
  'Volvo': ['FH', 'FM', 'FMX', 'V70', 'XC90'],
  'Mercedes': ['Actros', 'Atego', 'C-Class', 'E-Class', 'Sprinter'],
  'BMW': ['3-serie', '5-serie', 'X3', 'X5', '1-serie'],
  'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7'],
  'Ford': ['Focus', 'Transit', 'Mondeo', 'Fiesta', 'Kuga'],
  'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Crafter'],
  'Scania': ['R-serie', 'S-serie', 'P-serie', 'G-serie', 'L-serie'],
  'MAN': ['TGX', 'TGS', 'TGL', 'TGM', 'TGE'],
  'Iveco': ['Stralis', 'Eurocargo', 'Daily', 'Trakker', 'S-Way']
};

const statusTyper = ['Godkjent', 'Under reparasjon', 'Ikke godkjent', 'Utleid'];

const førerkortKlasser = {
  'Personbil': [['B'], ['B', 'BE']],
  'Lastebil': [['C'], ['C', 'CE'], ['C1'], ['C1E']],
  'Buss': [['D'], ['D', 'DE'], ['D1'], ['D1E']],
  'Varebil': [['B'], ['B', 'BE']],
  'Motorsykkel': [['A'], ['A1'], ['A2']]
};

function genererRegistreringsnummer(): string {
  const bokstaver = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const tall = '0123456789';
  
  let regnr = '';
  // 2 bokstaver
  regnr += bokstaver.charAt(Math.floor(Math.random() * bokstaver.length));
  regnr += bokstaver.charAt(Math.floor(Math.random() * bokstaver.length));
  regnr += ' ';
  // 5 tall
  for (let i = 0; i < 5; i++) {
    regnr += tall.charAt(Math.floor(Math.random() * tall.length));
  }
  
  return regnr;
}

function velgTilfeldig<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function opprettTestKjøretøy() {
  try {
    console.log('Henter bedrifter...');
    
    const bedrifter = await prisma.bedrift.findMany({
      select: { id: true, navn: true }
    });
    
    if (bedrifter.length === 0) {
      console.log('Ingen bedrifter funnet!');
      return;
    }
    
    console.log(`Fant ${bedrifter.length} bedrifter`);
    
    for (const bedrift of bedrifter) {
      console.log(`\nLager kjøretøy for ${bedrift.navn}...`);
      
      for (let i = 0; i < 10; i++) {
        const type = velgTilfeldig(kjøretøyTyper);
        const merke = velgTilfeldig(merker);
        const modell = velgTilfeldig(modeller[merke as keyof typeof modeller]);
        const årsmodell = Math.floor(Math.random() * (2024 - 2010 + 1)) + 2010;
        const status = velgTilfeldig(statusTyper);
        const førerkortklass = velgTilfeldig(førerkortKlasser[type as keyof typeof førerkortKlasser]);
        
        let registreringsnummer;
        let forsøk = 0;
        
        // Prøv å finne et unikt registreringsnummer
        do {
          registreringsnummer = genererRegistreringsnummer();
          forsøk++;
          
          const eksisterer = await prisma.kjoretoy.findUnique({
            where: { registreringsnummer }
          });
          
          if (!eksisterer) break;
          
        } while (forsøk < 10);
        
        if (forsøk >= 10) {
          console.log(`Kunne ikke generere unikt registreringsnummer etter 10 forsøk`);
          continue;
        }
        
        try {
          await prisma.kjoretoy.create({
            data: {
              registreringsnummer,
              merke,
              modell,
              aarsmodell: årsmodell,
              type,
              status,
              forerkortklass: førerkortklass,
              bedriftId: bedrift.id
            }
          });
          
          console.log(`  ✓ ${registreringsnummer} - ${merke} ${modell} (${årsmodell})`);
          
        } catch (error) {
          console.error(`  ✗ Feil ved oppretting av kjøretøy: ${error}`);
        }
      }
    }
    
    console.log('\n✅ Ferdig med å opprette test-kjøretøy!');
    
    // Vis statistikk
    const totaltKjøretøy = await prisma.kjoretoy.count();
    console.log(`📊 Totalt antall kjøretøy i databasen: ${totaltKjøretøy}`);
    
  } catch (error) {
    console.error('Feil ved oppretting av test-kjøretøy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

opprettTestKjøretøy(); 