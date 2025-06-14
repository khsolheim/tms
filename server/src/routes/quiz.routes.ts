import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, sjekkRolle, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { 
  createQuizKategoriSchema, 
  updateQuizKategoriSchema, 
  deleteQuizKategoriSchema,
  quizKategoriQuerySchema,
  createQuizSporsmalSchema,
  updateQuizSporsmalSchema,
  deleteQuizSporsmalSchema,
  quizSporsmalQuerySchema,
  getQuizSporsmalSchema
} from '../validation/quiz.validation';

const router = Router();
const prisma = new PrismaClient();

// Quiz kategorier endepunkter
router.get("/kategorier", 
  verifyToken, 
  validate(quizKategoriQuerySchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { klasse } = req.query;
    
    const where = klasse ? { klasse: klasse as string } : {};
    
    const kategorier = await prisma.quizKategori.findMany({
      where,
      include: {
        underkategorier: true,
        hovedkategori: true,
        _count: {
          select: { sporsmal: true }
        }
      },
      orderBy: { navn: 'asc' }
    });
    
    res.json(kategorier);
  })
);

router.post("/kategorier", 
  verifyToken, 
  validate(createQuizKategoriSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { navn, klasse, hovedkategoriId } = req.body;
    
    const kategori = await prisma.quizKategori.create({
      data: {
        navn,
        klasse,
        hovedkategoriId: hovedkategoriId || null
      },
      include: {
        underkategorier: true,
        hovedkategori: true
      }
    });
    
    res.json(kategori);
  })
);

router.put("/kategorier/:id", 
  verifyToken, 
  validate(updateQuizKategoriSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { navn, klasse, hovedkategoriId } = req.body;
    
    const kategori = await prisma.quizKategori.update({
      where: { id: parseInt(id) },
      data: {
        navn,
        klasse,
        hovedkategoriId
      },
      include: {
        underkategorier: true,
        hovedkategori: true
      }
    });
    
    res.json(kategori);
  })
);

router.delete("/kategorier/:id", 
  verifyToken, 
  validate(deleteQuizKategoriSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Sjekk om kategorien har spørsmål
    const kategori = await prisma.quizKategori.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { sporsmal: true }
        }
      }
    });
    
    if (!kategori) {
      res.status(404).json({ error: "Kategori ikke funnet" });
      return;
    }
    
    if (kategori._count.sporsmal > 0) {
      res.status(400).json({ error: "Kan ikke slette kategori som har spørsmål" });
      return;
    }
    
    await prisma.quizKategori.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true });
  })
);

// Quiz spørsmål endepunkter
router.get("/sporsmal", 
  verifyToken, 
  validate(quizSporsmalQuerySchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { klasse, kategoriId } = req.query;
    
    const where: any = {};
    if (klasse) {
      where.klasser = { has: klasse as string };
    }
    if (kategoriId) {
      where.kategoriId = parseInt(kategoriId as string);
    }
    
    const sporsmal = await prisma.quizSporsmal.findMany({
      where,
      include: {
        kategori: true
      },
      orderBy: { id: 'asc' }
    });
    
    res.json(sporsmal);
  })
);

router.get("/sporsmal/:id", 
  verifyToken, 
  validate(getQuizSporsmalSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const sporsmal = await prisma.quizSporsmal.findUnique({
      where: { id: parseInt(id) },
      include: {
        kategori: true
      }
    });
    
    if (!sporsmal) {
      res.status(404).json({ error: "Spørsmål ikke funnet" });
      return;
    }
    
    res.json(sporsmal);
  })
);

router.post("/sporsmal", 
  verifyToken, 
  validate(createQuizSporsmalSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { tekst, svaralternativer, riktigSvar, bildeUrl, forklaring, klasser, kategoriId } = req.body;
    
    const sporsmal = await prisma.quizSporsmal.create({
      data: {
        tekst,
        svaralternativer,
        riktigSvar,
        bildeUrl: bildeUrl || null,
        forklaring: forklaring || null,
        klasser: klasser || [],
        kategoriId: kategoriId || null
      },
      include: {
        kategori: true
      }
    });
    
    res.json(sporsmal);
  })
);

router.put("/sporsmal/:id", 
  verifyToken, 
  validate(updateQuizSporsmalSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { tekst, svaralternativer, riktigSvar, bildeUrl, forklaring, klasser, kategoriId } = req.body;
    
    const sporsmal = await prisma.quizSporsmal.update({
      where: { id: parseInt(id) },
      data: {
        tekst,
        svaralternativer,
        riktigSvar,
        bildeUrl,
        forklaring,
        klasser,
        kategoriId
      },
      include: {
        kategori: true
      }
    });
    
    res.json(sporsmal);
  })
);

router.delete("/sporsmal/:id", 
  verifyToken, 
  validate(deleteQuizSporsmalSchema),
  asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    await prisma.quizSporsmal.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true });
  })
);

export default router; 