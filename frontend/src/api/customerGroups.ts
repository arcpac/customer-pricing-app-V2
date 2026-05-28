import type { CustomerGroup } from '@/types'

const BASE = 'http://localhost:4000'

export async function getCustomerGroups(): Promise<CustomerGroup[]> {
  const res = await fetch(`${BASE}/api/customer-groups`)
  if (!res.ok) throw new Error('Failed to fetch customer groups')
  return res.json() as Promise<CustomerGroup[]>
}
