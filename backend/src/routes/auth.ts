import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/client.js';
import { getUserByEmail } from '../utils/user.js';

const router = Router();
const prisma = new PrismaClient();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 10 * 60 * 1000,
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password required' });
    return;
  }

  const user = await getUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    {
      expiresIn: '10m',
    },
  );
  res.cookie('token', token, COOKIE_OPTS);
  res.json({ userId: user.id, email: user.email, role: user.role });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = (req.cookies as Record<string, string>)?.token;
  if (!token) {
    res.status(401).json({ error: 'unauthenticated' });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };
    res.json({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
  } catch {
    res.status(401).json({ error: 'unauthenticated' });
  }
});

export default router;
