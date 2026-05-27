import type { Product, ProductFilters } from '@/types'

const BASE = 'http://localhost:4000'

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  const params = new URLSearchParams()
  if (filters?.search) params.set('search', filters.search)
  if (filters?.subCategory) params.set('subCategory', filters.subCategory)
  if (filters?.segment) params.set('segment', filters.segment)
  if (filters?.brand) params.set('brand', filters.brand)

  const qs = params.toString()
  const res = await fetch(`${BASE}/api/products${qs ? `?${qs}` : ''}`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json() as Promise<Product[]>
}
