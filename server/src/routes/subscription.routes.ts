import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/subscription-plans - Hent alle abonnementsplaner
router.get('/admin/subscription-plans', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      include: {
        subscriptionFeatures: true
      },
      orderBy: { priceMonthly: 'asc' }
    });

    res.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/bedrifter/:id/subscription - Hent bedriftens abonnement
router.get('/admin/bedrifter/:bedriftId/subscription', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { bedriftId } = req.params;

    const subscription = await prisma.bedriftSubscription.findUnique({
      where: { bedriftId: parseInt(bedriftId) },
      include: {
        plan: {
          include: {
            subscriptionFeatures: true
          }
        }
      }
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error fetching bedrift subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/bedrifter/:id/subscription - Oppdater bedriftens abonnement
router.put('/admin/bedrifter/:bedriftId/subscription', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { bedriftId } = req.params;
    const { planId, status, notes } = req.body;
    const userId = req.user?.id;

    // Sjekk om bedriften eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: parseInt(bedriftId) }
    });

    if (!bedrift) {
      return res.status(404).json({ error: 'Bedrift ikke funnet' });
    }

    // Sjekk om planen eksisterer
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Abonnementsplan ikke funnet' });
    }

    const oldSubscription = await prisma.bedriftSubscription.findUnique({
      where: { bedriftId: parseInt(bedriftId) }
    });

    // Oppdater eller opprett abonnement
    const subscription = await prisma.bedriftSubscription.upsert({
      where: { bedriftId: parseInt(bedriftId) },
      update: {
        planId,
        status: status || 'active',
        startDate: oldSubscription?.startDate || new Date(),
        endDate: oldSubscription?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dager
        updatedAt: new Date()
      },
      create: {
        bedriftId: parseInt(bedriftId),
        planId,
        status: status || 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dager
        autoRenew: true
      }
    });

    // Logg endringen
    await prisma.subscriptionHistory.create({
      data: {
        bedriftId: parseInt(bedriftId),
        planId,
        action: oldSubscription ? 'upgraded' : 'started',
        oldPlanId: oldSubscription?.planId || null,
        newPlanId: planId,
        performedBy: userId,
        notes
      }
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error updating bedrift subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bedrift/subscription - Hent bedriftens eget abonnement
router.get('/bedrift/subscription', authenticateToken, async (req, res) => {
  try {
    const bedriftId = req.user?.bedriftId;

    if (!bedriftId) {
      return res.status(403).json({ error: 'Ingen bedrift tilknyttet' });
    }

    const subscription = await prisma.bedriftSubscription.findUnique({
      where: { bedriftId },
      include: {
        plan: {
          include: {
            subscriptionFeatures: true
          }
        }
      }
    });

    res.json(subscription);
  } catch (error) {
    console.error('Error fetching bedrift subscription:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bedrift/features - Hent tilgjengelige funksjoner for bedrift
router.get('/bedrift/features', authenticateToken, async (req, res) => {
  try {
    const bedriftId = req.user?.bedriftId;

    if (!bedriftId) {
      return res.status(403).json({ error: 'Ingen bedrift tilknyttet' });
    }

    const subscription = await prisma.bedriftSubscription.findUnique({
      where: { bedriftId },
      include: {
        plan: {
          include: {
            subscriptionFeatures: true
          }
        }
      }
    });

    if (!subscription || subscription.status !== 'active') {
      return res.json({ features: [], subscription: null });
    }

    const features = subscription.plan.subscriptionFeatures.map(feature => ({
      key: feature.featureKey,
      name: feature.featureName,
      description: feature.description,
      isIncluded: feature.isIncluded,
      limitValue: feature.limitValue
    }));

    res.json({ features, subscription });
  } catch (error) {
    console.error('Error fetching bedrift features:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/bedrifter/:id/subscription-history - Hent abonnementshistorikk
router.get('/admin/bedrifter/:bedriftId/subscription-history', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { bedriftId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const history = await prisma.subscriptionHistory.findMany({
      where: { bedriftId: parseInt(bedriftId) },
      include: {
        plan: true,
        oldPlan: true,
        newPlan: true,
        performedByUser: {
          select: {
            id: true,
            navn: true,
            epost: true
          }
        }
      },
      orderBy: { performedAt: 'desc' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string)
    });

    const total = await prisma.subscriptionHistory.count({
      where: { bedriftId: parseInt(bedriftId) }
    });

    res.json({
      history,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/subscription-plans - Opprett ny abonnementsplan
router.post('/admin/subscription-plans', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, description, priceMonthly, priceYearly, features, maxUsers, maxBedrifter } = req.body;

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        priceMonthly: priceMonthly ? parseFloat(priceMonthly) : null,
        priceYearly: priceYearly ? parseFloat(priceYearly) : null,
        features: JSON.stringify(features || []),
        maxUsers,
        maxBedrifter,
        isActive: true
      }
    });

    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/subscription-plans/:id - Oppdater abonnementsplan
router.put('/admin/subscription-plans/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priceMonthly, priceYearly, features, maxUsers, maxBedrifter, isActive } = req.body;

    const plan = await prisma.subscriptionPlan.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        priceMonthly: priceMonthly ? parseFloat(priceMonthly) : null,
        priceYearly: priceYearly ? parseFloat(priceYearly) : null,
        features: features ? JSON.stringify(features) : undefined,
        maxUsers,
        maxBedrifter,
        isActive
      }
    });

    res.json(plan);
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/subscription-plans/:id/features - Legg til funksjon til plan
router.post('/admin/subscription-plans/:id/features', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { featureKey, featureName, description, isIncluded, limitValue } = req.body;

    const feature = await prisma.subscriptionFeature.create({
      data: {
        planId: parseInt(id),
        featureKey,
        featureName,
        description,
        isIncluded: isIncluded !== false,
        limitValue
      }
    });

    res.status(201).json(feature);
  } catch (error) {
    console.error('Error adding feature to plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;