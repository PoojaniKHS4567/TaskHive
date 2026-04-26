// This is the entry point for Vercel - NO app.listen() here!
import app from '../src/server';

// Connect to MongoDB on each request (serverless)
import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

export default app;