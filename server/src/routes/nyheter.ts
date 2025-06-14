import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { checkPermission } from '../middleware/permissions';

const router = Router();
const prisma = new PrismaClient();

// GET /api/nyheter - Hent alle nyheter
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { bedriftId } = req.user;
    const { kategori, publisert, limit = 20, offset = 0 } = req.query;

    const where: any = {
      isDeleted: false,
      OR: [
        { visning: 'ALLE' },
        { bedriftId: bedriftId },
        { bedriftId: null }
      ]
    };

    if (kategori) where.kategori = kategori;
    if (publisert !== undefined) where.publisert = publisert === 'true';

    const nyheter = await prisma.nyhet.findMany({
      where,
      include: {
        bedrift: true,
        deletedByUser: true
      },
      orderBy: [
        { prioritet: 'desc' },
        { opprettet: 'desc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    const total = await prisma.nyhet.count({ where });

    res.json({
      nyheter,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: total > parseInt(offset as string) + parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Feil ved henting av nyheter:', error);
    res.status(500).json({ error: 'Kunne ikke hente nyheter' });
  }
});

// GET /api/nyheter/:id - Hent spesifikk nyhet
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { bedriftId } = req.user;

    const nyhet = await prisma.nyhet.findFirst({
      where: {
        id: parseInt(id),
        isDeleted: false,
        OR: [
          { visning: 'ALLE' },
          { bedriftId: bedriftId },
          { bedriftId: null }
        ]
      },
      include: {
        bedrift: true,
        deletedByUser: true
      }
    });

    if (!nyhet) {
      return res.status(404).json({ error: 'Nyhet ikke funnet' });
    }

    res.json(nyhet);
  } catch (error) {
    console.error('Feil ved henting av nyhet:', error);
    res.status(500).json({ error: 'Kunne ikke hente nyhet' });
  }
});

// POST /api/nyheter - Opprett ny nyhet
router.post('/', authenticateToken, checkPermission('ADMIN'), async (req, res) => {
  try {
    const { bedriftId, userId } = req.user;
    const {
      tittel,
      innhold,
      sammendrag,
      bildeUrl,
      kategori = 'GENERELT',
      tags = [],
      prioritet = 1,
      visning = 'ALLE',
      publisert = false,
      publiseringsdato
    } = req.body;

    const nyhet = await prisma.nyhet.create({
      data: {
        tittel,
        innhold,
        sammendrag,
        bildeUrl,
        forfatter: `${req.user.fornavn} ${req.user.etternavn}`,
        kategori,
        tags,
        prioritet,
        visning,
        publisert,
        publiseringsdato: publiseringsdato ? new Date(publiseringsdato) : null,
        bedriftId: visning === 'BEDRIFT' ? bedriftId : null
      },
      include: {
        bedrift: true
      }
    });

    res.status(201).json(nyhet);
  } catch (error) {
    console.error('Feil ved opprettelse av nyhet:', error);
    res.status(500).json({ error: 'Kunne ikke opprette nyhet' });
  }
});

// PUT /api/nyheter/:id - Oppdater nyhet
router.put('/:id', authenticateToken, checkPermission('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bedriftId } = req.user;
    const updateData = req.body;

    // Sjekk om nyheten eksisterer og tilhører bedriften
    const existingNyhet = await prisma.nyhet.findFirst({
      where: {
        id: parseInt(id),
        isDeleted: false,
        OR: [
          { bedriftId: bedriftId },
          { bedriftId: null }
        ]
      }
    });

    if (!existingNyhet) {
      return res.status(404).json({ error: 'Nyhet ikke funnet' });
    }

    const nyhet = await prisma.nyhet.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        publiseringsdato: updateData.publiseringsdato ? new Date(updateData.publiseringsdato) : undefined
      },
      include: {
        bedrift: true
      }
    });

    res.json(nyhet);
  } catch (error) {
    console.error('Feil ved oppdatering av nyhet:', error);
    res.status(500).json({ error: 'Kunne ikke oppdatere nyhet' });
  }
});

// DELETE /api/nyheter/:id - Slett nyhet (soft delete)
router.delete('/:id', authenticateToken, checkPermission('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bedriftId, userId } = req.user;

    const existingNyhet = await prisma.nyhet.findFirst({
      where: {
        id: parseInt(id),
        isDeleted: false,
        OR: [
          { bedriftId: bedriftId },
          { bedriftId: null }
        ]
      }
    });

    if (!existingNyhet) {
      return res.status(404).json({ error: 'Nyhet ikke funnet' });
    }

    await prisma.nyhet.update({
      where: { id: parseInt(id) },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId
      }
    });

    res.json({ message: 'Nyhet slettet' });
  } catch (error) {
    console.error('Feil ved sletting av nyhet:', error);
    res.status(500).json({ error: 'Kunne ikke slette nyhet' });
  }
});

// GET /api/nyheter/kategorier - Hent alle kategorier
router.get('/kategorier', authenticateToken, async (req, res) => {
  try {
    const { bedriftId } = req.user;

    const kategorier = await prisma.nyhet.findMany({
      where: {
        isDeleted: false,
        OR: [
          { visning: 'ALLE' },
          { bedriftId: bedriftId },
          { bedriftId: null }
        ]
      },
      select: {
        kategori: true
      },
      distinct: ['kategori']
    });

    const kategoriListe = kategorier.map(k => k.kategori);
    
    res.json(kategoriListe);
  } catch (error) {
    console.error('Feil ved henting av kategorier:', error);
    res.status(500).json({ error: 'Kunne ikke hente kategorier' });
  }
});

export default router;