import { describe, it, expect } from 'vitest';
import { resolvePrice } from '../utils/resolver.js';
import type { Customer } from '../data/customers.js';
import type { Product } from '../data/products.js';
import type { PricingProfile, PricingProfileItem } from '../data/pricingProfiles.js';

function item(adjustedPrice: number): PricingProfileItem {
  return { productId: 'p1', name: 'Widget', basePrice: 100, adjustedPrice };
}
import type { CustomerGroupMembership } from '../data/customerGroupMemberships.js';

const customer: Customer = { id: 'c1', name: 'Acme' };

const product: Product = {
  id: 'p1',
  title: 'Widget',
  sku: 'WGT-001',
  subCategory: 'gadgets',
  segment: 'consumer',
  brand: 'BrandX',
  basePrice: 100,
};

const defaultItem = { productId: 'p1', name: 'Widget', basePrice: 100, adjustedPrice: 90 };

function makeProfile(overrides: Partial<PricingProfile>): PricingProfile {
  return {
    id: 'prof1',
    name: 'Default',
    customerScope: 'individual',
    customerId: 'c1',
    productScope: 'all',
    items: [defaultItem],
    createdAt: '2024-01-01T00:00:00Z',
    effectiveFrom: null,
    effectiveTo: null,
    adjustmentType: 'fixed',
    adjustmentDirection: 'decrease',
    adjustmentValue: 10,
    ...overrides,
  };
}

