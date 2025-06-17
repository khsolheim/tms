import { PrismaClient, ServiceType, ServiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedServices() {
  console.log('🔧 Seeding services...');

  const services = [
    {
      navn: 'HR System',
      type: ServiceType.HR,
      beskrivelse: 'Personaladministrasjon og ansattehåndtering',
      status: ServiceStatus.ACTIVE,
      versjon: '1.0.0'
    },
    {
      navn: 'Økonomimodul',
      type: ServiceType.ECONOMY,
      beskrivelse: 'Økonomistyring og regnskapsføring',
      status: ServiceStatus.ACTIVE,
      versjon: '1.0.0'
    },
    {
      navn: 'Quiz System',
      type: ServiceType.QUIZ,
      beskrivelse: 'Quiz og kunnskapstesting for elever',
      status: ServiceStatus.ACTIVE,
      versjon: '1.2.0'
    },
    {
      navn: 'Sikkerhetskontroll',
      type: ServiceType.SIKKERHETSKONTROLL,
      beskrivelse: 'Sikkerhetskontroller og kjøretøyinspeksjon',
      status: ServiceStatus.ACTIVE,
      versjon: '2.0.0'
    },
    {
      navn: 'Førerkort System',
      type: ServiceType.FORERKORT,
      beskrivelse: 'Førerkortadministrasjon og oppfølging',
      status: ServiceStatus.MAINTENANCE,
      versjon: '0.9.0'
    },
    {
      navn: 'Kursadministrasjon',
      type: ServiceType.KURS,
      beskrivelse: 'Kursplanlegging og elevoppfølging',
      status: ServiceStatus.ACTIVE,
      versjon: '1.1.0'
    },
    {
      navn: 'Rapportering',
      type: ServiceType.RAPPORTER,
      beskrivelse: 'Rapporter og statistikk',
      status: ServiceStatus.ACTIVE,
      versjon: '1.0.0'
    },
    {
      navn: 'Eksterne Integrasjoner',
      type: ServiceType.INTEGRASJONER,
      beskrivelse: 'Integrasjoner med eksterne systemer',
      status: ServiceStatus.ACTIVE,
      versjon: '1.0.0'
    }
  ];

  for (const serviceData of services) {
    try {
      const existingService = await prisma.service.findFirst({
        where: { navn: serviceData.navn }
      });

      if (!existingService) {
        await prisma.service.create({
          data: serviceData
        });
        console.log(`✅ Opprettet service: ${serviceData.navn}`);
      } else {
        console.log(`⏭️  Service eksisterer allerede: ${serviceData.navn}`);
      }
    } catch (error) {
      console.error(`❌ Feil ved opprettelse av service ${serviceData.navn}:`, error);
    }
  }

  console.log('✅ Services seeding fullført');
}

// Kjør seeding hvis filen kjøres direkte
if (require.main === module) {
  seedServices()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 