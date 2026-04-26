import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get token from HTTP-only cookie
  const token = req.cookies?.accessToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Get user from database (exclude sensitive data)
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please login again.' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        error: 'Session expired. Please refresh your session.',
        code: 'TOKEN_EXPIRED' 
      });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token. Please login again.' });
    }
    
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};

// Optional: Middleware to check if user owns resource
export const checkOwnership = (resourceUserId: string, currentUserId: string) => {
  if (resourceUserId !== currentUserId) {
    throw new Error('Unauthorized access to resource');
  }
};