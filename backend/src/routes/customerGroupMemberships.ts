import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const memberships = await prisma.customerGroupMembership.findMany();
  res.json(memberships);
});

export default router;
