import type { Role } from '@/types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function checkAuth(): Promise<{ role: Role } | null> {
  try {
    const res = await fetch(`${BASE}/api/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as { role: Role };
    return { role: data.role };
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
