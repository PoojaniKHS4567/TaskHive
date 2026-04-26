import express from 'express';
import { validateRegister, validateLogin } from '../middleware/validation';
import { register, login, refresh, logout, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes (require authentication)
router.get('/me', authenticate, getMe);

export default router;