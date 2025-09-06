import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Get orders
router.get('/', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, platform } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { artisanId: userId };
    if (status) whereClause.status = status;
    if (platform) whereClause.platform = platform;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              listing: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  currency: true
                }
              }
            }
          },
          payments: true,
          shipments: true
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: offset
      }),
      prisma.order.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: orders,
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

// Get single order
router.get('/:id', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { id, artisanId: userId },
      include: {
        items: {
          include: {
            listing: true
          }
        },
        payments: true,
        shipments: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update order status
router.put('/:id/status', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findFirst({
      where: { id, artisanId: userId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
