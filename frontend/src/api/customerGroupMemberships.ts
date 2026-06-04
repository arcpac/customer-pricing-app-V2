import type { CustomerGroupMembership } from '@/types'

const BASE = 'http://localhost:4000'

export async function getCustomerGroupMemberships(): Promise<CustomerGroupMembership[]> {
  const res = await fetch(`${BASE}/api/customer-group-memberships`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch customer group memberships')
  return res.json() as Promise<CustomerGroupMembership[]>
}
