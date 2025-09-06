import { Request, Response } from 'express';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { geminiService } from '../utils/gemini';
import { StorytellingRequest, PricingRequest } from '../types';

export class AIController {
  async generateStory(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const storytellingData: StorytellingRequest = req.body;

      // Get artisan data
      const artisan = await prisma.artisan.findUnique({
        where: { id: userId },
        select: {
          name: true,
          bio: true,
          location: true,
          primaryCraft: true,
          craftCategories: true,
          experienceYears: true
        }
      });

      if (!artisan) {
        return res.status(404).json({
          success: false,
          message: 'Artisan not found'
        });
      }

      // Generate story using Gemini AI
      const result = await geminiService.generateStorytellingContent({
        artisanName: artisan.name,
        craftType: storytellingData.craftType,
        productName: storytellingData.productName,
        productDescription: storytellingData.productDescription,
        artisanBio: artisan.bio,
        location: artisan.location,
        templateType: storytellingData.templateType
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || 'Failed to generate story'
        });
      }

      // Save the generated story
      const story = await prisma.artisanStory.create({
        data: {
          artisanId: userId,
          title: result.content?.title || 'Generated Story',
          content: result.content?.content || result.content,
          type: storytellingData.templateType,
          isPublic: true,
          isPublished: false
        }
      });

      // Save AI insight
      await prisma.aIInsight.create({
        data: {
          artisanId: userId,
          type: 'storytelling',
          inputRef: {
            productName: storytellingData.productName,
            craftType: storytellingData.craftType,
            templateType: storytellingData.templateType
          },
          output: result.content,
          confidence: result.confidence
        }
      });

      logger.info(`Story generated for artisan: ${userId}`);

      res.json({
        success: true,
        message: 'Story generated successfully',
        data: {
          storyId: story.id,
          ...result
        }
      });
    } catch (error) {
      logger.error('Generate story error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async generatePricingSuggestion(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const pricingData: PricingRequest = req.body;

      // Generate pricing using Gemini AI
      const result = await geminiService.generatePricingSuggestion(pricingData);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || 'Failed to generate pricing suggestion'
        });
      }

      // Save AI insight
      await prisma.aIInsight.create({
        data: {
          artisanId: userId,
          type: 'pricing',
          inputRef: pricingData,
          output: result,
          confidence: result.confidence
        }
      });

      logger.info(`Pricing suggestion generated for artisan: ${userId}`);

      res.json({
        success: true,
        message: 'Pricing suggestion generated successfully',
        data: result
      });
    } catch (error) {
      logger.error('Generate pricing error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async generateBrandInsights(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const brandData = req.body;

      // Get current brand elements
      const currentBrandElements = await prisma.brandElement.findMany({
        where: { artisanId: userId, isActive: true }
      });

      // Generate brand insights using Gemini AI
      const result = await geminiService.generateBrandInsights({
        ...brandData,
        currentBrandElements: currentBrandElements.reduce((acc, element) => {
          acc[element.type] = element.value;
          return acc;
        }, {} as any)
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || 'Failed to generate brand insights'
        });
      }

      // Save AI insight
      await prisma.aIInsight.create({
        data: {
          artisanId: userId,
          type: 'brand',
          inputRef: brandData,
          output: result.insights,
          confidence: result.confidence
        }
      });

      logger.info(`Brand insights generated for artisan: ${userId}`);

      res.json({
        success: true,
        message: 'Brand insights generated successfully',
        data: result
      });
    } catch (error) {
      logger.error('Generate brand insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async generateCompetitionAnalysis(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const analysisData = req.body;

      // Generate competition analysis using Gemini AI
      const result = await geminiService.generateCompetitionAnalysis(analysisData);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || 'Failed to generate competition analysis'
        });
      }

      // Save competition analysis
      const analysis = await prisma.competitionAnalysis.create({
        data: {
          artisanId: userId,
          competitorName: analysisData.competitorName || 'Market Analysis',
          competitorUrl: analysisData.competitorUrl,
          analysisType: analysisData.analysisType || 'general',
          insights: result.analysis,
          recommendations: result.analysis
        }
      });

      // Save AI insight
      await prisma.aIInsight.create({
        data: {
          artisanId: userId,
          type: 'competition',
          inputRef: analysisData,
          output: result.analysis,
          confidence: result.confidence
        }
      });

      logger.info(`Competition analysis generated for artisan: ${userId}`);

      res.json({
        success: true,
        message: 'Competition analysis generated successfully',
        data: {
          analysisId: analysis.id,
          ...result
        }
      });
    } catch (error) {
      logger.error('Generate competition analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getAIInsights(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { type, limit = 10, offset = 0 } = req.query;

      const whereClause: any = { artisanId: userId };
      if (type) {
        whereClause.type = type;
      }

      const insights = await prisma.aIInsight.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      const total = await prisma.aIInsight.count({
        where: whereClause
      });

      res.json({
        success: true,
        data: insights,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: total > parseInt(offset as string) + parseInt(limit as string)
        }
      });
    } catch (error) {
      logger.error('Get AI insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getStories(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { type, isPublished, limit = 10, offset = 0 } = req.query;

      const whereClause: any = { artisanId: userId };
      if (type) {
        whereClause.type = type;
      }
      if (isPublished !== undefined) {
        whereClause.isPublished = isPublished === 'true';
      }

      const stories = await prisma.artisanStory.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      });

      const total = await prisma.artisanStory.count({
        where: whereClause
      });

      res.json({
        success: true,
        data: stories,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: total > parseInt(offset as string) + parseInt(limit as string)
        }
      });
    } catch (error) {
      logger.error('Get stories error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async updateStory(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const storyId = req.params.id;
      const updateData = req.body;

      // Verify story belongs to user
      const story = await prisma.artisanStory.findFirst({
        where: { id: storyId, artisanId: userId }
      });

      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }

      const updatedStory = await prisma.artisanStory.update({
        where: { id: storyId },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      });

      logger.info(`Story updated: ${storyId}`);

      res.json({
        success: true,
        message: 'Story updated successfully',
        data: updatedStory
      });
    } catch (error) {
      logger.error('Update story error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async deleteStory(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const storyId = req.params.id;

      // Verify story belongs to user
      const story = await prisma.artisanStory.findFirst({
        where: { id: storyId, artisanId: userId }
      });

      if (!story) {
        return res.status(404).json({
          success: false,
          message: 'Story not found'
        });
      }

      await prisma.artisanStory.delete({
        where: { id: storyId }
      });

      logger.info(`Story deleted: ${storyId}`);

      res.json({
        success: true,
        message: 'Story deleted successfully'
      });
    } catch (error) {
      logger.error('Delete story error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
