import { PrismaClient, Role } from '../src/generated/prisma/client.js';
import { computeAdjustedPrice } from '../src/utils/pricing.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear in reverse dependency order
  await prisma.profileAuditLog.deleteMany();
  await prisma.resolvedPriceLog.deleteMany();
  await prisma.pricingProfileItem.deleteMany();
  await prisma.pricingProfile.deleteMany();
  await prisma.customerGroupMembership.deleteMany();
  await prisma.customerGroup.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Admin user
  await prisma.user.create({
    data: {
      email: 'admin@email.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: Role.SUPER_ADMIN
    },
  });
  await prisma.user.create({
    data: {
      email: 'useradmin@email.com',
      passwordHash: await bcrypt.hash('useradmin123', 10),
      role: Role.ADMIN,
    },
  });

  // Customers
  const [, , , , , bondCellars] = await Promise.all([
    prisma.customer.create({ data: { name: 'The Cellar Door' } }),
    prisma.customer.create({ data: { name: 'Harbour View Restaurant' } }),
    prisma.customer.create({ data: { name: 'Blue Mountains Bistro' } }),
    prisma.customer.create({ data: { name: 'Fitzroy Food & Wine' } }),
    prisma.customer.create({ data: { name: 'Manly Beach Bar' } }),
    prisma.customer.create({ data: { name: 'Bondi Cellars' } }),
  ]);

  // Groups
  const [indieRetailers, vip] = await Promise.all([
    prisma.customerGroup.create({ data: { name: 'Independent Retailers' } }),
    prisma.customerGroup.create({ data: { name: 'VIP' } }),
  ]);

  // Memberships — Bondi Cellars is in both groups
  await prisma.customerGroupMembership.createMany({
    data: [
      { customerId: bondCellars.id, customerGroupId: indieRetailers.id },
      { customerId: bondCellars.id, customerGroupId: vip.id },
    ],
  });

  // Products
  const [pinot, brut, riesling, tussock, lacourte] = await Promise.all([
    prisma.product.create({
      data: {
        title: 'High Garden Pinot Noir 2021',
        sku: 'HGVPIN216',
        subCategory: 'Wine',
        segment: 'Red',
        brand: 'High Garden',
        basePrice: 279.06,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Koyama Methode Brut Nature NV',
        sku: 'KOYBRUNV6',
        subCategory: 'Wine',
        segment: 'Sparkling',
        brand: 'Koyama Wines',
        basePrice: 120.0,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Koyama Riesling 2018',
        sku: 'KOYNR1837',
        subCategory: 'Wine',
        segment: 'Port/Dessert',
        brand: 'Koyama Wines',
        basePrice: 215.04,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Koyama Tussock Riesling 2019',
        sku: 'KOYRIE19',
        subCategory: 'Wine',
        segment: 'White',
        brand: 'Koyama Wines',
        basePrice: 215.04,
      },
    }),
    prisma.product.create({
      data: {
        title: 'Lacourte-Godbillon Brut Cru NV',
        sku: 'LACBNATNV6',
        subCategory: 'Wine',
        segment: 'Sparkling',
        brand: 'Lacourte-Godbillon',
        basePrice: 409.32,
      },
    }),
  ]);

  const allProducts = [pinot, brut, riesling, tussock, lacourte];

  // Profile A — 10% off all Wine (subCategory) for Independent Retailers
  await prisma.pricingProfile.create({
    data: {
      name: 'Profile A — Wine 10% off (Independent Retailers)',
      customerScope: 'group',
      customerGroupId: indieRetailers.id,
      adjustmentType: 'percentage',
      adjustmentDirection: 'decrease',
      adjustmentValue: 10,
      productScope: 'subCategory',
      productFilter: { subCategory: 'Wine' },
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      items: {
        create: allProducts.map((p) => ({
          productId: p.id,
          basePrice: p.basePrice.toNumber(),
          adjustedPrice: computeAdjustedPrice(
            p.basePrice.toNumber(),
            'percentage',
            'decrease',
            10,
          ),
        })),
      },
    },
  });

  // Profile B — $15 off Sparkling segment for VIP
  const sparklingProducts = [brut, lacourte];
  await prisma.pricingProfile.create({
    data: {
      name: 'Profile B — Sparkling $15 off (VIP)',
      customerScope: 'group',
      customerGroupId: vip.id,
      adjustmentType: 'fixed',
      adjustmentDirection: 'decrease',
      adjustmentValue: 15,
      productScope: 'segment',
      productFilter: { segment: 'Sparkling' },
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      items: {
        create: sparklingProducts.map((p) => ({
          productId: p.id,
          basePrice: p.basePrice.toNumber(),
          adjustedPrice: computeAdjustedPrice(
            p.basePrice.toNumber(),
            'fixed',
            'decrease',
            15,
          ),
        })),
      },
    },
  });

  // Profile C — $95 custom price on Pinot Noir for Bondi Cellars (individual, highest specificity)
  await prisma.pricingProfile.create({
    data: {
      name: 'Profile C — Pinot Noir $95 (Bondi Cellars)',
      customerScope: 'individual',
      customerId: bondCellars.id,
      adjustmentType: 'custom_price',
      adjustmentDirection: 'decrease',
      adjustmentValue: 95,
      productScope: 'product',
      productFilter: { productId: pinot.id },
      createdAt: new Date('2026-01-03T00:00:00.000Z'),
      items: {
        create: [
          {
            productId: pinot.id,
            basePrice: pinot.basePrice.toNumber(),
            adjustedPrice: computeAdjustedPrice(
              pinot.basePrice.toNumber(),
              'custom_price',
              'decrease',
              95,
            ),
          },
        ],
      },
    },
  });

  console.log(
    'Seeded: 2 users, 6 customers, 2 groups, 2 memberships, 5 products, 3 profiles',
  );
}

main()
  .catch(console.error)
  .finally(() => {
    void prisma.$disconnect();
  });
