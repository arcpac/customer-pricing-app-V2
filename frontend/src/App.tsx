import { useCallback, useEffect, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar, type View } from '@/components/Sidebar'
import { ProductFilters } from '@/components/ProductFilters'
import { ProductTable } from '@/components/ProductTable'
import { getProducts } from '@/api/products'
import type { Product, ProductFilters as Filters } from '@/types'

function App() {
  const [activeView, setActiveView] = useState<View>('products')

  // Products view state
  const [products, setProducts] = useState<Product[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<Filters>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    getProducts(filters)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters])

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f)
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 ml-56 overflow-auto p-6">
        {activeView === 'products' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Products</h2>
            <ProductFilters products={products} onFiltersChange={handleFiltersChange} />
            {loading ? (
              <div className="text-sm text-muted-foreground py-8 text-center">Loading…</div>
            ) : (
              <ProductTable
                products={products}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            )}
          </div>
        )}

        {activeView !== 'products' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold capitalize">
              {activeView === 'profiles'
                ? 'Pricing Profiles'
                : activeView === 'customers'
                  ? 'Customers'
                  : 'Create Profile'}
            </h2>
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
              Coming in Phase 4
            </div>
          </div>
        )}
      </main>

      <Toaster />
    </div>
  )
}

export default App
