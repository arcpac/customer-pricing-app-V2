import { Router } from "express"
import type { Request, Response } from "express"
import { pricingProfiles } from "../data/pricingProfiles.js"
import type { PricingProfile, ProductFilter } from "../data/pricingProfiles.js"
import { products } from "../data/products.js"
import { customers } from "../data/customers.js"
import { customerGroups } from "../data/customerGroups.js"
import { computeAdjustedPrice } from "../utils/pricing.js"
import { randomUUID } from "crypto"

const router = Router()

/**
 * @openapi
 * /api/pricing-profiles:
 *   get:
 *     summary: List all pricing profiles
 *     tags: [Pricing Profiles]
 *     responses:
 *       200:
 *         description: Array of pricing profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PricingProfile'
 *   post:
 *     summary: Create a pricing profile
 *     tags: [Pricing Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, adjustmentType, adjustmentDirection, adjustmentValue]
 *             properties:
 *               name: { type: string }
 *               customerScope: { type: string, enum: [individual, group], default: individual }
 *               customerId: { type: string }
 *               customerGroup: { type: string }
 *               adjustmentType: { type: string, enum: [fixed, percentage] }
 *               adjustmentDirection: { type: string, enum: [increase, decrease] }
 *               adjustmentValue: { type: number, minimum: 0 }
 *               productScope: { type: string, enum: [explicit, product, subCategory, segment, all], default: explicit }
 *               productFilter:
 *                 type: object
 *                 properties:
 *                   productId: { type: string }
 *                   subCategory: { type: string }
 *                   segment: { type: string }
 *               productIds: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Created profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingProfile'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", (_req: Request, res: Response) => {
  res.json(pricingProfiles)
})

/**
 * @openapi
 * /api/pricing-profiles/{id}:
 *   get:
 *     summary: Get pricing profile by ID
 *     tags: [Pricing Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Pricing profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingProfile'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", (req: Request, res: Response) => {
  const profile = pricingProfiles.find((p) => p.id === req.params.id)
  if (!profile) {
    res.status(404).json({ error: "Profile not found" })
    return
  }
  res.json(profile)
})

router.post("/", (req: Request, res: Response) => {
  const {
    name,
    customerScope = "individual",
    customerId,
    customerGroup,
    adjustmentType,
    adjustmentDirection,
    adjustmentValue,
    productScope = "explicit",
    productFilter,
    productIds,
  } = req.body as {
    name: unknown
    customerScope?: "individual" | "group"
    customerId?: string
    customerGroup?: string
    adjustmentType: unknown
    adjustmentDirection: unknown
    adjustmentValue: unknown
    productScope?: "explicit" | "product" | "subCategory" | "segment" | "all"
    productFilter?: ProductFilter
    productIds?: string[]
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "name is required" })
    return
  }
  if (!["individual", "group"].includes(customerScope)) {
    res.status(400).json({ error: "customerScope must be 'individual' or 'group'" })
    return
  }
  if (!["fixed", "percentage", "custom_price"].includes(adjustmentType as string)) {
    res.status(400).json({ error: "adjustmentType must be 'fixed', 'percentage', or 'custom_price'" })
    return
  }
  if (!["increase", "decrease"].includes(adjustmentDirection as string)) {
    res.status(400).json({ error: "adjustmentDirection must be 'increase' or 'decrease'" })
    return
  }
  if (typeof adjustmentValue !== "number" || adjustmentValue < 0) {
    res.status(400).json({ error: "adjustmentValue must be a non-negative number" })
    return
  }
  if (!["explicit", "product", "subCategory", "segment", "all"].includes(productScope)) {
    res.status(400).json({ error: "productScope must be 'explicit', 'product', 'subCategory', 'segment', or 'all'" })
    return
  }

  // Validate customer scope
  if (customerScope === "individual") {
    if (!customerId) {
      res.status(400).json({ error: "customerId is required when customerScope is 'individual'" })
      return
    }
    if (!customers.some((c) => c.id === customerId)) {
      res.status(400).json({ error: "Customer not found" })
      return
    }
  } else {
    if (!customerGroup || typeof customerGroup !== "string" || customerGroup.trim() === "") {
      res.status(400).json({ error: "customerGroup is required when customerScope is 'group'" })
      return
    }
    if (!customerGroups.some((g) => g.name === customerGroup)) {
      res.status(400).json({ error: "Customer group not found" })
      return
    }
  }

  // Resolve which products this profile covers (snapshot at creation time)
  let targetProductIds: string[]
  if (productScope === "explicit") {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ error: "productIds must be a non-empty array when productScope is 'explicit'" })
      return
    }
    targetProductIds = productIds
  } else if (productScope === "product") {
    if (!productFilter?.productId) {
      res.status(400).json({ error: "productFilter.productId is required when productScope is 'product'" })
      return
    }
    targetProductIds = [productFilter.productId]
  } else if (productScope === "subCategory") {
    if (!productFilter?.subCategory) {
      res.status(400).json({ error: "productFilter.subCategory is required when productScope is 'subCategory'" })
      return
    }
    targetProductIds = products
      .filter((p) => p.subCategory.toLowerCase() === productFilter.subCategory!.toLowerCase())
      .map((p) => p.id)
  } else if (productScope === "segment") {
    if (!productFilter?.segment) {
      res.status(400).json({ error: "productFilter.segment is required when productScope is 'segment'" })
      return
    }
    targetProductIds = products
      .filter((p) => p.segment.toLowerCase() === productFilter.segment!.toLowerCase())
      .map((p) => p.id)
  } else {
    // "all"
    targetProductIds = products.map((p) => p.id)
  }

  const items = targetProductIds
    .map((productId) => {
      const product = products.find((p) => p.id === productId)
      if (!product) return null
      return {
        productId,
        basePrice: product.basePrice,
        adjustedPrice: computeAdjustedPrice(
          product.basePrice,
          adjustmentType as "fixed" | "percentage" | "custom_price",
          adjustmentDirection as "increase" | "decrease",
          adjustmentValue as number,
        ),
      }
    })
    .filter(Boolean)

  if (items.length === 0) {
    res.status(400).json({ error: "No valid products found" })
    return
  }

  const base = {
    id: randomUUID(),
    name: (name as string).trim(),
    customerScope,
    adjustmentType: adjustmentType as "fixed" | "percentage",
    adjustmentDirection: adjustmentDirection as "increase" | "decrease",
    adjustmentValue: adjustmentValue as number,
    productScope,
    items: items as PricingProfile["items"],
    createdAt: new Date().toISOString(),
  }
  // exactOptionalPropertyTypes requires we only include optional fields when they are defined
  const resolvedFilter = productFilter as ProductFilter
  const hasFilter = productScope !== "all" && productScope !== "explicit"
  const profile: PricingProfile =
    customerScope === "individual"
      ? hasFilter
        ? { ...base, customerId: customerId!, productFilter: resolvedFilter }
        : { ...base, customerId: customerId! }
      : hasFilter
        ? { ...base, customerGroup: customerGroup!, productFilter: resolvedFilter }
        : { ...base, customerGroup: customerGroup! }

  pricingProfiles.push(profile)
  res.status(201).json(profile)
})

/**
 * @openapi
 * /api/pricing-profiles/{id}:
 *   put:
 *     summary: Update pricing profile name (recomputes items)
 *     tags: [Pricing Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingProfile'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete a pricing profile
 *     tags: [Pricing Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", (req: Request, res: Response) => {
  const idx = pricingProfiles.findIndex((p) => p.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ error: "Profile not found" })
    return
  }

  const { name } = req.body as { name: unknown }
  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "name is required" })
    return
  }

  const existing = pricingProfiles[idx] as PricingProfile
  const updatedItems = existing.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) return item
    return {
      ...item,
      basePrice: product.basePrice,
      adjustedPrice: computeAdjustedPrice(
        product.basePrice,
        existing.adjustmentType as "fixed" | "percentage" | "custom_price",
        existing.adjustmentDirection,
        existing.adjustmentValue,
      ),
    }
  })

  const updated: PricingProfile =
    existing.customerScope === "individual"
      ? existing.productFilter
        ? { ...existing, name: name.trim(), items: updatedItems, customerId: existing.customerId!, productFilter: existing.productFilter }
        : { ...existing, name: name.trim(), items: updatedItems, customerId: existing.customerId! }
      : existing.productFilter
        ? { ...existing, name: name.trim(), items: updatedItems, customerGroup: existing.customerGroup!, productFilter: existing.productFilter }
        : { ...existing, name: name.trim(), items: updatedItems, customerGroup: existing.customerGroup! }
  pricingProfiles[idx] = updated
  res.json(updated)
})

router.delete("/:id", (req: Request, res: Response) => {
  const idx = pricingProfiles.findIndex((p) => p.id === req.params.id)
  if (idx === -1) {
    res.status(404).json({ error: "Profile not found" })
    return
  }
  pricingProfiles.splice(idx, 1)
  res.status(204).end()
})

export default router
