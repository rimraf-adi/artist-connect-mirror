import { Request } from 'express';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  verified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  primaryCraft?: string;
  languages?: string[];
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}

// Artisan Types
export interface ArtisanProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  profileImage?: string;
  coverImage?: string;
  businessName?: string;
  primaryCraft?: string;
  craftCategories: string[];
  experienceYears?: number;
  skillLevel?: string;
  languages: string[];
  verified: boolean;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  lastEditedAt?: Date;
}

// Listing Types
export interface ListingData {
  id: string;
  artisanId: string;
  title: string;
  shortDescription?: string;
  longDescription?: string;
  language: string;
  price?: number;
  currency: string;
  stock: number;
  published: boolean;
  tags: string[];
  platformMetadata?: any;
  images: ListingImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ListingImage {
  id: string;
  listingId: string;
  uri: string;
  role?: string;
  width?: number;
  height?: number;
  metadata?: any;
  createdAt: Date;
}

// AI Service Types
export interface StorytellingRequest {
  artisanName: string;
  craftType: string;
  productName: string;
  productDescription: string;
  artisanBio?: string;
  location?: string;
  templateType: 'product' | 'brand' | 'personal' | 'craft';
}

export interface StorytellingResponse {
  success: boolean;
  title?: string;
  content?: string;
  socialMediaCaption?: string;
  hashtags?: string[];
  keyPoints?: string[];
  confidence?: number;
  error?: string;
}

export interface PricingRequest {
  productName: string;
  description: string;
  materialCost: number;
  laborHours: number;
  artisanExperience: number;
  marketCategory: string;
  location: string;
}

export interface PricingResponse {
  success: boolean;
  suggestedRetailPrice?: number;
  suggestedWholesalePrice?: number;
  breakdown?: {
    materialCost: number;
    laborCost: number;
    overhead: number;
    profit: number;
  };
  reasoning?: string;
  marketPosition?: string;
  recommendations?: string[];
  confidence?: number;
  error?: string;
}

// Social Media Types
export interface SocialPostData {
  id: string;
  artisanId: string;
  platform: string;
  externalPostId?: string;
  caption?: string;
  mediaUris: string[];
  publishDate?: Date;
  metrics?: any;
  createdAt: Date;
}

// Order Types
export interface OrderData {
  id: string;
  artisanId: string;
  platform: string;
  externalOrderId?: string;
  grossAmount?: number;
  fees?: number;
  netAmount?: number;
  currency: string;
  status: string;
  placedAt?: Date;
  updatedAt?: Date;
  shippingInfo?: any;
  paymentInfo?: any;
  items: OrderItemData[];
}

export interface OrderItemData {
  id: string;
  orderId: string;
  listingId: string;
  qty: number;
  unitPrice?: number;
  totalPrice?: number;
}

// Community Types
export interface CommunityPostData {
  id: string;
  artisanId: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  images: string[];
  isPublic: boolean;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface AnalyticsData {
  metricType: string;
  value: number;
  period: string;
  date: Date;
  metadata?: any;
}

// File Upload Types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Extended Request Type
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}
