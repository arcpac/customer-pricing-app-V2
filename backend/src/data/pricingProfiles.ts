export interface PricingProfileItem {
  productId: string;
  name: string;
  basePrice: number;
  adjustedPrice: number;
}

export type CustomerScope = 'individual' | 'group';
export type ProductScope =
  | 'explicit'
  | 'product'
  | 'subCategory'
  | 'segment'
  | 'all';

export interface ProductFilter {
  productId?: string;
  subCategory?: string;
  segment?: string;
}

export interface PricingProfile {
  id: string;
  name: string;
  customerScope: CustomerScope;
  customerId?: string;
  customerGroupId?: string;
  customerGroupName?: string;
  adjustmentType: 'fixed' | 'percentage' | 'custom_price';
  adjustmentDirection: 'increase' | 'decrease';
  adjustmentValue: number;
  productScope: ProductScope;
  productFilter?: ProductFilter;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  items: PricingProfileItem[];
  createdAt: string;
}
