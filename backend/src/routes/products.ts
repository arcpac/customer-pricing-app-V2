import { Router } from "express"
import type { Request, Response } from "express"
import { prisma } from "../lib/prisma.js"
import { mapProduct } from "../lib/mappers.js"

const router = Router()

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filter by title or SKU (case-insensitive)
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *           enum: [HGVPIN216, KOYBRUNV6, KOYNR1837, KOYRIE19, LACBNATNV6]
 *         description: Filter by SKU
 *       - in: query
 *         name: subCategory
 *         schema:
 *           type: string
 *           enum: [Wine]
 *         description: Exact sub-category match
 *       - in: query
 *         name: segment
 *         schema:
 *           type: string
 *           enum: [Red, Sparkling, Port/Dessert, White]
 *         description: Exact segment match
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *           enum: [High Garden, Koyama Wines, Lacourte-Godbillon]
 *         description: Exact brand match
 *     responses:
 *       200:
 *         description: Array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get("/", async (req: Request, res: Response) => {
  const { search, sku, subCategory, segment, brand } = req.query as Record<string, string | undefined>

  type Where = NonNullable<Parameters<typeof prisma.product.findMany>[0]>["where"]
  const where: Where = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ]
  }
  if (sku) where.sku = { contains: sku, mode: "insensitive" }
  if (subCategory) where.subCategory = { equals: subCategory, mode: "insensitive" }
  if (segment) where.segment = { equals: segment, mode: "insensitive" }
  if (brand) where.brand = { equals: brand, mode: "insensitive" }

  const products = await prisma.product.findMany({ where })
  res.json(products.map(mapProduct))
})

export default router
