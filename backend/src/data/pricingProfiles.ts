export interface PricingProfileItem {
  productId: string
  basePrice: number
  adjustedPrice: number
}

export type CustomerScope = "individual" | "group"
export type ProductScope = "explicit" | "product" | "subCategory" | "segment" | "all"

export interface ProductFilter {
  productId?: string
  subCategory?: string
  segment?: string
}

export interface PricingProfile {
  id: string
  name: string
  customerScope: CustomerScope
  customerId?: string
  customerGroup?: string
  adjustmentType: "fixed" | "percentage" | "custom_price"
  adjustmentDirection: "increase" | "decrease"
  adjustmentValue: number
  productScope: ProductScope
  productFilter?: ProductFilter
  items: PricingProfileItem[]
  createdAt: string
}

// Seeded scenario profiles for the overlap challenge
// Profile A: 10% off all Wine for Independent Retailers
// Profile B: $15 off all Sparkling Wine for VIP
// Profile C: $95 fixed price on Koyama for Bondi Cellars (individual)
export const pricingProfiles: PricingProfile[] = [
  {
    id: "prof_scenario_a",
    name: "Profile A — Wine 10% off (Independent Retailers)",
    customerScope: "group",
    customerGroup: "Independent Retailers",
    adjustmentType: "percentage",
    adjustmentDirection: "decrease",
    adjustmentValue: 10,
    productScope: "segment",
    productFilter: { segment: "Wine" },
    items: [
      { productId: "prod_001", basePrice: 120, adjustedPrice: 108 },
      { productId: "prod_002", basePrice: 48, adjustedPrice: 43.20 },
      { productId: "prod_003", basePrice: 42, adjustedPrice: 37.80 },
      { productId: "prod_004", basePrice: 55, adjustedPrice: 49.50 },
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "prof_scenario_b",
    name: "Profile B — Sparkling Wine $15 off (VIP)",
    customerScope: "group",
    customerGroup: "VIP",
    adjustmentType: "fixed",
    adjustmentDirection: "decrease",
    adjustmentValue: 15,
    productScope: "subCategory",
    productFilter: { subCategory: "Sparkling Wine" },
    items: [
      { productId: "prod_001", basePrice: 120, adjustedPrice: 105 },
    ],
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "prof_scenario_c",
    name: "Profile C — Koyama $95 (Bondi Cellars)",
    customerScope: "individual",
    customerId: "cust_006",
    adjustmentType: "custom_price",
    adjustmentDirection: "decrease",
    adjustmentValue: 95,
    productScope: "product",
    productFilter: { productId: "prod_001" },
    items: [
      { productId: "prod_001", basePrice: 120, adjustedPrice: 95 },
    ],
    createdAt: "2026-01-03T00:00:00.000Z",
  },
]
