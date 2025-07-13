import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAnnonsorSponsor() {
  console.log('🌱 Seeding Annonsør/Sponsor system...');

  try {
    // Seed Geografiske enheter
    const norge = await prisma.geografiskEnhet.create({
      data: {
        type: 'LAND',
        navn: 'Norge',
        kode: 'NO'
      }
    });

    const oslo = await prisma.geografiskEnhet.create({
      data: {
        type: 'FYLKE',
        navn: 'Oslo',
        kode: '03',
        parentId: norge.id
      }
    });

    const bergen = await prisma.geografiskEnhet.create({
      data: {
        type: 'FYLKE',
        navn: 'Vestland',
        kode: '46',
        parentId: norge.id
      }
    });

    const osloKommune = await prisma.geografiskEnhet.create({
      data: {
        type: 'KOMMUNE',
        navn: 'Oslo kommune',
        kode: '0301',
        parentId: oslo.id
      }
    });

    const bergenKommune = await prisma.geografiskEnhet.create({
      data: {
        type: 'KOMMUNE',
        navn: 'Bergen kommune',
        kode: '4601',
        parentId: bergen.id
      }
    });

    // Finn eller opprett en bedrift for testing
    let testBedrift = await prisma.bedrift.findFirst({
      where: { navn: 'Test Trafikkskole' }
    });

    if (!testBedrift) {
      testBedrift = await prisma.bedrift.create({
        data: {
          navn: 'Test Trafikkskole',
          organisasjonsnummer: '123456789',
          adresse: 'Testveien 1',
          postnummer: '0001',
          poststed: 'Oslo',
          telefon: '12345678',
          epost: 'post@testtrafikkskole.no'
        }
      });
    }

    // Seed Annonsør/Sponsor
    const mcDonalds = await prisma.annonsorSponsor.create({
      data: {
        bedriftId: testBedrift.id,
        navn: 'McDonald\'s Norge',
        type: 'SPONSOR',
        kontaktperson: 'Markedsansvarlig',
        telefon: '22334455',
        epost: 'marked@mcdonalds.no',
        nettside: 'https://mcdonalds.no',
        startDato: new Date('2024-01-01'),
        status: 'APPROVED',
        budsjett: 50000,
        kostnadPerVisning: 2.5,
        kostnadPerKlikk: 15.0
      }
    });

    const circle = await prisma.annonsorSponsor.create({
      data: {
        bedriftId: testBedrift.id,
        navn: 'Circle K',
        type: 'ANNONSOR',
        kontaktperson: 'Kampanjeansvarlig',
        telefon: '33445566',
        epost: 'kampanje@circlek.no',
        nettside: 'https://circlek.no',
        startDato: new Date('2024-01-01'),
        status: 'APPROVED',
        budsjett: 30000,
        kostnadPerVisning: 1.5,
        kostnadPerKlikk: 8.0
      }
    });

    const rema = await prisma.annonsorSponsor.create({
      data: {
        bedriftId: testBedrift.id,
        navn: 'REMA 1000',
        type: 'SPONSOR',
        kontaktperson: 'Ungdomsansvarlig',
        telefon: '44556677',
        epost: 'ungdom@rema.no',
        nettside: 'https://rema.no',
        startDato: new Date('2024-01-01'),
        status: 'APPROVED',
        budsjett: 25000,
        kostnadPerVisning: 1.0,
        kostnadPerKlikk: 5.0
      }
    });

    // Seed Annonser
    const mcDonaldsAnnonse = await prisma.annonse.create({
      data: {
        annonsorId: mcDonalds.id,
        tittel: '20% rabatt for trafikkelever!',
        innledning: 'Vis ditt elevbevis og få 20% rabatt på alle måltider hos McDonald\'s',
        fullInnhold: '<h3>Eksklusiv rabatt for trafikkelever</h3><p>Som trafikkelev får du hele 20% rabatt på alle våre deilige måltider. Bare vis frem elevbeviset ditt når du bestiller.</p><p><strong>Gyldig til:</strong> 31. desember 2024</p><p><strong>Gjelder:</strong> Alle McDonald\'s restauranter i Norge</p>',
        bildeUrl: 'https://via.placeholder.com/400x300?text=McDonald%27s+Rabatt',
        ctaText: 'Finn nærmeste restaurant',
        ctaUrl: 'https://mcdonalds.no/finn-restaurant',
        ctaTelefon: '22334455',
        ctaEpost: 'marked@mcdonalds.no',
        ctaVeibeskrivelse: 'Sentrum, Oslo',
        prioritet: 5,
        maxVisninger: 10000,
        maxKlikk: 500,
        startDato: new Date('2024-01-01'),
        sluttDato: new Date('2024-12-31')
      }
    });

    const circleAnnonse = await prisma.annonse.create({
      data: {
        annonsorId: circle.id,
        tittel: 'Gratis kaffe til trafikkelever',
        innledning: 'Hver fredag får trafikkelever gratis kaffe hos Circle K',
        fullInnhold: '<h3>Fredags-kaffe for trafikkelever</h3><p>Hver fredag kan du hente gratis kaffe hos Circle K. Bare vis elevbeviset ditt så får du en gratis kaffe fra vårt utvalg.</p><p><strong>Gyldig:</strong> Alle fredager</p><p><strong>Tidspunkt:</strong> 07:00 - 16:00</p>',
        bildeUrl: 'https://via.placeholder.com/400x300?text=Circle+K+Kaffe',
        ctaText: 'Finn Circle K',
        ctaUrl: 'https://circlek.no/finn-stasjon',
        ctaTelefon: '33445566',
        prioritet: 3,
        maxVisninger: 5000,
        maxKlikk: 250,
        startDato: new Date('2024-01-01'),
        sluttDato: new Date('2024-12-31')
      }
    });

    const remaAnnonse = await prisma.annonse.create({
      data: {
        annonsorId: rema.id,
        tittel: '10% studentrabatt hele året',
        innledning: 'REMA 1000 gir trafikkelever 10% rabatt på alle varer',
        fullInnhold: '<h3>Studentrabatt hos REMA 1000</h3><p>Som trafikkelev får du 10% rabatt på alle våre varer hele året. Registrer deg i REMA-appen og få rabatt på alle dine innkjøp.</p><p><strong>Slik gjør du:</strong></p><ol><li>Last ned REMA-appen</li><li>Registrer deg med elevbevis</li><li>Få automatisk rabatt ved kassen</li></ol>',
        bildeUrl: 'https://via.placeholder.com/400x300?text=REMA+1000+Rabatt',
        ctaText: 'Last ned app',
        ctaUrl: 'https://rema.no/app',
        ctaEpost: 'ungdom@rema.no',
        prioritet: 4,
        maxVisninger: 8000,
        maxKlikk: 400,
        startDato: new Date('2024-01-01'),
        sluttDato: new Date('2024-12-31')
      }
    });

    // Seed Annonse targeting
    await prisma.annonseTargeting.create({
      data: {
        annonseId: mcDonaldsAnnonse.id,
        geografiskId: norge.id // Hele Norge
      }
    });

    await prisma.annonseTargeting.create({
      data: {
        annonseId: circleAnnonse.id,
        geografiskId: oslo.id // Kun Oslo
      }
    });

    await prisma.annonseTargeting.create({
      data: {
        annonseId: remaAnnonse.id,
        geografiskId: osloKommune.id // Kun Oslo kommune
      }
    });

    // Seed noe statistikk
    const iDag = new Date();
    const iGar = new Date();
    iGar.setDate(iDag.getDate() - 1);

    await prisma.annonseStatistikk.createMany({
      data: [
        {
          annonseId: mcDonaldsAnnonse.id,
          dato: iGar,
          antallVisninger: 156,
          antallKlikk: 23,
          antallTelefonKlikk: 3,
          antallEpostKlikk: 2,
          antallVeiKlikk: 8
        },
        {
          annonseId: mcDonaldsAnnonse.id,
          dato: iDag,
          antallVisninger: 234,
          antallKlikk: 45,
          antallTelefonKlikk: 7,
          antallEpostKlikk: 5,
          antallVeiKlikk: 12
        },
        {
          annonseId: circleAnnonse.id,
          dato: iGar,
          antallVisninger: 89,
          antallKlikk: 12,
          antallTelefonKlikk: 1,
          antallEpostKlikk: 0,
          antallVeiKlikk: 3
        },
        {
          annonseId: circleAnnonse.id,
          dato: iDag,
          antallVisninger: 112,
          antallKlikk: 18,
          antallTelefonKlikk: 2,
          antallEpostKlikk: 1,
          antallVeiKlikk: 4
        },
        {
          annonseId: remaAnnonse.id,
          dato: iGar,
          antallVisninger: 67,
          antallKlikk: 8,
          antallTelefonKlikk: 0,
          antallEpostKlikk: 3,
          antallVeiKlikk: 1
        },
        {
          annonseId: remaAnnonse.id,
          dato: iDag,
          antallVisninger: 91,
          antallKlikk: 14,
          antallTelefonKlikk: 1,
          antallEpostKlikk: 5,
          antallVeiKlikk: 2
        }
      ]
    });

    console.log('✅ Annonsør/Sponsor system seeded successfully!');
    console.log(`📊 Created:
    - 5 geografiske enheter
    - 3 annonsører/sponsorer
    - 3 annonser
    - 3 targeting rules
    - 6 statistikk entries`);

  } catch (error) {
    console.error('❌ Error seeding annonsør/sponsor system:', error);
    throw error;
  }
}