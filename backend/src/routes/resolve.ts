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

  const result = resolvePrice(customer, product, profiles, memberships);
  res.json(result);
});

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

router.post('/save', async (req: Request, res: Response) => {
  const { customerId, results: rawResults } = req.body as {
    customerId: unknown;
    results: unknown;
  };

  if (!customerId || typeof customerId !== 'string') {
    res.status(400).json({ error: 'customerId is required' });
    return;
  }
  if (!Array.isArray(rawResults) || rawResults.length === 0) {
    res.status(400).json({ error: 'results must be a non-empty array' });
    return;
  }

  const data = (rawResults as { productId: string; resolvedPrice: number; sourceProfileId?: string; matchScore?: number }[]).map((r) => ({
    customerId,
    productId: r.productId,
    resolvedPrice: r.resolvedPrice,
    sourceProfileId: r.sourceProfileId ?? null,
    matchScore: r.matchScore ?? null,
  }));

  const saved = await prisma.resolvedPriceLog.createMany({ data });
  res.status(201).json({ saved: saved.count });
});

router.get('/history', async (req: Request, res: Response) => {
  const { customerId } = req.query as Record<string, string | undefined>;
  if (!customerId) {
    res.status(400).json({ error: 'customerId is required' });
    return;
  }

  const logs = await prisma.resolvedPriceLog.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  });

  if (logs.length === 0) {
    res.json([]);
    return;
  }

  const profileIds = [...new Set(logs.map((l) => l.sourceProfileId).filter((id): id is string => id != null))];
  const productIds = [...new Set(logs.map((l) => l.productId))];

  const [profiles, products] = await Promise.all([
    prisma.pricingProfile.findMany({
      where: { id: { in: profileIds } },
      select: { id: true, name: true, effectiveTo: true },
    }),
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true },
    }),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const productMap = new Map(products.map((p) => [p.id, p]));
  const now = new Date();

  const enriched = logs.map((log) => {
    const profile = log.sourceProfileId ? profileMap.get(log.sourceProfileId) : null;
    const product = productMap.get(log.productId);
    return {
      id: log.id,
      customerId: log.customerId,
      productId: log.productId,
      productName: product?.title ?? null,
      resolvedPrice: log.resolvedPrice?.toNumber() ?? null,
      sourceProfileId: log.sourceProfileId,
      sourceProfileName: profile?.name ?? null,
      matchScore: log.matchScore,
      profileExpired: profile != null && profile.effectiveTo != null && profile.effectiveTo < now,
      createdAt: log.createdAt.toISOString(),
    };
  });

  res.json(enriched);
});

export default router;
