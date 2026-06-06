import { Router } from "express"
import type { Request, Response } from "express"
import { prisma } from "../lib/prisma.js"
import { mapProfile } from "../lib/mappers.js"
import type { ProductFilter } from "../data/pricingProfiles.js"
import { computeAdjustedPrice } from "../utils/pricing.js"

const router = Router()

const PROFILE_INCLUDE = {
  items: { include: { product: true } },
  customerGroup: true,
} as const

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
 *               customerGroupId: { type: string }
 *               adjustmentType: { type: string, enum: [fixed, percentage, custom_price] }
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
router.get("/", async (_req: Request, res: Response) => {
  const profiles = await prisma.pricingProfile.findMany({
    include: PROFILE_INCLUDE,
    orderBy: { createdAt: "desc" },
  })
  res.json(profiles.map(mapProfile))
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
 *       404:
 *         description: Not found
 */
router.get("/:id", async (req: Request, res: Response) => {
  const profile = await prisma.pricingProfile.findUnique({
    where: { id: req.params.id },
    include: PROFILE_INCLUDE,
  })
  if (!profile) {
    res.status(404).json({ error: "Profile not found" })
    return
  }
  res.json(mapProfile(profile))
})

router.post("/", async (req: Request, res: Response) => {
  const {
    name,
    customerScope = "individual",
    customerId,
    customerGroupId,
    adjustmentType,
    adjustmentDirection,
    adjustmentValue,
    productScope = "explicit",
    productFilter,
    productIds,
  } = req.body as {
    name: string
    customerScope?: "individual" | "group"
    customerId?: string
    customerGroupId?: string
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
    const customer = await prisma.customer.findUnique({ where: { id: customerId } })
    if (!customer) {
      res.status(400).json({ error: "Customer not found" })
      return
    }
  } else {
    if (!customerGroupId || typeof customerGroupId !== "string" || customerGroupId.trim() === "") {
      res.status(400).json({ error: "customerGroupId is required when customerScope is 'group'" })
      return
    }
    const group = await prisma.customerGroup.findUnique({ where: { id: customerGroupId } })
    if (!group) {
      res.status(400).json({ error: "Customer group not found" })
      return
    }
  }

  // Resolve target products
  let targetProducts: { id: string; basePrice: number }[]
  if (productScope === "explicit") {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ error: "productIds must be a non-empty array when productScope is 'explicit'" })
      return
    }
    const rows = await prisma.product.findMany({ where: { id: { in: productIds } } })
    targetProducts = rows.map((p) => ({ id: p.id, basePrice: p.basePrice.toNumber() }))
  } else if (productScope === "product") {
    if (!productFilter?.productId) {
      res.status(400).json({ error: "productFilter.productId is required when productScope is 'product'" })
      return
    }
    const p = await prisma.product.findUnique({ where: { id: productFilter.productId } })
    if (!p) {
      res.status(400).json({ error: "Product not found" })
      return
    }
    targetProducts = [{ id: p.id, basePrice: p.basePrice.toNumber() }]
  } else if (productScope === "subCategory") {
    if (!productFilter?.subCategory) {
      res.status(400).json({ error: "productFilter.subCategory is required when productScope is 'subCategory'" })
      return
    }
    const rows = await prisma.product.findMany({
      where: { subCategory: { equals: productFilter.subCategory, mode: "insensitive" } },
    })
    targetProducts = rows.map((p) => ({ id: p.id, basePrice: p.basePrice.toNumber() }))
  } else if (productScope === "segment") {
    if (!productFilter?.segment) {
      res.status(400).json({ error: "productFilter.segment is required when productScope is 'segment'" })
      return
    }
    const rows = await prisma.product.findMany({
      where: { segment: { equals: productFilter.segment, mode: "insensitive" } },
    })
    targetProducts = rows.map((p) => ({ id: p.id, basePrice: p.basePrice.toNumber() }))
  } else {
    const rows = await prisma.product.findMany()
    targetProducts = rows.map((p) => ({ id: p.id, basePrice: p.basePrice.toNumber() }))
  }

  const itemData = targetProducts.map((p) => ({
    productId: p.id,
    basePrice: p.basePrice,
    adjustedPrice: computeAdjustedPrice(
      p.basePrice,
      adjustmentType as "fixed" | "percentage" | "custom_price",
      adjustmentDirection as "increase" | "decrease",
      adjustmentValue as number,
    ),
  }))

  const baseData = {
    name: name.trim(),
    customerScope,
    adjustmentType: adjustmentType as string,
    adjustmentDirection: adjustmentDirection as string,
    adjustmentValue: adjustmentValue as number,
    productScope,
    items: { create: itemData },
  }

  const customerData = customerScope === "individual"
    ? { customerId: customerId! }
    : { customerGroupId: customerGroupId! }

  const filterData =
    productFilter != null && productScope !== "all" && productScope !== "explicit"
      ? { productFilter: productFilter as object }
      : {}

  const created = await prisma.pricingProfile.create({
    data: { ...baseData, ...customerData, ...filterData },
    include: PROFILE_INCLUDE,
  })

  res.status(201).json(mapProfile(created))
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
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
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
 */
router.put("/:id", async (req: Request, res: Response) => {
  const existing = await prisma.pricingProfile.findUnique({
    where: { id: req.params.id },
    include: PROFILE_INCLUDE,
  })
  if (!existing) {
    res.status(404).json({ error: "Profile not found" })
    return
  }

  const { name } = req.body as { name: unknown }
  if (!name || typeof name !== "string" || name.trim() === "") {
    res.status(400).json({ error: "name is required" })
    return
  }

  const updatedItems = existing.items.map((item) => ({
    productId: item.productId,
    basePrice: item.basePrice.toNumber(),
    adjustedPrice: computeAdjustedPrice(
      item.product.basePrice.toNumber(),
      existing.adjustmentType as "fixed" | "percentage" | "custom_price",
      existing.adjustmentDirection as "increase" | "decrease",
      existing.adjustmentValue.toNumber(),
    ),
  }))

  const updated = await prisma.pricingProfile.update({
    where: { id: req.params.id },
    data: {
      name: name.trim(),
      items: {
        deleteMany: {},
        create: updatedItems,
      },
    },
    include: PROFILE_INCLUDE,
  })

  res.json(mapProfile(updated))
})

router.delete("/:id", async (req: Request, res: Response) => {
  const existing = await prisma.pricingProfile.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json({ error: "Profile not found" })
    return
  }
  await prisma.pricingProfile.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

export default router
