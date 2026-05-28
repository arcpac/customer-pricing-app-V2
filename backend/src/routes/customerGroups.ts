import { Router } from "express"
import type { Request, Response } from "express"
import { customerGroups } from "../data/customerGroups.js"

const router = Router()

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
router.get("/", (_req: Request, res: Response) => {
  res.json(customerGroups)
})

export default router
