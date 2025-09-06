import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All social routes require authentication
router.use(authenticate);

// Get social accounts
router.get('/accounts', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const accounts = await prisma.socialAccount.findMany({
      where: { artisanId: userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get social posts
router.get('/posts', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, platform } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { artisanId: userId };
    if (platform) whereClause.platform = platform;

    const [posts, total] = await Promise.all([
      prisma.socialPost.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: offset
      }),
      prisma.socialPost.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: offset + Number(limit) < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create social post
router.post('/posts', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const postData = req.body;

    const post = await prisma.socialPost.create({
      data: {
        ...postData,
        artisanId: userId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Social post created successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
