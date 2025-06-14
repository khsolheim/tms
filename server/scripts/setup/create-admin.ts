import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function askPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    
    let password = '';
    process.stdin.on('data', (chunk) => {
      const char = chunk.toString('utf8');
      
      if (char === '\n' || char === '\r') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write('\n');
        resolve(password);
      } else if (char === '\u0003') {
        // Ctrl+C
        process.exit();
      } else if (char === '\u0008' || char === '\u007f') {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        password += char;
        process.stdout.write('*');
      }
    });
  });
}

async function createSuperAdmin() {
  try {
    console.log('🔧 Opprettelse av super admin bruker\n');

    // Sjekk om det allerede finnes en super admin
    const existingSuperAdmin = await prisma.ansatt.findFirst({
      where: { 
        rolle: 'ADMIN',
        bedriftId: null // Super admin er ikke tilknyttet en spesifikk bedrift
      }
    });

    if (existingSuperAdmin) {
      const overwrite = await askQuestion(`⚠️  Super admin eksisterer allerede (${existingSuperAdmin.epost}). Vil du opprette en ny? (j/n): `);
      if (overwrite.toLowerCase() !== 'j' && overwrite.toLowerCase() !== 'ja') {
        console.log('Avbrutt.');
        return;
      }
    }

    // Samle inn informasjon
    const navn = await askQuestion('👤 Fullt navn: ');
    const epost = await askQuestion('📧 E-post adresse: ');
    
    // Valider e-post
    if (!epost.includes('@')) {
      throw new Error('Ugyldig e-post adresse');
    }

    // Sjekk om e-post allerede er i bruk
    const existingUser = await prisma.ansatt.findUnique({
      where: { epost }
    });

    if (existingUser) {
      throw new Error(`E-post ${epost} er allerede i bruk`);
    }

    // Passord input
    const passord = await askPassword('🔒 Passord (minimum 8 tegn): ');
    const bekreftPassord = await askPassword('🔒 Bekreft passord: ');

    if (passord.length < 8) {
      throw new Error('Passord må være minst 8 tegn langt');
    }

    if (passord !== bekreftPassord) {
      throw new Error('Passordene stemmer ikke overens');
    }

    // Hash passord
    console.log('\n🔐 Hasher passord...');
    const passordHash = await bcrypt.hash(passord, 12); // Høyere sikkerhet for admin

    // Opprett super admin (ikke tilknyttet noen bedrift)
    const superAdmin = await prisma.ansatt.create({
      data: {
        navn,
        epost,
        passordHash,
        rolle: 'ADMIN',
        bedriftId: null, // Super admin er ikke tilknyttet en bedrift
        tilganger: ['ADMIN', 'HOVEDBRUKER', 'TRAFIKKLARER'] // Full tilgang
      }
    });

    console.log('\n✅ Super admin opprettet!');
    console.log(`👤 Navn: ${superAdmin.navn}`);
    console.log(`📧 E-post: ${superAdmin.epost}`);
    console.log(`🔑 Rolle: ${superAdmin.rolle}`);
    console.log(`🌐 Tilganger: ${superAdmin.tilganger.join(', ')}`);
    
    console.log('\n⚠️  VIKTIG: Lagre disse opplysningene på et sikkert sted!');

  } catch (error) {
    console.error('\n❌ Feil:', error instanceof Error ? error.message : error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

async function createCompanyAdmin() {
  try {
    console.log('🏢 Opprettelse av bedrifts admin bruker\n');

    // Hent tilgjengelige bedrifter
    const bedrifter = await prisma.bedrift.findMany({
      select: { id: true, navn: true, orgNummer: true }
    });

    if (bedrifter.length === 0) {
      throw new Error('Ingen bedrifter funnet. Opprett en bedrift først.');
    }

    console.log('Tilgjengelige bedrifter:');
    bedrifter.forEach((bedrift, index) => {
      console.log(`${index + 1}. ${bedrift.navn} (${bedrift.orgNummer})`);
    });

    const bedriftIndex = await askQuestion('\nVelg bedrift (nummer): ');
    const valgtBedrift = bedrifter[parseInt(bedriftIndex) - 1];

    if (!valgtBedrift) {
      throw new Error('Ugyldig bedrift valg');
    }

    // Samle inn brukerinformasjon
    const navn = await askQuestion('👤 Fullt navn: ');
    const epost = await askQuestion('📧 E-post adresse: ');
    
    if (!epost.includes('@')) {
      throw new Error('Ugyldig e-post adresse');
    }

    const existingUser = await prisma.ansatt.findUnique({
      where: { epost }
    });

    if (existingUser) {
      throw new Error(`E-post ${epost} er allerede i bruk`);
    }

    const passord = await askPassword('🔒 Passord (minimum 8 tegn): ');
    const bekreftPassord = await askPassword('🔒 Bekreft passord: ');

    if (passord.length < 8) {
      throw new Error('Passord må være minst 8 tegn langt');
    }

    if (passord !== bekreftPassord) {
      throw new Error('Passordene stemmer ikke overens');
    }

    const passordHash = await bcrypt.hash(passord, 12);

    // Opprett bedrifts admin
    const bedriftsAdmin = await prisma.ansatt.create({
      data: {
        navn,
        epost,
        passordHash,
        rolle: 'HOVEDBRUKER',
        bedriftId: valgtBedrift.id,
        tilganger: ['HOVEDBRUKER', 'TRAFIKKLARER']
      }
    });

    // Sett som hovedbruker for bedriften
    await prisma.bedrift.update({
      where: { id: valgtBedrift.id },
      data: { hovedbrukerId: bedriftsAdmin.id }
    });

    console.log('\n✅ Bedrifts admin opprettet!');
    console.log(`👤 Navn: ${bedriftsAdmin.navn}`);
    console.log(`📧 E-post: ${bedriftsAdmin.epost}`);
    console.log(`🏢 Bedrift: ${valgtBedrift.navn}`);
    console.log(`🔑 Rolle: ${bedriftsAdmin.rolle}`);

  } catch (error) {
    console.error('\n❌ Feil:', error instanceof Error ? error.message : error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Bruk:');
    console.log('  npm run create-admin super    # Opprett super admin (global tilgang)');
    console.log('  npm run create-admin company  # Opprett bedrifts admin');
    process.exit(1);
  }

  const type = args[0];

  switch (type) {
    case 'super':
      await createSuperAdmin();
      break;
    case 'company':
      await createCompanyAdmin();
      break;
    default:
      console.error('Ukjent type. Bruk "super" eller "company"');
      process.exit(1);
  }
}

main();