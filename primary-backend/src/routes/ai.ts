import express from 'express';
import { AIController } from '../controllers/aiController';
import { validate, aiSchemas } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const aiController = new AIController();

// All AI routes require authentication
router.use(authenticate);

// Storytelling routes
router.post('/story/generate', validate(aiSchemas.generateStory), aiController.generateStory);
router.get('/stories', aiController.getStories);
router.put('/stories/:id', aiController.updateStory);
router.delete('/stories/:id', aiController.deleteStory);

// Pricing assistance routes
router.post('/pricing/generate', validate(aiSchemas.generatePricing), aiController.generatePricingSuggestion);

// Brand insights routes
router.post('/brand/insights', validate(aiSchemas.generateBrandInsights), aiController.generateBrandInsights);

// Competition analysis routes
router.post('/competition/analyze', aiController.generateCompetitionAnalysis);

// General AI insights
router.get('/insights', aiController.getAIInsights);

export default router;
