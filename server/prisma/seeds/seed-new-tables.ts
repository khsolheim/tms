import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedNewTables() {
  console.log('🌱 Seeding nye tabeller...');

  try {
    // Seed Nyheter
    await prisma.nyhet.createMany({
      data: [
        {
          tittel: 'Velkommen til TMS 2024!',
          innhold: 'Vi ønsker alle en fantastisk start på det nye året. TMS har fått mange nye funksjoner som gjør hverdagen enklere for både instruktører og elever.',
          sammendrag: 'Velkommen til TMS 2024 med nye funksjoner',
          forfatter: 'TMS Administrator',
          kategori: 'VELKOMMEN',
          tags: ['velkommen', '2024', 'nye-funksjoner'],
          prioritet: 5,
          publisert: true,
          publiseringsdato: new Date('2024-01-01'),
          visning: 'ALLE'
        },
        {
          tittel: 'Nye kursdatoer tilgjengelig',
          innhold: 'Vi har åpnet for påmelding til våre vårkurs. Se oversikt over ledige plasser og meld deg på i dag!',
          sammendrag: 'Påmelding til vårkurs er åpnet',
          forfatter: 'Kursadministrator',
          kategori: 'KURS',
          tags: ['kurs', 'påmelding', 'vår'],
          prioritet: 3,
          publisert: true,
          publiseringsdato: new Date('2024-02-01'),
          visning: 'ALLE'
        },
        {
          tittel: 'Viktig: Endringer i teoriprøven',
          innhold: 'Fra 1. mars 2024 innføres nye regler for teoriprøven. Les mer om endringene og hvordan de påvirker deg som elev.',
          sammendrag: 'Nye regler for teoriprøven fra mars 2024',
          forfatter: 'Fagansvarlig',
          kategori: 'VIKTIG',
          tags: ['teoriprøve', 'regelendring', 'viktig'],
          prioritet: 5,
          publisert: true,
          publiseringsdato: new Date('2024-02-20'),
          visning: 'ALLE'
        }
      ]
    });

    // Seed Hjelpkategorier
    await prisma.hjelpKategori.createMany({
      data: [
        { navn: 'Kom i gang', beskrivelse: 'Grunnleggende hjelp for nye brukere', ikon: 'play-circle', rekkefølge: 1 },
        { navn: 'Elevhåndtering', beskrivelse: 'Hvordan administrere elever', ikon: 'users', rekkefølge: 2 },
        { navn: 'Kalender', beskrivelse: 'Bruk av kalenderfunksjoner', ikon: 'calendar', rekkefølge: 3 },
        { navn: 'Økonomi', beskrivelse: 'Økonomistyring og rapporter', ikon: 'dollar-sign', rekkefølge: 4 },
        { navn: 'Teknisk støtte', beskrivelse: 'Tekniske problemer og løsninger', ikon: 'settings', rekkefølge: 5 }
      ]
    });

    // Seed Hjelpartikler
    await prisma.hjelpArtikkel.createMany({
      data: [
        {
          tittel: 'Hvordan logge inn første gang',
          innhold: 'For å logge inn første gang, bruk e-postadressen din og det midlertidige passordet du fikk tilsendt. Du vil bli bedt om å endre passordet ved første innlogging.',
          kategori: 'Kom i gang',
          tags: ['innlogging', 'passord', 'første-gang'],
          publisert: true,
          søkeord: ['login', 'passord', 'første', 'innlogging'],
          opprettetAv: 1
        },
        {
          tittel: 'Registrere nye elever',
          innhold: 'For å registrere en ny elev, gå til Elever-siden og klikk "Ny elev". Fyll ut all nødvendig informasjon og trykk lagre.',
          kategori: 'Elevhåndtering',
          tags: ['elever', 'registrering', 'ny-elev'],
          publisert: true,
          søkeord: ['elev', 'registrer', 'ny', 'opprett'],
          opprettetAv: 1
        },
        {
          tittel: 'Opprette kjøretimer i kalenderen',
          innhold: 'For å booke en kjøretime, gå til Kalender-siden, klikk på ønsket dato og tid, velg "Kjøretime" som type og fyll ut detaljer.',
          kategori: 'Kalender',
          tags: ['kalender', 'kjøretime', 'booking'],
          publisert: true,
          søkeord: ['kalender', 'time', 'kjøre', 'booking'],
          opprettetAv: 1
        }
      ]
    });

    // Seed Kalender Events
    await prisma.kalenderEvent.createMany({
      data: [
        {
          tittel: 'Kjøretime - Grunnkurs',
          beskrivelse: 'Grunnleggende kjøreteknikk og trafikkregler',
          startDato: new Date('2024-01-15T09:00:00'),
          sluttDato: new Date('2024-01-15T10:30:00'),
          heldag: false,
          lokasjon: 'Oslo Kjøreskole',
          type: 'UNDERVISNING',
          status: 'BEKREFTET',
          deltakere: ['elev1'],
          fargeKode: '#10B981',
          bedriftId: 1,
          instruktorId: 1,
          elevId: 1,
          kjoretoyId: 1
        },
        {
          tittel: 'Teoriundervisning - Trafikkregler',
          beskrivelse: 'Gjennomgang av viktige trafikkregler',
          startDato: new Date('2024-01-16T13:00:00'),
          sluttDato: new Date('2024-01-16T15:00:00'),
          heldag: false,
          lokasjon: 'Undervisningsrom 1',
          type: 'TEORI',
          status: 'PLANLAGT',
          deltakere: ['elev1', 'elev2', 'elev3'],
          fargeKode: '#3B82F6',
          bedriftId: 1,
          instruktorId: 2
        },
        {
          tittel: 'Eksamen - Praktisk prøve',
          beskrivelse: 'Praktisk kjøreprøve for førerkort klasse B',
          startDato: new Date('2024-01-20T10:00:00'),
          sluttDato: new Date('2024-01-20T11:00:00'),
          heldag: false,
          lokasjon: 'Prøvested Majorstuen',
          type: 'EKSAMEN',
          status: 'BEKREFTET',
          deltakere: ['elev2'],
          fargeKode: '#EF4444',
          bedriftId: 1,
          elevId: 2
        }
      ]
    });

    // Seed Oppgaver
    await prisma.oppgave.createMany({
      data: [
        {
          tittel: 'Oppdater elevliste for januar',
          beskrivelse: 'Gjennomgå og oppdater alle aktive elever for januar måned. Sjekk status på alle kontrakter og send påminnelser til elever som mangler dokumentasjon.',
          status: 'I_PROGRESJON',
          prioritet: 'HOY',
          forfallsdato: new Date('2024-01-20'),
          startdato: new Date('2024-01-15'),
          estimertTid: 120,
          faktiskTid: 45,
          tildeltTil: 1,
          opprettetAv: 2,
          kategori: 'ADMINISTRASJON',
          tags: ['elever', 'kontrakter', 'januar'],
          vedlegg: ['elevliste_2024.xlsx'],
          kommentarer: [
            { forfatter: 'Ola Hansen', tekst: 'Starter med dette i dag', tidspunkt: new Date('2024-01-15T09:00:00') }
          ],
          relatertTabell: 'Elev',
          bedriftId: 1
        },
        {
          tittel: 'Planlegg sikkerhetskurs for mars',
          beskrivelse: 'Organisere og planlegge sikkerhetskurs for alle nye elever som starter i mars. Inkluderer lokalbooking og materiell.',
          status: 'IKKE_PAABEGYNT',
          prioritet: 'MEDIUM',
          forfallsdato: new Date('2024-02-15'),
          estimertTid: 240,
          opprettetAv: 3,
          kategori: 'UNDERVISNING',
          tags: ['sikkerhet', 'kurs', 'mars', 'nye-elever'],
          vedlegg: [],
          kommentarer: [],
          bedriftId: 1
        },
        {
          tittel: 'Vedlikehold av kjøretøy AB12345',
          beskrivelse: 'Rutinemessig vedlikehold og EU-kontroll av Toyota Corolla. Bestill time hos autorisert verksted.',
          status: 'FERDIG',
          prioritet: 'KRITISK',
          forfallsdato: new Date('2024-01-18'),
          startdato: new Date('2024-01-17'),
          ferdigstiltDato: new Date('2024-01-18'),
          estimertTid: 180,
          faktiskTid: 165,
          tildeltTil: 4,
          opprettetAv: 1,
          kategori: 'VEDLIKEHOLD',
          tags: ['kjøretøy', 'eu-kontroll', 'vedlikehold'],
          vedlegg: ['eu_kontroll_rapport.pdf'],
          kommentarer: [
            { forfatter: 'Lisa Berg', tekst: 'EU-kontroll godkjent', tidspunkt: new Date('2024-01-18T15:30:00') }
          ],
          relatertTabell: 'Kjoretoy',
          relatertId: 1,
          bedriftId: 1
        }
      ]
    });

    // Seed Prosjekter
    await prisma.prosjekt.createMany({
      data: [
        {
          navn: 'Digitalisering av elevhåndbok',
          beskrivelse: 'Overgang fra papirbasert til digital elevhåndbok med interaktive elementer og videoer',
          status: 'AKTIV',
          startdato: new Date('2024-01-01'),
          sluttdato: new Date('2024-06-30'),
          budget: 250000,
          forbruktBudget: 125000,
          prosjektleder: 1,
          teammedlemmer: [1, 2, 3],
          kategori: 'DIGITALISERING',
          prioritet: 'HOY',
          progresjon: 65,
          milepaler: [
            { navn: 'Kravanalyse', dato: '2024-02-01', ferdig: true },
            { navn: 'Design', dato: '2024-03-15', ferdig: true },
            { navn: 'Utvikling', dato: '2024-05-01', ferdig: false },
            { navn: 'Testing', dato: '2024-06-01', ferdig: false },
            { navn: 'Lansering', dato: '2024-06-30', ferdig: false }
          ],
          risikofaktorer: [
            { navn: 'Budsjettoverskridelse', sannsynlighet: 'LAV', konsekvens: 'MEDIUM' },
            { navn: 'Forsinkelse', sannsynlighet: 'MEDIUM', konsekvens: 'HOY' },
            { navn: 'Tekniske utfordringer', sannsynlighet: 'MEDIUM', konsekvens: 'MEDIUM' }
          ],
          bedriftId: 1
        },
        {
          navn: 'Ny kjøretøyflåte 2024',
          beskrivelse: 'Fornyelse av kjøretøyflåten med miljøvennlige elbiler og hybridbiler',
          status: 'PLANLEGGING',
          startdato: new Date('2024-03-01'),
          sluttdato: new Date('2024-12-31'),
          budget: 1500000,
          forbruktBudget: 0,
          prosjektleder: 2,
          teammedlemmer: [2, 4],
          kategori: 'ANSKAFFELSE',
          prioritet: 'KRITISK',
          progresjon: 15,
          milepaler: [
            { navn: 'Behovsanalyse', dato: '2024-03-15', ferdig: false },
            { navn: 'Innhenting av tilbud', dato: '2024-04-30', ferdig: false },
            { navn: 'Evaluering', dato: '2024-06-01', ferdig: false },
            { navn: 'Bestilling', dato: '2024-07-01', ferdig: false },
            { navn: 'Levering', dato: '2024-12-31', ferdig: false }
          ],
          risikofaktorer: [
            { navn: 'Leveringstid', sannsynlighet: 'HOY', konsekvens: 'HOY' },
            { navn: 'Prisøkning', sannsynlighet: 'MEDIUM', konsekvens: 'HOY' }
          ],
          bedriftId: 1
        }
      ]
    });

    // Seed Ressurser
    await prisma.ressurs.createMany({
      data: [
        {
          navn: 'Undervisningsrom 1',
          type: 'LOKALE',
          beskrivelse: 'Stort undervisningsrom med projektor og whiteboard',
          kapasitet: 25,
          ledigTid: {
            mandag: ['09:00-17:00'],
            tirsdag: ['09:00-17:00'],
            onsdag: ['09:00-17:00'],
            torsdag: ['09:00-17:00'],
            fredag: ['09:00-15:00']
          },
          status: 'TILGJENGELIG',
          kostnad: 500,
          lokasjon: 'Bygning A, 1. etasje',
          ansvarlig: 1,
          bedriftId: 1
        },
        {
          navn: 'Simulator 1',
          type: 'UTSTYR',
          beskrivelse: 'Avansert kjøresimulator for teoriundervisning',
          kapasitet: 1,
          ledigTid: {
            mandag: ['08:00-18:00'],
            tirsdag: ['08:00-18:00'],
            onsdag: ['08:00-18:00'],
            torsdag: ['08:00-18:00'],
            fredag: ['08:00-16:00']
          },
          status: 'TILGJENGELIG',
          kostnad: 200,
          lokasjon: 'Simulatorrom',
          ansvarlig: 2,
          bedriftId: 1
        },
        {
          navn: 'Øvingsplass Grorud',
          type: 'LOKALE',
          beskrivelse: 'Lukket øvingsplass for begynnere',
          kapasitet: 10,
          ledigTid: {
            mandag: ['07:00-20:00'],
            tirsdag: ['07:00-20:00'],
            onsdag: ['07:00-20:00'],
            torsdag: ['07:00-20:00'],
            fredag: ['07:00-20:00'],
            lørdag: ['09:00-16:00']
          },
          status: 'TILGJENGELIG',
          kostnad: 0,
          lokasjon: 'Grorud industriområde',
          ansvarlig: 3,
          bedriftId: 1
        }
      ]
    });

    // Seed Ressursbookinger
    await prisma.ressursBooking.createMany({
      data: [
        {
          ressursId: 1,
          startTid: new Date('2024-01-16T13:00:00'),
          sluttTid: new Date('2024-01-16T15:00:00'),
          formaal: 'Teoriundervisning',
          beskrivelse: 'Gjennomgang av trafikkregler for klasse B',
          booketAv: 2,
          godkjentAv: 1,
          status: 'GODKJENT',
          antallPersoner: 15,
          bedriftId: 1
        },
        {
          ressursId: 2,
          startTid: new Date('2024-01-17T10:00:00'),
          sluttTid: new Date('2024-01-17T11:00:00'),
          formaal: 'Simulatortrening',
          beskrivelse: 'Introduksjon til simulator for nye elever',
          booketAv: 3,
          status: 'PENDING',
          antallPersoner: 1,
          bedriftId: 1
        },
        {
          ressursId: 3,
          startTid: new Date('2024-01-18T09:00:00'),
          sluttTid: new Date('2024-01-18T12:00:00'),
          formaal: 'Praktisk øving',
          beskrivelse: 'Grunnleggende kjøretrening for begynnere',
          booketAv: 1,
          godkjentAv: 1,
          status: 'GODKJENT',
          antallPersoner: 8,
          bedriftId: 1
        }
      ]
    });

    // Seed Økonomiposter
    await prisma.økonomipost.createMany({
      data: [
        {
          beskrivelse: 'Månedlig lønn instruktører',
          belop: 45000000, // 450,000 kr i øre
          type: 'UTGIFT',
          kategori: 'LØNN',
          dato: new Date('2024-01-01'),
          referanse: 'LØN-2024-01',
          konto: '5100',
          mva: 0,
          status: 'BETALT',
          bedriftId: 1,
          registrertAv: 1
        },
        {
          beskrivelse: 'Kursavgift - Grunnkurs B-klasse',
          belop: 1800000, // 18,000 kr i øre
          type: 'INNTEKT',
          kategori: 'KURSAVGIFT',
          dato: new Date('2024-01-15'),
          referanse: 'KURS-2024-001',
          mottaker: 'Per Hansen',
          konto: '3100',
          mva: 450000, // 4,500 kr i øre (25% mva)
          status: 'REGISTRERT',
          relatertTabell: 'Kontrakt',
          relatertId: 1,
          bedriftId: 1,
          registrertAv: 2
        },
        {
          beskrivelse: 'Drivstoff kjøretøy',
          belop: 350000, // 3,500 kr i øre
          type: 'UTGIFT',
          kategori: 'DRIFT',
          dato: new Date('2024-01-10'),
          referanse: 'DRIV-2024-001',
          mottaker: 'Circle K',
          konto: '6300',
          mva: 87500, // 875 kr i øre (25% mva)
          status: 'BETALT',
          bedriftId: 1,
          registrertAv: 1
        },
        {
          beskrivelse: 'Vedlikehold kjøretøy AB12345',
          belop: 850000, // 8,500 kr i øre
          type: 'UTGIFT',
          kategori: 'VEDLIKEHOLD',
          dato: new Date('2024-01-18'),
          referanse: 'VEDL-2024-001',
          mottaker: 'Bilservice AS',
          konto: '6340',
          mva: 212500, // 2,125 kr i øre (25% mva)
          status: 'BETALT',
          relatertTabell: 'Kjoretoy',
          relatertId: 1,
          bedriftId: 1,
          registrertAv: 3
        },
        {
          beskrivelse: 'Markedsføring - Google Ads',
          belop: 1200000, // 12,000 kr i øre
          type: 'UTGIFT',
          kategori: 'MARKEDSFØRING',
          dato: new Date('2024-01-05'),
          referanse: 'MARK-2024-001',
          mottaker: 'Google Ireland',
          konto: '6100',
          mva: 300000, // 3,000 kr i øre (25% mva)
          status: 'BETALT',
          bedriftId: 1,
          registrertAv: 2
        }
      ]
    });

    console.log('✅ Seed data for nye tabeller opprettet!');

  } catch (error) {
    console.error('❌ Feil under seeding av nye tabeller:', error);
    throw error;
  }
}

// Kjør seed-funksjon hvis filen kjøres direkte
if (require.main === module) {
  seedNewTables()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}