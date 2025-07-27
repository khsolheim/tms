const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPageAccess() {
  console.log('🌱 Seeding page access and subscription data...');

  try {
    // Opprett standard sider
    const pages = [
      {
        pageKey: 'dashboard',
        pageName: 'Dashboard',
        description: 'Hovedoversikt og nøkkeltall',
        category: 'core',
        icon: 'home',
        requiresSubscription: false
      },
      {
        pageKey: 'quiz',
        pageName: 'Quiz',
        description: 'Quiz-system og læring',
        category: 'core',
        icon: 'book-open',
        requiresSubscription: false
      },
      {
        pageKey: 'sikkerhetskontroll',
        pageName: 'Sikkerhetskontroll',
        description: 'Sikkerhetskontroll og inspeksjoner',
        category: 'core',
        icon: 'shield-check',
        requiresSubscription: false
      },
      {
        pageKey: 'bedrifter',
        pageName: 'Bedrifter',
        description: 'Bedriftsadministrasjon',
        category: 'core',
        icon: 'building',
        requiresSubscription: false
      },
      {
        pageKey: 'elever',
        pageName: 'Elever',
        description: 'Elevadministrasjon',
        category: 'core',
        icon: 'users',
        requiresSubscription: false
      },
      {
        pageKey: 'kontrakter',
        pageName: 'Kontrakter',
        description: 'Kontraktsadministrasjon',
        category: 'core',
        icon: 'file-text',
        requiresSubscription: false
      },
      {
        pageKey: 'kalender',
        pageName: 'Kalender',
        description: 'Kalender og planlegging',
        category: 'premium',
        icon: 'calendar',
        requiresSubscription: true,
        subscriptionTier: 'premium'
      },
      {
        pageKey: 'nyheter',
        pageName: 'Nyheter',
        description: 'Nyheter og kunngjøringer',
        category: 'premium',
        icon: 'newspaper',
        requiresSubscription: true,
        subscriptionTier: 'premium'
      },
      {
        pageKey: 'oppgaver',
        pageName: 'Oppgaver',
        description: 'Oppgaveadministrasjon',
        category: 'premium',
        icon: 'check-square',
        requiresSubscription: true,
        subscriptionTier: 'premium'
      },
      {
        pageKey: 'rapportering',
        pageName: 'Rapportering',
        description: 'Rapporter og analyser',
        category: 'enterprise',
        icon: 'bar-chart-3',
        requiresSubscription: true,
        subscriptionTier: 'enterprise'
      },
      {
        pageKey: 'okonomi',
        pageName: 'Økonomi',
        description: 'Økonomiadministrasjon',
        category: 'enterprise',
        icon: 'dollar-sign',
        requiresSubscription: true,
        subscriptionTier: 'enterprise'
      },
      {
        pageKey: 'hr',
        pageName: 'HR',
        description: 'HR-administrasjon',
        category: 'enterprise',
        icon: 'user-check',
        requiresSubscription: true,
        subscriptionTier: 'enterprise'
      },
      {
        pageKey: 'prosjekt',
        pageName: 'Prosjekt',
        description: 'Prosjektadministrasjon',
        category: 'enterprise',
        icon: 'folder',
        requiresSubscription: true,
        subscriptionTier: 'enterprise'
      },
      {
        pageKey: 'ressursplanlegging',
        pageName: 'Ressursplanlegging',
        description: 'Ressursadministrasjon',
        category: 'enterprise',
        icon: 'cpu',
        requiresSubscription: true,
        subscriptionTier: 'enterprise'
      }
    ];

    // Opprett sider
    for (const page of pages) {
      await prisma.pageDefinition.upsert({
        where: { pageKey: page.pageKey },
        update: page,
        create: page
      });
    }

    console.log('✅ Sider opprettet');

    // Opprett abonnementsplaner
    const plans = [
      {
        name: 'Basic',
        description: 'Grunnleggende funksjoner for små bedrifter',
        priceMonthly: 299,
        priceYearly: 2990,
        features: JSON.stringify([
          'Dashboard',
          'Quiz-system',
          'Sikkerhetskontroll',
          'Bedriftsadministrasjon',
          'Elevadministrasjon',
          'Kontraktsadministrasjon',
          'Opptil 10 brukere',
          'E-post støtte'
        ]),
        maxUsers: 10,
        maxBedrifter: 1
      },
      {
        name: 'Premium',
        description: 'Avanserte funksjoner for voksende bedrifter',
        priceMonthly: 599,
        priceYearly: 5990,
        features: JSON.stringify([
          'Alle Basic-funksjoner',
          'Kalender og planlegging',
          'Nyheter og kunngjøringer',
          'Oppgaveadministrasjon',
          'Opptil 50 brukere',
          'Prioritert støtte',
          'Avanserte rapporter'
        ]),
        maxUsers: 50,
        maxBedrifter: 1
      },
      {
        name: 'Enterprise',
        description: 'Komplett løsning for store organisasjoner',
        priceMonthly: 1299,
        priceYearly: 12990,
        features: JSON.stringify([
          'Alle Premium-funksjoner',
          'Rapportering og analyser',
          'Økonomiadministrasjon',
          'HR-administrasjon',
          'Prosjektadministrasjon',
          'Ressursplanlegging',
          'Ubegrenset antall brukere',
          'Dedikert støtte',
          'API-tilgang',
          'Tilpassede integrasjoner'
        ]),
        maxUsers: null, // Ubegrenset
        maxBedrifter: 1
      }
    ];

    // Opprett abonnementsplaner
    for (const plan of plans) {
      const createdPlan = await prisma.subscriptionPlan.upsert({
        where: { name: plan.name },
        update: plan,
        create: plan
      });

      // Legg til funksjoner for hver plan
      const planFeatures = {
        'Basic': [
          { key: 'dashboard', name: 'Dashboard', description: 'Hovedoversikt og nøkkeltall', isIncluded: true },
          { key: 'quiz', name: 'Quiz-system', description: 'Quiz og læring', isIncluded: true },
          { key: 'sikkerhetskontroll', name: 'Sikkerhetskontroll', description: 'Sikkerhetskontroll og inspeksjoner', isIncluded: true },
          { key: 'bedrifter', name: 'Bedrifter', description: 'Bedriftsadministrasjon', isIncluded: true },
          { key: 'elever', name: 'Elever', description: 'Elevadministrasjon', isIncluded: true },
          { key: 'kontrakter', name: 'Kontrakter', description: 'Kontraktsadministrasjon', isIncluded: true },
          { key: 'kalender', name: 'Kalender', description: 'Kalender og planlegging', isIncluded: false },
          { key: 'nyheter', name: 'Nyheter', description: 'Nyheter og kunngjøringer', isIncluded: false },
          { key: 'oppgaver', name: 'Oppgaver', description: 'Oppgaveadministrasjon', isIncluded: false },
          { key: 'rapportering', name: 'Rapportering', description: 'Rapporter og analyser', isIncluded: false },
          { key: 'okonomi', name: 'Økonomi', description: 'Økonomiadministrasjon', isIncluded: false },
          { key: 'hr', name: 'HR', description: 'HR-administrasjon', isIncluded: false },
          { key: 'prosjekt', name: 'Prosjekt', description: 'Prosjektadministrasjon', isIncluded: false },
          { key: 'ressursplanlegging', name: 'Ressursplanlegging', description: 'Ressursadministrasjon', isIncluded: false }
        ],
        'Premium': [
          { key: 'dashboard', name: 'Dashboard', description: 'Hovedoversikt og nøkkeltall', isIncluded: true },
          { key: 'quiz', name: 'Quiz-system', description: 'Quiz og læring', isIncluded: true },
          { key: 'sikkerhetskontroll', name: 'Sikkerhetskontroll', description: 'Sikkerhetskontroll og inspeksjoner', isIncluded: true },
          { key: 'bedrifter', name: 'Bedrifter', description: 'Bedriftsadministrasjon', isIncluded: true },
          { key: 'elever', name: 'Elever', description: 'Elevadministrasjon', isIncluded: true },
          { key: 'kontrakter', name: 'Kontrakter', description: 'Kontraktsadministrasjon', isIncluded: true },
          { key: 'kalender', name: 'Kalender', description: 'Kalender og planlegging', isIncluded: true },
          { key: 'nyheter', name: 'Nyheter', description: 'Nyheter og kunngjøringer', isIncluded: true },
          { key: 'oppgaver', name: 'Oppgaver', description: 'Oppgaveadministrasjon', isIncluded: true },
          { key: 'rapportering', name: 'Rapportering', description: 'Rapporter og analyser', isIncluded: false },
          { key: 'okonomi', name: 'Økonomi', description: 'Økonomiadministrasjon', isIncluded: false },
          { key: 'hr', name: 'HR', description: 'HR-administrasjon', isIncluded: false },
          { key: 'prosjekt', name: 'Prosjekt', description: 'Prosjektadministrasjon', isIncluded: false },
          { key: 'ressursplanlegging', name: 'Ressursplanlegging', description: 'Ressursadministrasjon', isIncluded: false }
        ],
        'Enterprise': [
          { key: 'dashboard', name: 'Dashboard', description: 'Hovedoversikt og nøkkeltall', isIncluded: true },
          { key: 'quiz', name: 'Quiz-system', description: 'Quiz og læring', isIncluded: true },
          { key: 'sikkerhetskontroll', name: 'Sikkerhetskontroll', description: 'Sikkerhetskontroll og inspeksjoner', isIncluded: true },
          { key: 'bedrifter', name: 'Bedrifter', description: 'Bedriftsadministrasjon', isIncluded: true },
          { key: 'elever', name: 'Elever', description: 'Elevadministrasjon', isIncluded: true },
          { key: 'kontrakter', name: 'Kontrakter', description: 'Kontraktsadministrasjon', isIncluded: true },
          { key: 'kalender', name: 'Kalender', description: 'Kalender og planlegging', isIncluded: true },
          { key: 'nyheter', name: 'Nyheter', description: 'Nyheter og kunngjøringer', isIncluded: true },
          { key: 'oppgaver', name: 'Oppgaver', description: 'Oppgaveadministrasjon', isIncluded: true },
          { key: 'rapportering', name: 'Rapportering', description: 'Rapporter og analyser', isIncluded: true },
          { key: 'okonomi', name: 'Økonomi', description: 'Økonomiadministrasjon', isIncluded: true },
          { key: 'hr', name: 'HR', description: 'HR-administrasjon', isIncluded: true },
          { key: 'prosjekt', name: 'Prosjekt', description: 'Prosjektadministrasjon', isIncluded: true },
          { key: 'ressursplanlegging', name: 'Ressursplanlegging', description: 'Ressursadministrasjon', isIncluded: true }
        ]
      };

      const features = planFeatures[plan.name] || [];
      
      for (const feature of features) {
        await prisma.subscriptionFeature.upsert({
          where: {
            planId_featureKey: {
              planId: createdPlan.id,
              featureKey: feature.key
            }
          },
          update: {
            featureKey: feature.key,
            featureName: feature.name,
            description: feature.description,
            isIncluded: feature.isIncluded,
            limitValue: feature.limitValue
          },
          create: {
            planId: createdPlan.id,
            featureKey: feature.key,
            featureName: feature.name,
            description: feature.description,
            isIncluded: feature.isIncluded,
            limitValue: feature.limitValue
          }
        });
      }
    }

    console.log('✅ Abonnementsplaner opprettet');

    // Aktiver alle sider for eksisterende bedrifter (Basic plan)
    const bedrifter = await prisma.bedrift.findMany();
    const basicPages = ['dashboard', 'quiz', 'sikkerhetskontroll', 'bedrifter', 'elever', 'kontrakter'];

    for (const bedrift of bedrifter) {
      for (const pageKey of basicPages) {
        await prisma.bedriftPageAccess.upsert({
          where: {
                    bedriftId_pageKey: {
          bedriftId: bedrift.id,
          pageKey
        }
          },
          update: { isEnabled: true },
          create: {
            bedriftId: bedrift.id,
            pageKey,
            isEnabled: true,
            enabledAt: new Date()
          }
        });
      }
    }

    console.log('✅ Side-tilgang aktivert for eksisterende bedrifter');

    console.log('🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Kjør seeding hvis filen kjøres direkte
if (require.main === module) {
  seedPageAccess()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedPageAccess };