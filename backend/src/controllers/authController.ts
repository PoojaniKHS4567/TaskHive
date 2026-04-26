import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User';

// ==================== JWT TOKEN GENERATION ====================

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId }, 
    process.env.JWT_SECRET!, 
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId }, 
    process.env.REFRESH_SECRET!, 
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// ==================== COOKIE SETTINGS ====================

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
    path: '/'
  });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
};

const clearTokenCookies = (res: Response) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};

// ==================== AUTH CONTROLLERS ====================

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const { email, password, name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({ email, password, name });
    
    return res.status(201).json({ 
      message: 'Registration successful! Please login.',
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userId = user._id.toString();
    const { accessToken, refreshToken } = generateTokens(userId);
    
    user.refreshTokens.push(refreshToken);
    await user.save();

    setTokenCookies(res, accessToken, refreshToken);
    
    return res.json({ 
      message: 'Login successful',
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    const userId = user._id.toString();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setTokenCookies(res, accessToken, newRefreshToken);
    
    return res.json({ message: 'Session refreshed successfully' });
  } catch (error) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  
  if (refreshToken) {
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
    }
  }
  
  clearTokenCookies(res);
  return res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get user data' });
  }
};