describe('resolvePrice', () => {
  it('returns no match when profiles array is empty', () => {
    const result = resolvePrice(customer, product, [], []);
    expect(result.resolvedPrice).toBeNull();
  });

  it('returns no match when no profile covers the customer', () => {
    const profile = makeProfile({ customerId: 'other' });
    const result = resolvePrice(customer, product, [profile], []);
    expect(result.resolvedPrice).toBeNull();
  });

  it('returns no match when profile is outside effective date range', () => {
    const profile = makeProfile({ effectiveTo: '2000-01-01T00:00:00Z' });
    const result = resolvePrice(customer, product, [profile], []);
    expect(result.resolvedPrice).toBeNull();
  });

  it('returns no match when effectiveFrom is in the future', () => {
    const profile = makeProfile({ effectiveFrom: '2099-01-01T00:00:00Z' });
    const result = resolvePrice(customer, product, [profile], []);
    expect(result.resolvedPrice).toBeNull();
  });

  it('matches individual customer profile', () => {
    const profile = makeProfile({});
    const result = resolvePrice(customer, product, [profile], []);
    expect(result.resolvedPrice).toBe(90);
  });

  it('matches group customer profile via membership', () => {
    const membership: CustomerGroupMembership = {
      customerId: 'c1',
      customerGroupId: 'g1',
    };
    const profile = makeProfile({
      customerScope: 'group',
            customerGroupId: 'g1',
    });
    const result = resolvePrice(customer, product, [profile], [membership]);
    expect(result.resolvedPrice).toBe(90);
  });

  it('group winner with customerGroupName uses name in label', () => {
    const membership: CustomerGroupMembership = { customerId: 'c1', customerGroupId: 'g1' };
    const profile = makeProfile({
      customerScope: 'group',
      customerGroupId: 'g1',
      customerGroupName: 'Acme Group',
    });
    const result = resolvePrice(customer, product, [profile], [membership]);
    expect(result.resolvedPrice).toBe(90);
    if (result.resolvedPrice !== null) {
      expect(result.matchReasonCustomer).toContain('Acme Group');
    }
  });

  it('returns no match for group profile when no matching membership', () => {
    const profile = makeProfile({
      customerScope: 'group',
            customerGroupId: 'g1',
    });
    const result = resolvePrice(customer, product, [profile], []);
    expect(result.resolvedPrice).toBeNull();
  });

  it('returns no match for group profile when customerGroupId is missing', () => {
    const profile = makeProfile({ customerScope: 'group' });
    const result = resolvePrice(customer, product, [profile], []);
    expect(result.resolvedPrice).toBeNull();
  });

  it('higher score profile wins', () => {
    const membership: CustomerGroupMembership = { customerId: 'c1', customerGroupId: 'g1' };
    const broad = makeProfile({
      id: 'broad',
      name: 'Broad',
      customerScope: 'group',
            customerGroupId: 'g1',
      productScope: 'all',
      items: [item(80)],
    });
    const specific = makeProfile({
      id: 'specific',
      name: 'Specific',
      customerScope: 'individual',
      customerId: 'c1',
      productScope: 'product',
      productFilter: { productId: 'p1' },
      items: [item(70)],
    });
    const result = resolvePrice(customer, product, [broad, specific], [membership]);
    expect(result.resolvedPrice).toBe(70);
  });

  it('tiebreaker: most recently created profile wins', () => {
    const older = makeProfile({
      id: 'older',
      name: 'Older',
      items: [item(85)],
      createdAt: '2023-01-01T00:00:00Z',
    });
    const newer = makeProfile({
      id: 'newer',
      name: 'Newer',
      items: [item(75)],
      createdAt: '2024-06-01T00:00:00Z',
    });
    const result = resolvePrice(customer, product, [older, newer], []);
    expect(result.resolvedPrice).toBe(75);
  });

  describe('product scopes', () => {
    it('matches subCategory scope', () => {
      const profile = makeProfile({
        productScope: 'subCategory',
        productFilter: { subCategory: 'gadgets' },
      });
      const result = resolvePrice(customer, product, [profile], []);
      expect(result.resolvedPrice).toBe(90);
    });

    it('does not match subCategory when different', () => {
      const profile = makeProfile({
        productScope: 'subCategory',
        productFilter: { subCategory: 'other' },
      });
      const result = resolvePrice(customer, product, [profile], []);
      expect(result.resolvedPrice).toBeNull();
    });

    it('matches segment scope', () => {
      const profile = makeProfile({
        productScope: 'segment',
        productFilter: { segment: 'consumer' },
      });
      const result = resolvePrice(customer, product, [profile], []);
      expect(result.resolvedPrice).toBe(90);
    });

    it('does not match segment when different', () => {
      const profile = makeProfile({
        productScope: 'segment',
        productFilter: { segment: 'enterprise' },
      });
      const result = resolvePrice(customer, product, [profile], []);
      expect(result.resolvedPrice).toBeNull();
    });

    it('matches explicit scope via items', () => {
      const profile = makeProfile({
        productScope: 'explicit',
        items: [item(88)],
      });
      const result = resolvePrice(customer, product, [profile], []);
      expect(result.resolvedPrice).toBe(88);
    });

    it('matches product scope by productId', () => {
      const profile = makeProfile({
        productScope: 'product',
        productFilter: { productId: 'p1' },
      });
      const result = resolvePrice(customer, product, [profile], []);
      expect(result.resolvedPrice).toBe(90);
    });

    it('does not match product scope when productId differs', () => {
      const profile = makeProfile({
        productScope: 'product',
        productFilter: { productId: 'other' },
      });
      const result = resolvePrice(customer, product, [profile], []);
      expect(result.resolvedPrice).toBeNull();
    });
  });

  it('explanation pluralises "profiles" when 3+ profiles match', () => {
    const p1 = makeProfile({
      id: 'p1',
      name: 'Best',
      productScope: 'product',
      productFilter: { productId: 'p1' },
      items: [item(70)],
    });
    const p2 = makeProfile({ id: 'p2', name: 'Mid', productScope: 'segment', productFilter: { segment: 'consumer' }, items: [item(80)] });
    const p3 = makeProfile({ id: 'p3', name: 'Broad', productScope: 'all', items: [item(90)] });
    const result = resolvePrice(customer, product, [p1, p2, p3], []);
    expect(result.resolvedPrice).toBe(70);
    if (result.resolvedPrice !== null) {
      expect(result.explanation).toContain('profiles');
    }
  });

  it('explanation includes loser profiles when multiple match', () => {
    const winner = makeProfile({
      id: 'winner',
      name: 'Winner',
      productScope: 'product',
      productFilter: { productId: 'p1' },
      items: [item(70)],
      createdAt: '2024-01-01T00:00:00Z',
    });
    const loser = makeProfile({
      id: 'loser',
      name: 'Loser',
      productScope: 'all',
      items: [item(80)],
      createdAt: '2024-01-01T00:00:00Z',
    });
    const result = resolvePrice(customer, product, [winner, loser], []);
    expect(result.resolvedPrice).toBe(70);
    if (result.resolvedPrice !== null) {
      expect(result.explanation).toContain('Loser');
    }
  });
});
