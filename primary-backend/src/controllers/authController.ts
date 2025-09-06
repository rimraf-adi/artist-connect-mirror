import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { logger } from '../utils/logger';
import { ApiResponse, AuthResponse, RegisterRequest, LoginRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, phone, location, primaryCraft, languages }: RegisterRequest = req.body;

      // Check if user already exists
      const existingUser = await prisma.artisan.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.artisan.create({
        data: {
          name,
          email,
          passwd: hashedPassword,
          phone,
          location,
          primaryCraft,
          languages: languages || []
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          verified: true,
          createdAt: true
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          verified: user.verified
        },
        token
      };

      logger.info(`New user registered: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: response
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;

      // Find user
      const user = await prisma.artisan.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.passwd);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const response: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          verified: user.verified
        },
        token
      };

      logger.info(`User logged in: ${user.email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: response
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getProfile(req: any, res: Response) {
    try {
      const userId = req.user.id;

      const user = await prisma.artisan.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bio: true,
          location: true,
          website: true,
          profileImage: true,
          coverImage: true,
          businessName: true,
          gstNumber: true,
          panNumber: true,
          instagramHandle: true,
          twitterHandle: true,
          facebookPage: true,
          youtubeChannel: true,
          primaryCraft: true,
          craftCategories: true,
          experienceYears: true,
          skillLevel: true,
          languages: true,
          verified: true,
          totalSales: true,
          averageRating: true,
          totalReviews: true,
          createdAt: true,
          lastEditedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async updateProfile(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Remove sensitive fields
      delete updateData.id;
      delete updateData.email;
      delete updateData.passwd;
      delete updateData.role;
      delete updateData.verified;
      delete updateData.totalSales;
      delete updateData.averageRating;
      delete updateData.totalReviews;
      delete updateData.createdAt;

      const user = await prisma.artisan.update({
        where: { id: userId },
        data: {
          ...updateData,
          lastEditedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
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
          lastEditedAt: true
        }
      });

      logger.info(`Profile updated for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async changePassword(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Get current user
      const user = await prisma.artisan.findUnique({
        where: { id: userId },
        select: { passwd: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwd);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.artisan.update({
        where: { id: userId },
        data: { passwd: hashedNewPassword }
      });

      logger.info(`Password changed for user: ${userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async logout(req: any, res: Response) {
    try {
      // In a more sophisticated setup, you might want to blacklist the token
      // For now, we'll just return a success message
      logger.info(`User logged out: ${req.user.email}`);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}
