import type {
  Customer as PrismaCustomer,
  CustomerGroup as PrismaCustomerGroup,
  CustomerGroupMembership as PrismaMembership,
  Product as PrismaProduct,
  PricingProfile as PrismaPricingProfile,
  PricingProfileItem as PrismaItem,
} from '../generated/prisma/client.js';
import type {
  PricingProfile,
  PricingProfileItem,
  ProductFilter,
  CustomerScope,
  ProductScope,
} from '../data/pricingProfiles.js';
import type { Customer } from '../data/customers.js';
import type { CustomerGroup } from '../data/customerGroups.js';
import type { CustomerGroupMembership } from '../data/customerGroupMemberships.js';
import type { Product } from '../data/products.js';

type PrismaProfileWithRelations = PrismaPricingProfile & {
  items: (PrismaItem & { product: PrismaProduct })[];
  customerGroup: PrismaCustomerGroup | null;
};

export function mapCustomer(c: PrismaCustomer): Customer {
  return { id: c.id, name: c.name };
}

export function mapCustomerGroup(g: PrismaCustomerGroup): CustomerGroup {
  return { id: g.id, name: g.name };
}

export function mapMembership(m: PrismaMembership): CustomerGroupMembership {
  return { customerId: m.customerId, customerGroupId: m.customerGroupId };
}

export function mapProduct(p: PrismaProduct): Product {
  return {
    id: p.id,
    title: p.title,
    sku: p.sku,
    subCategory: p.subCategory,
    segment: p.segment,
    brand: p.brand,
    basePrice: p.basePrice.toNumber(),
  };
}

export function mapItem(
  i: PrismaItem & { product: PrismaProduct },
): PricingProfileItem {
  return {
    productId: i.productId,
    name: i.product.title,
    basePrice: i.basePrice.toNumber(),
    adjustedPrice: i.adjustedPrice.toNumber(),
  };
}

export function mapProfile(p: PrismaProfileWithRelations): PricingProfile & {
  customerGroupId?: string;
  customerGroupName?: string;
} {
  const base = {
    id: p.id,
    name: p.name,
    customerScope: p.customerScope as CustomerScope,
    adjustmentType: p.adjustmentType as PricingProfile['adjustmentType'],
    adjustmentDirection:
      p.adjustmentDirection as PricingProfile['adjustmentDirection'],
    adjustmentValue: p.adjustmentValue.toNumber(),
    productScope: p.productScope as ProductScope,
    items: p.items.map(mapItem),
    createdAt: p.createdAt.toISOString(),
    effectiveFrom: p.effectiveFrom?.toISOString() ?? null,
    effectiveTo: p.effectiveTo?.toISOString() ?? null,
  };
  const withCustomer = p.customerId != null ? { customerId: p.customerId } : {};
  const withGroup =
    p.customerGroupId != null
      ? {
          customerGroupId: p.customerGroupId,
          ...(p.customerGroup?.name != null
            ? { customerGroupName: p.customerGroup.name }
            : {}),
        }
      : {};
  const withFilter =
    p.productFilter != null
      ? { productFilter: p.productFilter as ProductFilter }
      : {};
  return { ...base, ...withCustomer, ...withGroup, ...withFilter };
}
