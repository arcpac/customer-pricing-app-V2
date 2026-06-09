import type { Product, ProductFilters } from '@/types';
import { sleep } from '@/utils/sleep';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  await sleep(500);
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sku) params.set('sku', filters.sku);
  if (filters?.subCategory) params.set('subCategory', filters.subCategory);
  if (filters?.segment) params.set('segment', filters.segment);
  if (filters?.brand) params.set('brand', filters.brand);

  const qs = params.toString();
  const res = await fetch(`${BASE}/api/products${qs ? `?${qs}` : ''}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json() as Promise<Product[]>;
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json() as Promise<Product>;
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Promise<Product> {
  const res = await fetch(`${BASE}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json() as Promise<Product>;
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete product');
}
