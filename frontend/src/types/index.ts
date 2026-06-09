export type Role = 'SUPER_ADMIN' | 'STAFF';

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  sku: string;
  subCategory: string;
  segment: string;
  brand: string;
  basePrice: number;
}

export interface Customer {
  id: string;
  name: string;
}

export interface CustomerGroup {
  id: string;
  name: string;
}

export interface CustomerGroupMembership {
  customerId: string;
  customerGroupId: string;
}

export type AdjustmentType = 'fixed' | 'percentage' | 'custom_price';
export type AdjustmentDirection = 'increase' | 'decrease';

export interface Adjustment {
  type: AdjustmentType;
  direction: AdjustmentDirection;
  value: number;
}

export interface ProductFilters {
  search?: string;
  sku?: string;
  subCategory?: string;
  segment?: string;
  brand?: string;
}

export interface PricingProfilePayload {
  name: string;
  customerScope: 'individual' | 'group';
  customerId?: string;
  customerGroupId?: string;
  adjustmentType: AdjustmentType;
  adjustmentDirection: AdjustmentDirection;
  adjustmentValue: number;
  productScope: 'product' | 'explicit' | 'subCategory' | 'segment' | 'all';
  productIds?: string[];
  productFilter?: { subCategory?: string; segment?: string };
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface PricingProfileItem {
  productId: string;
  name: string;
  basePrice: number;
  adjustedPrice: number;
}

export interface PricingProfile {
  id: string;
  name: string;
  customerScope: 'individual' | 'group';
  customerId?: string;
  customerGroupId?: string;
  customerGroupName?: string;
  adjustmentType: AdjustmentType;
  adjustmentDirection: AdjustmentDirection;
  adjustmentValue: number;
  productScope: 'explicit' | 'product' | 'subCategory' | 'segment' | 'all';
  productFilter?: {
    productId?: string;
    subCategory?: string;
    segment?: string;
  };
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  items: PricingProfileItem[];
  createdAt: string;
}

export interface ResolvedPriceLog {
  id: string;
  customerId: string;
  productId: string;
  productName: string | null;
  resolvedPrice: number | null;
  sourceProfileId: string | null;
  sourceProfileName: string | null;
  matchScore: number | null;
  profileExpired: boolean;
  createdAt: string;
}
