import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  getBilderSchema,
  uploadBildeSchema,
  oppdaterBildeSchema,
  slettBildeSchema,
  validateImageFile
} from '../validation/bilder.validation';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Konfigurer multer for bildeopplasting
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExt = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${fileExt}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    try {
      validateImageFile(file);
      cb(null, true);
    } catch (error) {
      cb(error as Error);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Test endpoint (kan beholdes for debugging)
router.get("/test", async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await prisma.bildeLibrary.count();
    res.json({ 
      success: true, 
      count, 
      uploadsPath: path.join(__dirname, '../../uploads/images'),
      uploadsExists: fs.existsSync(path.join(__dirname, '../../uploads/images'))
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Hent bilder
router.get("/", verifyToken, validate(getBilderSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tag, sok } = req.query;
    
    const bilder = await prisma.bildeLibrary.findMany({
      where: {
        ...(tag ? { tags: { has: tag as string } } : {}),
        ...(sok ? {
          OR: [
            { navn: { contains: sok as string, mode: 'insensitive' } },
            { beskrivelse: { contains: sok as string, mode: 'insensitive' } },
            { tags: { hasSome: [sok as string] } }
          ]
        } : {})
      },
      orderBy: { opprettet: 'desc' }
    });

    logger.info('Hentet bilder', {
      userId: req.bruker?.id,
      count: bilder.length,
      filters: { tag, sok }
    });
    
    res.json(bilder);
  } catch (error) {
    logger.error('Feil ved henting av bilder', {
      userId: req.bruker?.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke hente bilder", 500, 'GET_BILDER_ERROR');
  }
});

// Last opp bilde
router.post("/upload", verifyToken, upload.single('bilde'), validate(uploadBildeSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      logger.warn('Bildeopplasting uten fil', {
        userId: req.bruker?.id,
        body: req.body
      });
      throw new ValidationError("Ingen fil opplastet");
    }

    const { navn, beskrivelse, tags } = req.body;
    
    const filUrl = `/uploads/images/${req.file.filename}`;
    
    const bilde = await prisma.bildeLibrary.create({
      data: {
        navn: navn || req.file.originalname,
        beskrivelse: beskrivelse || null,
        filnavn: req.file.originalname,
        url: filUrl,
        storrelse: req.file.size,
        mimeType: req.file.mimetype,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : []
      }
    });

    logger.info('Lastet opp bilde', {
      userId: req.bruker?.id,
      bildeId: bilde.id,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    res.status(201).json(bilde);
  } catch (error) {
    // Slett opplastet fil hvis database-lagring feiler
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        logger.info('Slettet opplastet fil pga. database-feil', {
          filename: req.file.filename
        });
      } catch (deleteError) {
        logger.error('Kunne ikke slette fil', {
          filename: req.file.filename,
          error: deleteError instanceof Error ? deleteError.message : 'Ukjent feil'
        });
      }
    }
    
    if (error instanceof ValidationError) {
      throw error;
    }
    
    logger.error('Feil ved lagring av bilde', {
      userId: req.bruker?.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke lagre bilde", 500, 'UPLOAD_BILDE_ERROR');
  }
});

// Slett bilde
router.delete("/:id", verifyToken, validate(slettBildeSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bildeId = Number(req.params.id);
    
    const bilde = await prisma.bildeLibrary.findUnique({
      where: { id: bildeId }
    });

    if (!bilde) {
      throw new NotFoundError("Bilde");
    }

    // Slett fil fra disk
    const filePath = path.join(__dirname, '../../uploads/images', path.basename(bilde.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('Slettet bildefil', {
        filePath: path.basename(bilde.url)
      });
    }

    await prisma.bildeLibrary.delete({
      where: { id: bildeId }
    });

    logger.info('Slettet bilde', {
      userId: req.bruker?.id,
      bildeId,
      navn: bilde.navn
    });
    
    res.status(204).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Feil ved sletting av bilde', {
      userId: req.bruker?.id,
      bildeId: req.params.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke slette bilde", 500, 'DELETE_BILDE_ERROR');
  }
});

// Oppdater bilde
router.put("/:id", verifyToken, validate(oppdaterBildeSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bildeId = Number(req.params.id);
    const { navn, beskrivelse, tags } = req.body;
    
    // Sjekk om bildet eksisterer
    const eksisterendeBilde = await prisma.bildeLibrary.findUnique({
      where: { id: bildeId }
    });
    
    if (!eksisterendeBilde) {
      throw new NotFoundError("Bilde");
    }
    
    const bilde = await prisma.bildeLibrary.update({
      where: { id: bildeId },
      data: {
        navn,
        beskrivelse,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : undefined)
      }
    });

    logger.info('Oppdaterte bilde', {
      userId: req.bruker?.id,
      bildeId,
      endringer: { navn, beskrivelse, tags }
    });
    
    res.json(bilde);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Feil ved oppdatering av bilde', {
      userId: req.bruker?.id,
      bildeId: req.params.id,
      error: error instanceof Error ? error.message : 'Ukjent feil'
    });
    throw new AppError("Kunne ikke oppdatere bilde", 500, 'UPDATE_BILDE_ERROR');
  }
});

export default router; 