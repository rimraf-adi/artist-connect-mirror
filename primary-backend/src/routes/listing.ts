import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validate, listingSchemas } from '../middleware/validation';

const router = express.Router();

// Get all listings (public)
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, craft, location, minPrice, maxPrice, tags, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { published: true };
    
    if (craft) whereClause.artisan = { primaryCraft: craft };
    if (location) whereClause.artisan = { location: { contains: location as string, mode: 'insensitive' } };
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = Number(minPrice);
      if (maxPrice) whereClause.price.lte = Number(maxPrice);
    }
    if (tags) {
      const tagArray = (tags as string).split(',');
      whereClause.tags = { hasSome: tagArray };
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { shortDescription: { contains: search as string, mode: 'insensitive' } },
        { longDescription: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: whereClause,
        include: {
          artisan: {
            select: {
              id: true,
              name: true,
              location: true,
              profileImage: true,
              verified: true,
              averageRating: true
            }
          },
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

// Get single listing (public)
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        artisan: {
          select: {
            id: true,
            name: true,
            bio: true,
            location: true,
            website: true,
            profileImage: true,
            verified: true,
            averageRating: true,
            totalReviews: true
          }
        },
        images: true,
        priceBreakdowns: true,
        inventorySnapshots: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create listing (authenticated)
router.post('/', authenticate, validate(listingSchemas.create), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const listingData = req.body;

    const listing = await prisma.listing.create({
      data: {
        ...listingData,
        artisanId: userId
      },
      include: {
        images: true,
        priceBreakdowns: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update listing (authenticated)
router.put('/:id', authenticate, validate(listingSchemas.update), async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Verify listing belongs to user
    const existingListing = await prisma.listing.findFirst({
      where: { id, artisanId: userId }
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        priceBreakdowns: true
      }
    });

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete listing (authenticated)
router.delete('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify listing belongs to user
    const existingListing = await prisma.listing.findFirst({
      where: { id, artisanId: userId }
    });

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    await prisma.listing.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's listings (authenticated)
router.get('/my/listings', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, published } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { artisanId: userId };
    if (published !== undefined) {
      whereClause.published = published === 'true';
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: whereClause,
        include: {
          images: true,
          priceBreakdowns: true,
          inventorySnapshots: {
            orderBy: { recordedAt: 'desc' },
            take: 1
          }
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

export default router;
