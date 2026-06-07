import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

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

export default router;
