import express from 'express';
import { AuthController } from '../controllers/authController';
import { validate, authSchemas } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', validate(authSchemas.register), authController.register);
router.post('/login', validate(authSchemas.login), authController.login);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, validate(authSchemas.updateProfile), authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router;
