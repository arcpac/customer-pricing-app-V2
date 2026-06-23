import type { Role } from '@/types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type AuthUser = { userId: string; email: string; role: Role };

export async function checkAuth(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${BASE}/api/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = (await res.json()) as AuthUser;
    return { userId: data.userId, email: data.email, role: data.role };
  } catch {
    return null;
  }
}

export async function loginApi(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Login failed');
  }
  return (await res.json()) as AuthUser;
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
