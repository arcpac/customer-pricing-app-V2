import { Router } from "express"
import type { Request, Response } from "express"
import { customerGroupMemberships } from "../data/customerGroupMemberships.js"

const router = Router()

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
router.get("/", (_req: Request, res: Response) => {
  res.json(customerGroupMemberships)
})

export default router
