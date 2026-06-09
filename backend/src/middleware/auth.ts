import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { verifyUser } from '../utils/user.js';

export type { Role };

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = (req.cookies as Record<string, string>)?.token;
  if (!token) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;

    const dbUser = await verifyUser(payload.userId);
    if (!dbUser) {
      res.status(401).json({ error: 'unauthenticated' });
      return;
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: dbUser.role,
    };

    // Sliding window: re-issue cookie with fresh 10m window, role from DB
    const refreshed = jwt.sign(
      { userId: payload.userId, email: payload.email, role: dbUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '10m' },
    );
    res.cookie('token', refreshed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000,
    });

    next();
  } catch {
    res.status(401).json({ error: 'unauthenticated' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    next();
  };
}
