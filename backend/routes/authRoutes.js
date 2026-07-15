import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../prismaClient.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'coffer-access-secret-key-12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'coffer-refresh-secret-key-67890';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Helper to generate access and refresh tokens + save refresh token session
const generateTokensAndCookie = async (user, res) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, displayName: user.displayName, currency: user.currency },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { id: user.id, tokenVersion: crypto.randomBytes(8).toString('hex') },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Save session in DB
  await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt,
    },
  });

  // Set httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
};

// Seed default categories for new user
const seedDefaultCategories = async (userId) => {
  const defaultCategories = [
    { name: 'Income', color: '#2E8B57', icon: 'DollarSign', isDefault: true },
    { name: 'Food & Dining', color: '#1F5F4D', icon: 'Utensils', isDefault: true },
    { name: 'Rent & Housing', color: '#3FA37F', icon: 'Home', isDefault: true },
    { name: 'Transport', color: '#5B6158', icon: 'Car', isDefault: true },
    { name: 'Utilities', color: '#B8863B', icon: 'Zap', isDefault: true },
    { name: 'Entertainment', color: '#D3A55C', icon: 'Film', isDefault: true },
    { name: 'Shopping', color: '#C08A2E', icon: 'ShoppingBag', isDefault: true },
    { name: 'Health', color: '#4CC38A', icon: 'Activity', isDefault: true },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.create({
      data: {
        userId,
        ...cat,
      },
    });
  }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, currency } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        displayName: displayName.trim(),
        currency: currency || '$ USD',
      },
    });

    // Seed default categories
    await seedDefaultCategories(newUser.id);

    // Seed initial default account
    await prisma.account.create({
      data: {
        userId: newUser.id,
        name: 'Checking Account',
        type: 'CHECKING',
        initialBalance: 0.0,
        currency: newUser.currency,
      },
    });

    const { accessToken } = await generateTokensAndCookie(newUser, res);

    return res.status(201).json({
      message: 'Registration successful',
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        currency: newUser.currency,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { accessToken } = await generateTokensAndCookie(user, res);

    return res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided.' });
    }

    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || new Date() > session.expiresAt) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return res.status(401).json({ error: 'Refresh token invalid or expired.' });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      await prisma.session.delete({ where: { id: session.id } });
      return res.status(401).json({ error: 'Refresh token verification failed.' });
    }

    const user = session.user;
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, displayName: user.displayName, currency: user.currency },
      ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        currency: user.currency,
      },
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);
    return res.status(500).json({ error: 'Internal server error during token refresh.' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      await prisma.session.deleteMany({
        where: { refreshToken },
      });
    }

    res.clearCookie('refreshToken');
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ error: 'Internal server error during logout.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success even if email not found to prevent user enumeration
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    console.log(`\n======================================================`);
    console.log(`[COFFER AUTH EMAIL LINK] Password Reset for ${user.email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`======================================================\n`);

    return res.status(200).json({
      message: 'Password reset link generated and dispatched.',
      // In dev environment, return token for testing convenience
      ...(process.env.NODE_ENV !== 'production' && { devResetUrl: resetUrl, resetToken }),
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ error: 'Internal server error during password reset request.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Invalidate old sessions for security
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return res.status(200).json({ message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ error: 'Internal server error during password reset.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        currency: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching user profile.' });
  }
});

export default router;
