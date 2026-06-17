import type { PricingProfile, PricingProfilePayload } from '@/types';

const BASE = 'http://localhost:4000';

export async function getPricingProfiles(): Promise<PricingProfile[]> {
  const res = await fetch(`${BASE}/api/pricing-profiles`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch profiles');
  return res.json() as Promise<PricingProfile[]>;
}

export async function deletePricingProfile(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/pricing-profiles/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete profile');
}

export async function savePricingProfile(
  payload: PricingProfilePayload,
): Promise<PricingProfile> {
  const res = await fetch(`${BASE}/api/pricing-profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(
      (err as { error: string }).error ?? 'Failed to save profile',
    );
  }
  return res.json() as Promise<PricingProfile>;
}
