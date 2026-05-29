import type { Customer } from '@/types'
import { sleep } from '@/utils/sleep'

const BASE = 'http://localhost:4000'

export async function getCustomers(): Promise<Customer[]> {
  await sleep(500)
  const res = await fetch(`${BASE}/api/customers`)
  if (!res.ok) throw new Error('Failed to fetch customers')
  return res.json() as Promise<Customer[]>
}
