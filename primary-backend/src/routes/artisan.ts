import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Get all artisans (public)
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, craft, location, verified } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    if (craft) whereClause.primaryCraft = craft;
    if (location) whereClause.location = { contains: location as string, mode: 'insensitive' };
    if (verified) whereClause.verified = verified === 'true';

    const [artisans, total] = await Promise.all([
      prisma.artisan.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          bio: true,
          location: true,
          profileImage: true,
          primaryCraft: true,
          craftCategories: true,
          experienceYears: true,
          skillLevel: true,
          verified: true,
          averageRating: true,
          totalReviews: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: offset
      }),
      prisma.artisan.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: artisans,
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

// Get single artisan (public)
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const artisan = await prisma.artisan.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        location: true,
        website: true,
        profileImage: true,
        coverImage: true,
        businessName: true,
        primaryCraft: true,
        craftCategories: true,
        experienceYears: true,
        skillLevel: true,
        languages: true,
        verified: true,
        averageRating: true,
        totalReviews: true,
        totalSales: true,
        createdAt: true,
        lastEditedAt: true
      }
    });

    if (!artisan) {
      return res.status(404).json({
        success: false,
        message: 'Artisan not found'
      });
    }

    res.json({
      success: true,
      data: artisan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get artisan's listings (public)
router.get('/:id/listings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, published = 'true' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { artisanId: id };
    if (published !== 'all') {
      whereClause.published = published === 'true';
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: whereClause,
        include: {
          images: true,
          priceBreakdowns: true
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: offset
      }),
      prisma.listing.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: listings,
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

// Get artisan's skills (public)
router.get('/:id/skills', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const skills = await prisma.artisanSkill.findMany({
      where: { artisanId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get artisan's stories (public)
router.get('/:id/stories', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, type, isPublished = 'true' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { artisanId: id, isPublic: true };
    if (type) whereClause.type = type;
    if (isPublished !== 'all') {
      whereClause.isPublished = isPublished === 'true';
    }

    const [stories, total] = await Promise.all([
      prisma.artisanStory.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: offset
      }),
      prisma.artisanStory.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: stories,
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

export default router;
