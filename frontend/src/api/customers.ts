import type { Customer } from '@/types';
import { sleep } from '@/utils/sleep';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function getCustomers(): Promise<Customer[]> {
  await sleep(500);
  console.log('request happened');
  const res = await fetch(`${BASE}/api/customers`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch customers');
  return res.json() as Promise<Customer[]>;
}

export async function createCustomer(name: string): Promise<Customer> {
  const res = await fetch(`${BASE}/api/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create customer');
  return res.json() as Promise<Customer>;
}

export async function updateCustomer(
  id: string,
  name: string,
): Promise<Customer> {
  const res = await fetch(`${BASE}/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to update customer');
  return res.json() as Promise<Customer>;
}

export async function deleteCustomer(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/customers/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete customer');
}
