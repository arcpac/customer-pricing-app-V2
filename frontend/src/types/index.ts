export interface Product {
  id: string
  title: string
  sku: string
  subCategory: string
  segment: string
  brand: string
  basePrice: number
}

export interface Customer {
  id: string
  name: string
}

export interface CustomerGroup {
  id: string
  name: string
}

export type AdjustmentType = 'fixed' | 'percentage' | 'custom_price'
export type AdjustmentDirection = 'increase' | 'decrease'

export interface Adjustment {
  type: AdjustmentType
  direction: AdjustmentDirection
  value: number
}

export interface ProductFilters {
  search?: string
  sku?: string
  subCategory?: string
  segment?: string
  brand?: string
}

export interface PricingProfilePayload {
  name: string
  customerScope: 'individual' | 'group'
  customerId?: string
  customerGroup?: string
  adjustmentType: AdjustmentType
  adjustmentDirection: AdjustmentDirection
  adjustmentValue: number
  productScope: 'product' | 'explicit' | 'subCategory' | 'segment' | 'all'
  productIds?: string[]
  productFilter?: { subCategory?: string; segment?: string }
}

export interface PricingProfileItem {
  productId: string
  basePrice: number
  adjustedPrice: number
}

export interface PricingProfile {
  id: string
  name: string
  customerId: string
  adjustmentType: AdjustmentType
  adjustmentDirection: AdjustmentDirection
  adjustmentValue: number
  items: PricingProfileItem[]
  createdAt: string
}
