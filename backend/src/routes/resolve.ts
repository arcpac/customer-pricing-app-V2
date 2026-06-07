import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import {
  mapCustomer,
  mapProduct,
  mapProfile,
  mapMembership,
} from '../lib/mappers.js';
import { resolvePrice } from '../utils/resolver.js';

const router = Router();

const PROFILE_INCLUDE = {
  items: { include: { product: true } },
  customerGroup: true,
} as const;

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
 *       - in: query
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Resolved price with source profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResolveResult'
 *       400:
 *         description: Missing parameters
 *       404:
 *         description: Customer or product not found
 */
router.post('/', async (req: Request, res: Response) => {
  const { customerId, productId } = req.body as Record<string, string>;

  if (!customerId) {
    res.status(400).json({ error: 'customerId is required' });
    return;
  }
  if (!productId) {
    res.status(400).json({ error: 'productId is required' });
    return;
  }

  const [customerRow, productRow, profileRows, membershipRows] =
    await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.pricingProfile.findMany({ include: PROFILE_INCLUDE }),
      prisma.customerGroupMembership.findMany(),
    ]);

  if (!customerRow) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }
  if (!productRow) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const customer = mapCustomer(customerRow);
  const product = mapProduct(productRow);
  const profiles = profileRows.map(mapProfile);
  const memberships = membershipRows.map(mapMembership);

  res.json(resolvePrice(customer, product, profiles, memberships));
});

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
router.post('/batch', async (req: Request, res: Response) => {
  const { customerId, productIds: rawProductIds } = req.body as {
    customerId: string;
    productIds: unknown;
  };

  if (!customerId) {
    res.status(400).json({ error: 'customerId is required' });
    return;
  }
  if (!Array.isArray(rawProductIds) || rawProductIds.length === 0) {
    res.status(400).json({ error: 'productIds must be a non-empty array' });
    return;
  }
  const productIds = rawProductIds as string[];

  const [customerRow, productRows, profileRows, membershipRows] =
    await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.product.findMany({ where: { id: { in: productIds } } }),
      prisma.pricingProfile.findMany({ include: PROFILE_INCLUDE }),
      prisma.customerGroupMembership.findMany(),
    ]);

  if (!customerRow) {
    res.status(404).json({ error: 'Customer not found' });
    return;
  }

  const customer = mapCustomer(customerRow);
  const profiles = profileRows.map(mapProfile);
  const memberships = membershipRows.map(mapMembership);
  const productMap = new Map(productRows.map((p) => [p.id, p]));

  const results = productIds.map((productId) => {
    const productRow = productMap.get(productId);
    if (!productRow) {
      return {
        productId,
        title: null,
        basePrice: null,
        resolvedPrice: null,
        message: 'Product not found',
      };
    }
    const product = mapProduct(productRow);
    const resolved = resolvePrice(customer, product, profiles, memberships);
    const base = {
      productId,
      title: product.title,
      sku: product.sku,
      subCategory: product.subCategory,
      segment: product.segment,
      brand: product.brand,
      basePrice: product.basePrice,
    };
    if (resolved.resolvedPrice === null) {
      return { ...base, ...resolved };
    }
    const sourceProfile = profiles.find(
      (p) => p.id === resolved.sourceProfileId,
    );
    return {
      ...base,
      ...resolved,
      adjustmentType: sourceProfile?.adjustmentType,
      adjustmentDirection: sourceProfile?.adjustmentDirection,
      adjustmentValue: sourceProfile?.adjustmentValue,
    };
  });

  res.json(results);
});

export default router;
