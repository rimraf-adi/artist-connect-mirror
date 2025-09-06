import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticate);

// Get analytics dashboard data
router.get('/dashboard', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get basic stats
    const [
      totalListings,
      publishedListings,
      totalOrders,
      totalRevenue,
      totalViews,
      totalLikes,
      totalComments
    ] = await Promise.all([
      prisma.listing.count({ where: { artisanId: userId } }),
      prisma.listing.count({ where: { artisanId: userId, published: true } }),
      prisma.order.count({ 
        where: { 
          artisanId: userId,
          createdAt: { gte: startDate }
        } 
      }),
      prisma.order.aggregate({
        where: { 
          artisanId: userId,
          createdAt: { gte: startDate }
        },
        _sum: { netAmount: true }
      }),
      prisma.analyticsSnapshot.aggregate({
        where: { 
          artisanId: userId,
          metricType: 'views',
          date: { gte: startDate }
        },
        _sum: { value: true }
      }),
      prisma.communityPost.aggregate({
        where: { 
          artisanId: userId,
          createdAt: { gte: startDate }
        },
        _sum: { likes: true }
      }),
      prisma.communityPost.aggregate({
        where: { 
          artisanId: userId,
          createdAt: { gte: startDate }
        },
        _sum: { comments: true }
      })
    ]);

    // Get recent activity
    const recentActivity = await prisma.order.findMany({
      where: { artisanId: userId },
      include: {
        items: {
          include: {
            listing: {
              select: { title: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Get top performing listings
    const topListings = await prisma.listing.findMany({
      where: { artisanId: userId, published: true },
      include: {
        orderItems: {
          select: { qty: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const dashboardData = {
      overview: {
        totalListings,
        publishedListings,
        totalOrders,
        totalRevenue: totalRevenue._sum.netAmount || 0,
        totalViews: totalViews._sum.value || 0,
        totalLikes: totalLikes._sum.likes || 0,
        totalComments: totalComments._sum.comments || 0
      },
      recentActivity,
      topListings: topListings.map(listing => ({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        currency: listing.currency,
        totalSales: listing.orderItems.reduce((sum, item) => sum + item.qty, 0)
      }))
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get sales analytics
router.get('/sales', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { period = '30d', groupBy = 'day' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const orders = await prisma.order.findMany({
      where: { 
        artisanId: userId,
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        grossAmount: true,
        netAmount: true,
        currency: true,
        status: true,
        createdAt: true,
        platform: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Group by period
    const groupedData: any = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          totalOrders: 0,
          totalRevenue: 0,
          platforms: {}
        };
      }

      groupedData[key].totalOrders += 1;
      groupedData[key].totalRevenue += order.netAmount || 0;
      
      if (!groupedData[key].platforms[order.platform]) {
        groupedData[key].platforms[order.platform] = 0;
      }
      groupedData[key].platforms[order.platform] += order.netAmount || 0;
    });

    const salesData = Object.values(groupedData);

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get social media analytics
router.get('/social', async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const posts = await prisma.socialPost.findMany({
      where: { 
        artisanId: userId,
        createdAt: { gte: startDate }
      },
      select: {
        id: true,
        platform: true,
        caption: true,
        metrics: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by platform
    const platformData: any = {};
    posts.forEach(post => {
      if (!platformData[post.platform]) {
        platformData[post.platform] = {
          platform: post.platform,
          totalPosts: 0,
          totalEngagement: 0,
          posts: []
        };
      }

      platformData[post.platform].totalPosts += 1;
      platformData[post.platform].totalEngagement += post.metrics?.likes || 0;
      platformData[post.platform].totalEngagement += post.metrics?.comments || 0;
      platformData[post.platform].posts.push(post);
    });

    res.json({
      success: true,
      data: Object.values(platformData)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
