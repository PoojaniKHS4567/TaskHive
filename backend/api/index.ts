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

// CORS - Allow any Vercel frontend
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.includes('vercel.app') || origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    callback(null, true);
  },
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

// ==================== DATABASE CONNECTION (FIXED FOR VERCEL) ====================

// Cache connection for serverless
let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

async function connectDB(): Promise<typeof mongoose> {
  // Return cached connection if already connected
  if (cachedConnection && cachedConnection.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return cachedConnection;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    console.log('Waiting for existing connection promise...');
    return connectionPromise;
  }

  console.log('Creating new MongoDB connection...');
  connectionPromise = mongoose.connect(process.env.MONGODB_URI!, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 2000,
  });

  try {
    cachedConnection = await connectionPromise;
    console.log('MongoDB connected successfully');
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  } finally {
    connectionPromise = null;
  }
}

// Start connection immediately (don't wait for requests)
connectDB().catch(err => console.error('Initial connection failed:', err));

// NOT using middleware - routes will check connection when needed
// The connection is already established above

export default app;