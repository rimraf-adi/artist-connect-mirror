import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Common validation schemas
export const authSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().optional(),
    location: Joi.string().optional(),
    primaryCraft: Joi.string().optional(),
    languages: Joi.array().items(Joi.string()).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    bio: Joi.string().max(500).optional(),
    location: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    primaryCraft: Joi.string().optional(),
    craftCategories: Joi.array().items(Joi.string()).optional(),
    experienceYears: Joi.number().min(0).optional(),
    languages: Joi.array().items(Joi.string()).optional()
  })
};

export const listingSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    shortDescription: Joi.string().max(200).optional(),
    longDescription: Joi.string().max(2000).optional(),
    language: Joi.string().default('en'),
    price: Joi.number().min(0).optional(),
    currency: Joi.string().default('INR'),
    stock: Joi.number().min(0).default(0),
    tags: Joi.array().items(Joi.string()).optional(),
    platformMetadata: Joi.object().optional()
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    shortDescription: Joi.string().max(200).optional(),
    longDescription: Joi.string().max(2000).optional(),
    language: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    currency: Joi.string().optional(),
    stock: Joi.number().min(0).optional(),
    published: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    platformMetadata: Joi.object().optional()
  })
};

export const aiSchemas = {
  generateStory: Joi.object({
    artisanName: Joi.string().required(),
    craftType: Joi.string().required(),
    productName: Joi.string().required(),
    productDescription: Joi.string().required(),
    artisanBio: Joi.string().optional(),
    location: Joi.string().optional(),
    templateType: Joi.string().valid('product', 'brand', 'personal', 'craft').required()
  }),

  generatePricing: Joi.object({
    productName: Joi.string().required(),
    description: Joi.string().required(),
    materialCost: Joi.number().min(0).required(),
    laborHours: Joi.number().min(0).required(),
    artisanExperience: Joi.number().min(0).required(),
    marketCategory: Joi.string().required(),
    location: Joi.string().required()
  }),

  generateBrandInsights: Joi.object({
    artisanName: Joi.string().required(),
    craftType: Joi.string().required(),
    targetAudience: Joi.string().required(),
    marketPosition: Joi.string().required(),
    currentBrandElements: Joi.object().optional()
  })
};
