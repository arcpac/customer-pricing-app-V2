import { Router } from "express"
import type { Request, Response } from "express"
import { prisma } from "../lib/prisma.js"

const router = Router()

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
router.get("/", async (_req: Request, res: Response) => {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } })
  res.json(customers)
})

export default router
