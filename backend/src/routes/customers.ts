import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * @openapi
 * /api/customers:
 *   get:
 *     summary: List all customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Array of customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 */
router.get('/', async (_req: Request, res: Response) => {
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(customers);
});

router.post('/', requireRole('SUPER_ADMIN'), async (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  const customer = await prisma.customer.create({ data: { name } });
  res.status(201).json(customer);
});

router.put('/:id', requireRole('SUPER_ADMIN'), async (req: Request<{ id: string }>, res: Response) => {
  const { name } = req.body as { name: string };
  const customer = await prisma.customer.update({ where: { id: req.params.id }, data: { name } });
  res.json(customer);
});

router.delete('/:id', requireRole('SUPER_ADMIN'), async (req: Request<{ id: string }>, res: Response) => {
  await prisma.customer.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
