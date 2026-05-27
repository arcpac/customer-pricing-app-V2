import type { Customer } from '@/types'

const BASE = 'http://localhost:4000'

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${BASE}/api/customers`)
  if (!res.ok) throw new Error('Failed to fetch customers')
  return res.json() as Promise<Customer[]>
}
