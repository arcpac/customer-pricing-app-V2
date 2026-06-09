const BASE = 'http://localhost:4000';

export interface ResolveResult {
  resolvedPrice: number;
  sourceProfileId: string;
  sourceProfileName: string;
  explanation: string;
}

export interface NoMatchResult {
  resolvedPrice: null;
  message: string;
}

export interface BatchResolveItem {
  productId: string;
  title: string;
  sku: string;
  subCategory: string;
  segment: string;
  brand: string;
  basePrice: number;
  resolvedPrice: number | null;
  sourceProfileId?: string;
  sourceProfileName?: string;
  explanation?: string;
  matchReasonCustomer?: string;
  matchReasonProduct?: string;
  matchScore?: number;
  message?: string;
  adjustmentType?: 'fixed' | 'percentage' | 'custom_price';
  adjustmentDirection?: 'increase' | 'decrease';
  adjustmentValue?: number;
}

export async function resolvePrice(
  customerId: string,
  productId: string,
): Promise<ResolveResult | NoMatchResult> {
  const res = await fetch(`${BASE}/api/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ customerId, productId }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Failed to resolve price');
  }
  return res.json() as Promise<ResolveResult | NoMatchResult>;
}

export async function resolvePriceBatch(
  customerId: string,
  productIds: string[],
): Promise<BatchResolveItem[]> {
  const res = await fetch(`${BASE}/api/resolve/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ customerId, productIds }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Failed to resolve prices');
  }
  return res.json() as Promise<BatchResolveItem[]>;
}

export async function saveResolvedPrices(
  customerId: string,
  results: Pick<
    BatchResolveItem,
    'productId' | 'resolvedPrice' | 'sourceProfileId' | 'matchScore'
  >[],
): Promise<{ saved: number }> {
  const res = await fetch(`${BASE}/api/resolve/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ customerId, results }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Failed to save prices');
  }
  return res.json() as Promise<{ saved: number }>;
}

export async function getResolvedPriceHistory(
  customerId: string | null,
): Promise<import('@/types').ResolvedPriceLog[]> {
  if (customerId === null) {
    throw new Error('Failed to fetch history');
  }
  const res = await fetch(
    `${BASE}/api/resolve/history?customerId=${encodeURIComponent(customerId)}`,
    {
      credentials: 'include',
    },
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Failed to fetch history');
  }
  return res.json() as Promise<import('@/types').ResolvedPriceLog[]>;
}
