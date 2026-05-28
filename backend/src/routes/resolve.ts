import { Router } from "express"
import type { Request, Response } from "express"
import { pricingProfiles } from "../data/pricingProfiles.js"
import { products } from "../data/products.js"
import { customers } from "../data/customers.js"
import { resolvePrice } from "../utils/resolver.js"

const router = Router()

/**
 * @openapi
 * /api/resolve:
 *   get:
 *     summary: Resolve price for a customer/product pair
 *     tags: [Resolve]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema: { type: string }
 *         example: cust_001
 *       - in: query
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *         example: prod_001
 *     responses:
 *       200:
 *         description: Resolved price with source profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResolveResult'
 *       400:
 *         description: Missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Customer or product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", (req: Request, res: Response) => {
  const { customerId, productId } = req.query as Record<string, string>

  if (!customerId) {
    res.status(400).json({ error: "customerId is required" })
    return
  }
  if (!productId) {
    res.status(400).json({ error: "productId is required" })
    return
  }

  const customer = customers.find((c) => c.id === customerId)
  if (!customer) {
    res.status(404).json({ error: "Customer not found" })
    return
  }

  const product = products.find((p) => p.id === productId)
  if (!product) {
    res.status(404).json({ error: "Product not found" })
    return
  }

  res.json(resolvePrice(customer, product, pricingProfiles))
})

/**
 * @openapi
 * /api/resolve/batch:
 *   get:
 *     summary: Resolve prices for multiple products for a customer
 *     tags: [Resolve]
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: productIds
 *         required: true
 *         schema: { type: string }
 *         description: Comma-separated product IDs
 *     responses:
 *       200:
 *         description: Array of resolved prices
 *       400:
 *         description: Missing parameters
 *       404:
 *         description: Customer not found
 */
router.get("/batch", (req: Request, res: Response) => {
  const { customerId, productIds: productIdsParam } = req.query as Record<string, string>

  if (!customerId) {
    res.status(400).json({ error: "customerId is required" })
    return
  }
  if (!productIdsParam) {
    res.status(400).json({ error: "productIds is required" })
    return
  }

  const customer = customers.find((c) => c.id === customerId)
  if (!customer) {
    res.status(404).json({ error: "Customer not found" })
    return
  }

  const productIds = productIdsParam.split(",").map((id) => id.trim()).filter(Boolean)
  if (productIds.length === 0) {
    res.status(400).json({ error: "productIds must be a non-empty comma-separated list" })
    return
  }

  const results = productIds.map((productId) => {
    const product = products.find((p) => p.id === productId)
    if (!product) {
      return { productId, title: null, basePrice: null, resolvedPrice: null, message: "Product not found" }
    }
    const resolved = resolvePrice(customer, product, pricingProfiles)
    if (resolved.resolvedPrice === null) {
      return { productId, title: product.title, basePrice: product.basePrice, ...resolved }
    }
    const profile = pricingProfiles.find((p) => p.id === resolved.sourceProfileId)
    return {
      productId,
      title: product.title,
      basePrice: product.basePrice,
      ...resolved,
      adjustmentType: profile?.adjustmentType,
      adjustmentDirection: profile?.adjustmentDirection,
      adjustmentValue: profile?.adjustmentValue,
    }
  })

  res.json(results)
})

export default router
