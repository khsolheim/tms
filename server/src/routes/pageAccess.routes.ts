import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, sjekkRolle, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/pages - Hent alle tilgjengelige sider
router.get('/admin/pages', verifyToken, sjekkRolle(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const pages = await prisma.pageDefinition.findMany({
      where: { isActive: true },
      orderBy: { pageName: 'asc' }
    });

    res.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/bedrifter/:id/pages - Hent side-tilgang for bedrift
router.get('/admin/bedrifter/:bedriftId/pages', verifyToken, sjekkRolle(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { bedriftId } = req.params;

    const pageAccess = await prisma.bedriftPageAccess.findMany({
      where: { bedriftId: parseInt(bedriftId) },
      include: {
        page: true,
        enabledByUser: {
          select: {
            id: true,
            navn: true,
            epost: true
          }
        }
      },
      orderBy: { page: { pageName: 'asc' } }
    });

    res.json(pageAccess);
  } catch (error) {
    console.error('Error fetching bedrift page access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/bedrifter/:id/pages/:pageKey - Oppdater side-tilgang
router.put('/admin/bedrifter/:bedriftId/pages/:pageKey', verifyToken, sjekkRolle(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { bedriftId, pageKey } = req.params;
    const { isEnabled, notes } = req.body;
    const userId = req.bruker?.id;

    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({ error: 'isEnabled must be a boolean' });
    }

    // Sjekk om bedriften eksisterer
    const bedrift = await prisma.bedrift.findUnique({
      where: { id: parseInt(bedriftId) }
    });

    if (!bedrift) {
      return res.status(404).json({ error: 'Bedrift ikke funnet' });
    }

    // Sjekk om siden eksisterer
    const page = await prisma.pageDefinition.findUnique({
      where: { pageKey }
    });

    if (!page) {
      return res.status(404).json({ error: 'Side ikke funnet' });
    }

    // Oppdater eller opprett side-tilgang
    const pageAccess = await prisma.bedriftPageAccess.upsert({
      where: {
        bedriftId_pageKey: {
          bedriftId: parseInt(bedriftId),
          pageKey
        }
      },
      update: {
        isEnabled,
        enabledAt: isEnabled ? new Date() : null,
        disabledAt: isEnabled ? null : new Date(),
        enabledBy: userId,
        notes,
        updatedAt: new Date()
      },
      create: {
        bedriftId: parseInt(bedriftId),
        pageKey,
        isEnabled,
        enabledAt: isEnabled ? new Date() : null,
        enabledBy: userId,
        notes
      }
    });

    // Logg endringen
    await prisma.pageAccessHistory.create({
      data: {
        bedriftId: parseInt(bedriftId),
        pageKey,
        action: isEnabled ? 'enabled' : 'disabled',
        performedBy: userId,
        reason: notes
      }
    });

    res.json(pageAccess);
  } catch (error) {
    console.error('Error updating page access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bedrift/pages - Hent tilgjengelige sider for bedrift
router.get('/bedrift/pages', verifyToken, async (req: AuthRequest, res) => {
  try {
    const bedriftId = req.bruker?.bedriftId;

    if (!bedriftId) {
      return res.status(403).json({ error: 'Ingen bedrift tilknyttet' });
    }

    const pageAccess = await prisma.bedriftPageAccess.findMany({
      where: { 
        bedriftId,
        isEnabled: true
      },
      include: {
        page: true
      },
      orderBy: { page: { pageName: 'asc' } }
    });

    res.json(pageAccess);
  } catch (error) {
    console.error('Error fetching bedrift pages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bedrift/pages/:pageKey/check - Sjekk om side er tilgjengelig
router.get('/bedrift/pages/:pageKey/check', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { pageKey } = req.params;
    const bedriftId = req.bruker?.bedriftId;

    if (!bedriftId) {
      return res.status(403).json({ error: 'Ingen bedrift tilknyttet' });
    }

    const pageAccess = await prisma.bedriftPageAccess.findUnique({
      where: {
        bedriftId_pageKey: {
          bedriftId,
          pageKey
        }
      }
    });

    res.json({ 
      isEnabled: pageAccess?.isEnabled || false,
      pageAccess 
    });
  } catch (error) {
    console.error('Error checking page access:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/bedrifter/:id/page-history - Hent side-tilgang historikk
router.get('/admin/bedrifter/:bedriftId/page-history', verifyToken, sjekkRolle(['ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { bedriftId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const history = await prisma.pageAccessHistory.findMany({
      where: { bedriftId: parseInt(bedriftId) },
      include: {
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

    const total = await prisma.pageAccessHistory.count({
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
    console.error('Error fetching page access history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;