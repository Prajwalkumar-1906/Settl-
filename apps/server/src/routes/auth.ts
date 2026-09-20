import { Router, Response } from 'express';
import { prisma } from '../db';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
  verifyResetToken,
} from '../utils/auth';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

export const authRouter = Router();

// Helper to set HTTP-only refresh token cookie
function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// 1. User Registration
authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, name, avatarUrl, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email, password, and name are required.' } });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'User with this email or phone already exists.' } });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        phone,
        isEmailVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        phone: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    const accessToken = generateAccessToken({ userId: newUser.id, email: newUser.email });
    const refreshToken = generateRefreshToken({ userId: newUser.id, email: newUser.email });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      user: newUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to register user' } });
  }
});

// 2. User Login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email and password are required.' } });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to login' } });
  }
});

// 3. Refresh Access Token
authRouter.post('/refresh', async (req, res) => {
  try {
    const tokenFromCookie = req.cookies?.refreshToken;
    const tokenFromBody = req.body?.refreshToken;
    const refreshToken = tokenFromCookie || tokenFromBody;

    if (!refreshToken) {
      return res.status(401).json({ error: { code: 'MISSING_REFRESH_TOKEN', message: 'Refresh token is missing' } });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token expired or invalid' } });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'User no longer exists' } });
    }

    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to refresh token' } });
  }
});

// 4. Logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// 5. Get Current User Profile (Authenticated)
authRouter.get('/me', authenticateJWT, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// 6. Google OAuth Login / Register Endpoint
authRouter.post('/google', async (req, res) => {
  try {
    const { email, name, avatarUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Google email is required' } });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const dummyPasswordHash = await hashPassword(`google_${Date.now()}_${Math.random()}`);
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
          passwordHash: dummyPasswordHash,
          isEmailVerified: true,
        },
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    setRefreshTokenCookie(res, refreshToken);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    res.json({
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Google authentication failed' } });
  }
});

// 7. Forgot Password Flow
authRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Email is required' } });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const resetToken = generateResetToken({ userId: user.id, email: user.email });
    const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // TODO: Send transactional email using Resend (https://resend.com)
    // await resend.emails.send({
    //   from: 'Settl <auth@settl.app>',
    //   to: user.email,
    //   subject: 'Reset your Settl password',
    //   html: `<p>Click <a href="${resetUrl}">here</a> to reset your Settl password. Link expires in 1 hour.</p>`
    // });
    console.log(`[TRANSACTIONAL EMAIL STUB - TODO Resend API] Password reset link for ${user.email}: ${resetUrl}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      resetUrlDemo: resetUrl, // Included for seamless dev testing
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to process forgot password request' } });
  }
});

// 8. Reset Password Execution
authRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Token and new password are required.' } });
    }

    const payload = verifyResetToken(token);
    if (!payload) {
      return res.status(400).json({ error: { code: 'INVALID_TOKEN', message: 'Password reset token is invalid or expired.' } });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: payload.userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({
      success: true,
      message: 'Your password has been successfully reset. You may now log in.',
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to reset password' } });
  }
});
