import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getCustomers } from '@/api/customers'
import { getProducts } from '@/api/products'
import { resolvePriceBatch } from '@/api/resolve'
import type { BatchResolveItem } from '@/api/resolve'
import type { Customer, Product } from '@/types'

function adjustmentLabel(item: BatchResolveItem): string {
  if (item.resolvedPrice === null || item.adjustmentType === undefined) return '—'
  const sign = item.adjustmentDirection === 'decrease' ? '−' : '+'
  if (item.adjustmentType === 'custom_price') return `Custom $${item.adjustmentValue?.toFixed(2)} (automatic)`
  if (item.adjustmentType === 'percentage') return `${sign}${item.adjustmentValue}% (automatic)`
  return `${sign}$${item.adjustmentValue?.toFixed(2)} (automatic)`
}

export function ResolvePage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customerId, setCustomerId] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<BatchResolveItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCustomers().then(setCustomers).catch(console.error)
    getProducts().then(setProducts).catch(console.error)
  }, [])

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase()
    return q ? products.filter((p) => p.title.toLowerCase().includes(q)) : products
  }, [products, search])

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setResults(null)
  }

  const handleResolve = async () => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const res = await resolvePriceBatch(customerId, [...selectedIds])
      setResults(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve prices')
    } finally {
      setLoading(false)
    }
  }

  const canResolve = customerId !== '' && selectedIds.size > 0

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b">
          <h1 className="text-sm font-semibold">Resolve Price</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select a customer and products to see automatic adjustments from matching profiles.
          </p>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Customer</Label>
            <Select
              value={customerId || undefined}
              onValueChange={(v) => { setCustomerId(v ?? ''); setResults(null) }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select customer…" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Products</Label>
            <Input
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64"
            />
            <div className="rounded-lg border divide-y max-h-80 overflow-y-auto">
              {filteredProducts.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/40 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="accent-primary"
                  />
                  <span className="flex-1">{p.title}</span>
                  <span className="text-xs text-muted-foreground">${p.basePrice.toFixed(2)}</span>
                </label>
              ))}
              {filteredProducts.length === 0 && (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">No products found</div>
              )}
            </div>
            {selectedIds.size > 0 && (
              <p className="text-xs text-muted-foreground">{selectedIds.size} selected</p>
            )}
          </div>

          <Button onClick={handleResolve} disabled={!canResolve || loading}>
            {loading ? 'Resolving…' : 'Resolve'}
          </Button>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      {results && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Results</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium text-sm">Product</th>
                <th className="px-3 py-2.5 text-right font-medium text-sm">Base Price</th>
                <th className="px-3 py-2.5 text-right font-medium text-sm">Adjustment</th>
                <th className="px-3 py-2.5 text-right font-medium text-sm">New Price</th>
                <th className="px-3 py-2.5 text-left font-medium text-sm">Profile Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((item) => (
                <tr key={item.productId} className="hover:bg-muted/20">
                  <td className="px-3 py-2.5">{item.title}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">${item.basePrice.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                    {adjustmentLabel(item)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                    ${(item.resolvedPrice ?? item.basePrice).toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5">
                    {item.sourceProfileName ? (
                      <Badge variant="secondary" className="text-xs">{item.sourceProfileName}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No profile</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
