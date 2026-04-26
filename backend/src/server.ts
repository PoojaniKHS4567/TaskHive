import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== SECURITY MIDDLEWARE ====================

// Helmet for security headers (CSP, XSS protection, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:3000'],
    },
  },
}));

// Compression for faster responses
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse cookies
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// ==================== RATE LIMITING ====================

// General API rate limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiter for auth endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==================== ROUTES ====================

// Health check endpoint
app.get('/health', (_req, res) => {  // Added underscore to unused parameter
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((_req, res) => {  // Added underscore to unused parameter
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (no stack trace leaks in production)
app.use(errorHandler);

// ==================== DATABASE CONNECTION ====================

// Export the database connection function
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
  } catch (err: any) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

// Only start server if this file is run directly (local development)
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  });
}

// Export app for Vercel
export default app;