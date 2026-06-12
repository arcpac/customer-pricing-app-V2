import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /api/customer-groups:
 *   get:
 *     summary: List all customer groups
 *     tags: [Customer Groups]
 *     responses:
 *       200:
 *         description: Array of customer groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   name: { type: string }
 */
router.get('/', async (_req: Request, res: Response) => {
  const groups = await prisma.customerGroup.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(groups);
});

router.post('/', requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  const group = await prisma.customerGroup.create({ data: { name } });
  res.status(201).json(group);
});

router.put('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request<{ id: string }>, res: Response) => {
  const { name } = req.body as { name: string };
  const group = await prisma.customerGroup.update({ where: { id: req.params.id }, data: { name } });
  res.json(group);
});

router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), async (req: Request<{ id: string }>, res: Response) => {
  await prisma.customerGroup.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
