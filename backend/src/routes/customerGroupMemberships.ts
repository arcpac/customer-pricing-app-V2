import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

/**
 * @openapi
 * /api/customer-group-memberships:
 *   get:
 *     summary: List all customer group memberships
 *     tags: [Customer Group Memberships]
 *     responses:
 *       200:
 *         description: Array of customer group memberships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomerGroupMembership'
 */
router.get('/', async (_req: Request, res: Response) => {
  const memberships = await prisma.customerGroupMembership.findMany();
  res.json(memberships);
});

export default router;
