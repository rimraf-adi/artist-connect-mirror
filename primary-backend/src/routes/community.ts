import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = express.Router();

// Get community posts (public)
router.get('/posts', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, type, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { isPublic: true };
    if (type) whereClause.type = type;
    if (search) {
      whereClause.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where: whereClause,
        include: {
          artisan: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              primaryCraft: true,
              verified: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: offset
      }),
      prisma.communityPost.count({ where: whereClause })
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

// Create community post (authenticated)
router.post('/posts', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const postData = req.body;

    const post = await prisma.communityPost.create({
      data: {
        ...postData,
        artisanId: userId
      },
      include: {
        artisan: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            primaryCraft: true,
            verified: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Community post created successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single post (public)
router.get('/posts/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        artisan: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            primaryCraft: true,
            verified: true
          }
        },
        comments: {
          include: {
            artisan: {
              select: {
                id: true,
                name: true,
                profileImage: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add comment (authenticated)
router.post('/posts/:id/comments', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.communityComment.create({
      data: {
        postId: id,
        artisanId: userId,
        content
      },
      include: {
        artisan: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    // Update comment count
    await prisma.communityPost.update({
      where: { id },
      data: { comments: { increment: 1 } }
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Like post (authenticated)
router.post('/posts/:id/like', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if already liked
    const existingLike = await prisma.communityLike.findUnique({
      where: {
        postId_artisanId: {
          postId: id,
          artisanId: userId
        }
      }
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'Post already liked'
      });
    }

    // Create like
    await prisma.communityLike.create({
      data: {
        postId: id,
        artisanId: userId
      }
    });

    // Update like count
    await prisma.communityPost.update({
      where: { id },
      data: { likes: { increment: 1 } }
    });

    res.json({
      success: true,
      message: 'Post liked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Unlike post (authenticated)
router.delete('/posts/:id/like', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if liked
    const existingLike = await prisma.communityLike.findUnique({
      where: {
        postId_artisanId: {
          postId: id,
          artisanId: userId
        }
      }
    });

    if (!existingLike) {
      return res.status(400).json({
        success: false,
        message: 'Post not liked'
      });
    }

    // Remove like
    await prisma.communityLike.delete({
      where: {
        postId_artisanId: {
          postId: id,
          artisanId: userId
        }
      }
    });

    // Update like count
    await prisma.communityPost.update({
      where: { id },
      data: { likes: { decrement: 1 } }
    });

    res.json({
      success: true,
      message: 'Post unliked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
