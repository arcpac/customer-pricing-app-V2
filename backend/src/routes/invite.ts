import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { transporter } from '../lib/mailer.js';
import { getUserByEmail } from '../utils/user.js';

const router = Router();

const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

// POST /api/invite — SUPER_ADMIN invites a new user by email
router.post(
  '/',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  async (req: Request, res: Response) => {
    const { email } = req.body as { email: string };

    let user = await getUserByEmail(email);
    if (!user) {
      user = await prisma.user.create({
        data: { email, passwordHash: '', role: 'STAFF' },
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    await prisma.inviteToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + TWO_DAYS_MS),
      },
    });

    const link = `${process.env.FRONTEND_URL}/set-password?token=${rawToken}&type=invite`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to: email,
      subject: 'You have been invited',
      text: `You have been invited. Set your password here: ${link}\n\nThis link expires in 48 hours.`,
      html: `<p>You have been invited. <a href="${link}">Set your password</a></p><p>This link expires in 48 hours.</p>`,
    });

    res.json({ ok: true });
  },
);

// POST /api/invite/accept — set password from invite token
router.post('/accept', async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await prisma.inviteToken.findUnique({ where: { tokenHash } });

  if (!record || record.used || record.expiresAt < new Date()) {
    res.status(400).json({ error: 'invalid or expired token' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });
  await prisma.inviteToken.update({
    where: { id: record.id },
    data: { used: true },
  });

  res.json({ ok: true });
});

export default router;
