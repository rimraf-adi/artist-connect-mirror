import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './logger';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' 
    });
  }

  async generateStorytellingContent(data: {
    artisanName: string;
    craftType: string;
    productName: string;
    productDescription: string;
    artisanBio?: string;
    location?: string;
    templateType: 'product' | 'brand' | 'personal' | 'craft';
  }) {
    try {
      const prompt = this.buildStorytellingPrompt(data);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text,
        confidence: 0.85 // You can implement actual confidence scoring
      };
    } catch (error) {
      logger.error('Error generating storytelling content:', error);
      return {
        success: false,
        error: 'Failed to generate storytelling content'
      };
    }
  }

  async generatePricingSuggestion(data: {
    productName: string;
    description: string;
    materialCost: number;
    laborHours: number;
    artisanExperience: number;
    marketCategory: string;
    location: string;
  }) {
    try {
      const prompt = this.buildPricingPrompt(data);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response to extract pricing information
      const pricingData = this.parsePricingResponse(text);

      return {
        success: true,
        ...pricingData,
        confidence: 0.80
      };
    } catch (error) {
      logger.error('Error generating pricing suggestion:', error);
      return {
        success: false,
        error: 'Failed to generate pricing suggestion'
      };
    }
  }

  async generateBrandInsights(data: {
    artisanName: string;
    craftType: string;
    currentBrandElements?: any;
    targetAudience: string;
    marketPosition: string;
  }) {
    try {
      const prompt = this.buildBrandInsightsPrompt(data);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        insights: text,
        confidence: 0.75
      };
    } catch (error) {
      logger.error('Error generating brand insights:', error);
      return {
        success: false,
        error: 'Failed to generate brand insights'
      };
    }
  }

  async generateCompetitionAnalysis(data: {
    artisanCraft: string;
    location: string;
    targetPriceRange: string;
    competitorData: any[];
  }) {
    try {
      const prompt = this.buildCompetitionAnalysisPrompt(data);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        analysis: text,
        confidence: 0.70
      };
    } catch (error) {
      logger.error('Error generating competition analysis:', error);
      return {
        success: false,
        error: 'Failed to generate competition analysis'
      };
    }
  }

  private buildStorytellingPrompt(data: any): string {
    return `
You are an expert storytelling assistant for local artisans. Create compelling, authentic stories that connect with customers emotionally.

Artisan: ${data.artisanName}
Craft Type: ${data.craftType}
Product: ${data.productName}
Description: ${data.productDescription}
Location: ${data.location || 'Not specified'}
Bio: ${data.artisanBio || 'Not provided'}

Create a ${data.templateType} story that:
1. Highlights the artisan's unique skills and heritage
2. Explains the traditional techniques used
3. Connects the product to cultural significance
4. Appeals to modern customers while respecting tradition
5. Is engaging and shareable on social media

Format the response as JSON with:
{
  "title": "Story title",
  "content": "Full story content",
  "socialMediaCaption": "Short caption for social media",
  "hashtags": ["relevant", "hashtags"],
  "keyPoints": ["point1", "point2", "point3"]
}
`;
  }

  private buildPricingPrompt(data: any): string {
    return `
You are a pricing expert for handmade crafts. Analyze the following product and suggest optimal pricing.

Product: ${data.productName}
Description: ${data.description}
Material Cost: ₹${data.materialCost}
Labor Hours: ${data.laborHours} hours
Artisan Experience: ${data.artisanExperience} years
Market Category: ${data.marketCategory}
Location: ${data.location}

Consider:
1. Material costs and quality
2. Labor time and skill level
3. Market positioning
4. Regional pricing variations
5. Profit margins for sustainability
6. Competitive pricing

Format the response as JSON with:
{
  "suggestedRetailPrice": 0,
  "suggestedWholesalePrice": 0,
  "breakdown": {
    "materialCost": 0,
    "laborCost": 0,
    "overhead": 0,
    "profit": 0
  },
  "reasoning": "Explanation of pricing strategy",
  "marketPosition": "budget|mid-range|premium|luxury",
  "recommendations": ["tip1", "tip2", "tip3"]
}
`;
  }

  private buildBrandInsightsPrompt(data: any): string {
    return `
You are a brand strategy expert for artisan businesses. Analyze and provide brand development insights.

Artisan: ${data.artisanName}
Craft Type: ${data.craftType}
Target Audience: ${data.targetAudience}
Market Position: ${data.marketPosition}
Current Brand Elements: ${JSON.stringify(data.currentBrandElements || {})}

Provide insights on:
1. Color palette recommendations
2. Typography suggestions
3. Brand voice and messaging
4. Visual identity elements
5. Brand positioning strategy

Format the response as JSON with:
{
  "colorPalette": ["#color1", "#color2", "#color3"],
  "typography": "Font recommendations",
  "brandVoice": "Voice description",
  "visualStyle": "Style recommendations",
  "tagline": "Suggested tagline",
  "recommendations": ["insight1", "insight2", "insight3"]
}
`;
  }

  private buildCompetitionAnalysisPrompt(data: any): string {
    return `
You are a market research expert. Analyze the competitive landscape for artisan crafts.

Craft Type: ${data.artisanCraft}
Location: ${data.location}
Target Price Range: ${data.targetPriceRange}
Competitor Data: ${JSON.stringify(data.competitorData)}

Analyze:
1. Market positioning opportunities
2. Pricing strategies
3. Marketing approaches
4. Product differentiation
5. Market gaps and opportunities

Format the response as JSON with:
{
  "marketAnalysis": "Overall market insights",
  "pricingInsights": "Pricing strategy recommendations",
  "opportunities": ["opportunity1", "opportunity2"],
  "threats": ["threat1", "threat2"],
  "recommendations": ["recommendation1", "recommendation2"]
}
`;
  }

  private parsePricingResponse(text: string): any {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      logger.error('Error parsing pricing response:', error);
      return {
        suggestedRetailPrice: 0,
        suggestedWholesalePrice: 0,
        breakdown: {
          materialCost: 0,
          laborCost: 0,
          overhead: 0,
          profit: 0
        },
        reasoning: 'Unable to parse AI response',
        marketPosition: 'mid-range',
        recommendations: []
      };
    }
  }
}

export const geminiService = new GeminiService();
