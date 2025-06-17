import { Router, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get quizzes
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query?.page as string) || 1;
    const limit = parseInt(req.query?.limit as string) || 20;
    const offset = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              questions: true
            }
          }
        }
      }),
      prisma.quiz.count()
    ]);

    res.json({
      data: quizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Get quizzes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz by ID
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          include: {
            answers: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    logger.error('Get quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create quiz
router.post('/', [
  body('title').isString().isLength({ min: 1, max: 200 }),
  body('description').optional().isString().isLength({ max: 1000 })
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description
      }
    });

    logger.info(`Quiz created: ${title}`);
    res.status(201).json(quiz);
  } catch (error) {
    logger.error('Create quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 