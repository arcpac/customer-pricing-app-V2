import type { User, Role } from '@/types';
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${BASE}/api/users`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json() as Promise<User[]>;
}

export async function inviteUser(email: string): Promise<void> {
  const res = await fetch(`${BASE}/api/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Failed to send invite');
}

export async function updateUserRole(id: string, role: Role): Promise<User> {
  const res = await fetch(`${BASE}/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json() as Promise<User>;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete user');
}

export async function acceptInvite(
  token: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${BASE}/api/invite/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error('Invalid or expired invite link');
}

export async function requestPasswordReset(email: string): Promise<void> {
  await fetch(`${BASE}/api/reset-password/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function confirmPasswordReset(
  token: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${BASE}/api/reset-password/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error('Invalid or expired reset link');
}
