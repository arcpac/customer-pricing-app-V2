import type { CustomerGroup } from '@/types';
import { sleep } from '@/utils/sleep';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function getCustomerGroups(): Promise<CustomerGroup[]> {
  await sleep(500);
  const res = await fetch(`${BASE}/api/customer-groups`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch customer groups');
  return res.json() as Promise<CustomerGroup[]>;
}

export async function createCustomerGroup(name: string): Promise<CustomerGroup> {
  const res = await fetch(`${BASE}/api/customer-groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create customer group');
  return res.json() as Promise<CustomerGroup>;
}

export async function updateCustomerGroup(id: string, name: string): Promise<CustomerGroup> {
  const res = await fetch(`${BASE}/api/customer-groups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to update customer group');
  return res.json() as Promise<CustomerGroup>;
}

export async function deleteCustomerGroup(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/customer-groups/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete customer group');
}
