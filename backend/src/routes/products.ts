import { Router } from "express"
import type { Request, Response } from "express"
import { products } from "../data/products.js"

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
router.get("/", (req: Request, res: Response) => {
  const { search, sku, subCategory, segment, brand } = req.query as Record<string, string>

  let results = [...products]

  if (search) {
    const q = search.toLowerCase()
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    )
  }

  if (sku) {
    results = results.filter((p) =>
      p.sku.toLowerCase().includes(sku.toLowerCase())
    )
  }

  if (subCategory) {
    results = results.filter(
      (p) => p.subCategory.toLowerCase() === subCategory.toLowerCase()
    )
  }

  if (segment) {
    results = results.filter(
      (p) => p.segment.toLowerCase() === segment.toLowerCase()
    )
  }

  if (brand) {
    results = results.filter(
      (p) => p.brand.toLowerCase() === brand.toLowerCase()
    )
  }

  res.json(results)
})

export default router
