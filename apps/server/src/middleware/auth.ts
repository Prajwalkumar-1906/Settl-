import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import { prisma } from '../db';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authenticateJWT(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication token is missing' } });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' } });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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

    if (!user) {
      return res.status(401).json({ error: { code: 'USER_NOT_FOUND', message: 'User associated with token no longer exists' } });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: { code: 'AUTH_ERROR', message: 'Internal authentication error' } });
  }
}
