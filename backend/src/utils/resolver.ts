import type { PricingProfile } from "../data/pricingProfiles.js"
import type { Product } from "../data/products.js"
import type { Customer } from "../data/customers.js"

export interface ResolveResult {
  resolvedPrice: number
  sourceProfileId: string
  sourceProfileName: string
  explanation: string
}

export interface NoMatchResult {
  resolvedPrice: null
  message: string
}

function customerScore(profile: PricingProfile): number {
  return profile.customerScope === "individual" ? 10 : 0
}

function productScore(profile: PricingProfile): number {
  switch (profile.productScope) {
    case "product":
    case "explicit":
      return 10
    case "subCategory":
      return 5
    case "segment":
      return 1
    case "all":
      return 0
  }
}

function profileCoversCustomer(profile: PricingProfile, customer: Customer): boolean {
  if (profile.customerScope === "individual") {
    return profile.customerId === customer.id
  }
  return customer.groups.includes(profile.customerGroup!)
}

function profileCoversProduct(profile: PricingProfile, product: Product): boolean {
  switch (profile.productScope) {
    case "all":
      return true
    case "explicit":
      return profile.items.some((i) => i.productId === product.id)
    case "product":
      return profile.productFilter?.productId === product.id
    case "subCategory":
      return profile.productFilter?.subCategory?.toLowerCase() === product.subCategory.toLowerCase()
    case "segment":
      return profile.productFilter?.segment?.toLowerCase() === product.segment.toLowerCase()
  }
}

export function resolvePrice(
  customer: Customer,
  product: Product,
  profiles: PricingProfile[],
): ResolveResult | NoMatchResult {
  const matching = profiles.filter(
    (p) => profileCoversCustomer(p, customer) && profileCoversProduct(p, product),
  )

  if (matching.length === 0) {
    return { resolvedPrice: null, message: "No pricing profile matches this customer and product" }
  }

  const scored = matching
    .map((p) => ({ profile: p, score: customerScore(p) + productScore(p) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      // Tie-break: newest profile wins
      return new Date(b.profile.createdAt).getTime() - new Date(a.profile.createdAt).getTime()
    })

  const { profile: winner, score } = scored[0]!
  const item = winner.items.find((i) => i.productId === product.id)!

  const customerScopeLabel =
    winner.customerScope === "individual"
      ? `individual customer (${customer.name})`
      : `customer group (${winner.customerGroup!})`

  const productScopeLabel =
    winner.productScope === "product" || winner.productScope === "explicit"
      ? `exact product match (${product.title})`
      : winner.productScope === "subCategory"
        ? `sub-category match (${product.subCategory})`
        : winner.productScope === "segment"
          ? `segment match (${product.segment})`
          : "all products"

  const losers =
    scored.length > 1
      ? ` over ${scored.length - 1} other matching profile${scored.length > 2 ? "s" : ""} (scores: ${scored.slice(1).map((s) => `${s.profile.name}: ${s.score}`).join(", ")})`
      : ""

  const explanation =
    `"${winner.name}" applied: ${customerScopeLabel} + ${productScopeLabel} → $${item.adjustedPrice.toFixed(2)}` +
    ` [score ${score}]${losers}`

  return {
    resolvedPrice: item.adjustedPrice,
    sourceProfileId: winner.id,
    sourceProfileName: winner.name,
    explanation,
  }
}
