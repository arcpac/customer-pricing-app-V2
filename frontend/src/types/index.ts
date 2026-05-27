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

export type AdjustmentType = 'fixed' | 'percentage'
export type AdjustmentDirection = 'increase' | 'decrease'

export interface ProductFilters {
  search?: string
  subCategory?: string
  segment?: string
  brand?: string
}

export interface PricingProfilePayload {
  name: string
  customerId: string
  adjustmentType: AdjustmentType
  adjustmentDirection: AdjustmentDirection
  adjustmentValue: number
  productIds: string[]
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
