import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { Role } from '../generated/prisma/client.js';

const router = Router();

router.get('/', requireRole('SUPER_ADMIN'), async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(users);
});

router.post('/', requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  const { email, password, role } = req.body as {
    email: string;
    password: string;
    role?: Role;
  };
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: role ?? 'STAFF' },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  res.status(201).json(user);
});

router.put('/:id', requireRole('SUPER_ADMIN'), async (req: Request<{ id: string }>, res: Response) => {
  const { role, password } = req.body as { role?: Role; password?: string };
  const data: { role?: Role; passwordHash?: string } = {};
  if (role) data.role = role;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, email: true, role: true, createdAt: true },
  });
  res.json(user);
});

router.delete('/:id', requireRole('SUPER_ADMIN'), async (req: Request<{ id: string }>, res: Response) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
