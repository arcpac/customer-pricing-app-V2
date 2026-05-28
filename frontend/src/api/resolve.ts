const BASE = 'http://localhost:4000'

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

export interface BatchResolveItem {
  productId: string
  title: string
  basePrice: number
  resolvedPrice: number | null
  sourceProfileId?: string
  sourceProfileName?: string
  explanation?: string
  message?: string
  adjustmentType?: 'fixed' | 'percentage' | 'custom_price'
  adjustmentDirection?: 'increase' | 'decrease'
  adjustmentValue?: number
}

export async function resolvePrice(
  customerId: string,
  productId: string,
): Promise<ResolveResult | NoMatchResult> {
  const res = await fetch(`${BASE}/api/resolve?customerId=${customerId}&productId=${productId}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? 'Failed to resolve price')
  }
  return res.json() as Promise<ResolveResult | NoMatchResult>
}

export async function resolvePriceBatch(
  customerId: string,
  productIds: string[],
): Promise<BatchResolveItem[]> {
  const res = await fetch(
    `${BASE}/api/resolve/batch?customerId=${customerId}&productIds=${productIds.join(',')}`,
  )
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? 'Failed to resolve prices')
  }
  return res.json() as Promise<BatchResolveItem[]>
}
