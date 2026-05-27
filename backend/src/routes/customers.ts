import { Router } from "express"
import type { Request, Response } from "express"
import { customers } from "../data/customers.js"

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
router.get("/", (_req: Request, res: Response) => {
  res.json(customers)
})

export default router
