import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/authRoutes';
import taskRoutes from '../src/routes/taskRoutes';
import { errorHandler } from '../src/middleware/errorHandler';

dotenv.config();

const app = express();

// ==================== SECURITY MIDDLEWARE ====================

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

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true,
  optionsSuccessStatus: 200
}));

// ==================== RATE LIMITING ====================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ==================== ROUTES ====================

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
    mongodb_uri_set: !!process.env.MONGODB_URI
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ==================== ERROR HANDLING ====================

app.use((_req, res) => {
  res.status(404).json({ error: `Route not found: ${_req.method} ${_req.url}` });
});

app.use(errorHandler);

// ==================== DATABASE CONNECTION - CONNECT ONCE ====================

// Global connection cache
let isConnected = false;

// Connect IMMEDIATELY when server starts (not in middleware)
async function connectDB() {
  if (isConnected) {
    console.log('Using existing connection');
    return;
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't throw - let the server start but log error
  }
}

// Start connection immediately
connectDB();

// NO middleware that waits for connection - this was causing the timeout!

export default app;