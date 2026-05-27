import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Sidebar, type View } from '@/components/Sidebar'
import { ProductFilters } from '@/components/ProductFilters'
import { ProductTable } from '@/components/ProductTable'
import { AdjustmentPanel } from '@/components/AdjustmentPanel'
import { SaveProfileDialog } from '@/components/SaveProfileDialog'
import { getProducts } from '@/api/products'
import { getCustomers } from '@/api/customers'
import { savePricingProfile } from '@/api/pricingProfiles'
import { computeAdjustedPrice } from '@/utils/pricing'
import type { Adjustment, Customer, Product, ProductFilters as Filters } from '@/types'

function App() {
  const [activeView, setActiveView] = useState<View>('products')

  // Products
  const [products, setProducts] = useState<Product[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<Filters>({})
  const [loading, setLoading] = useState(false)

  // Adjustment + preview
  const [adjustment, setAdjustment] = useState<Adjustment | undefined>(undefined)
  const [previewMode, setPreviewMode] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Customers
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    setLoading(true)
    getProducts(filters)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    getCustomers().then(setCustomers).catch(console.error)
  }, [])

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f)
  }, [])

  const handlePreview = useCallback((adj: Adjustment) => {
    setAdjustment(adj)
    setPreviewMode(true)
  }, [])

  // Disable save if any selected product adjusts to $0
  const hasZeroPrice =
    previewMode && adjustment
      ? Array.from(selectedIds).some((id) => {
          const p = products.find((p) => p.id === id)
          if (!p) return false
          return (
            computeAdjustedPrice(p.basePrice, adjustment.type, adjustment.direction, adjustment.value) === 0
          )
        })
      : false

  const handleSave = useCallback(
    async (name: string, customerId: string) => {
      if (!adjustment) return
      try {
        await savePricingProfile({
          name,
          customerId,
          adjustmentType: adjustment.type,
          adjustmentDirection: adjustment.direction,
          adjustmentValue: adjustment.value,
          productIds: Array.from(selectedIds),
        })
        toast.success('Pricing profile saved!')
        setSelectedIds(new Set())
        setPreviewMode(false)
        setAdjustment(undefined)
      } catch {
        toast.error('Failed to save pricing profile')
      }
    },
    [adjustment, selectedIds],
  )

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="flex-1 ml-56 overflow-auto p-6">
        {activeView === 'products' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Products</h2>
            <ProductFilters products={products} onFiltersChange={handleFiltersChange} />
            <AdjustmentPanel
              selectedCount={selectedIds.size}
              previewMode={previewMode}
              saveDisabled={hasZeroPrice}
              onPreview={handlePreview}
              onSave={() => setDialogOpen(true)}
            />
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <ProductTable
                products={products}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                previewMode={previewMode}
                adjustment={adjustment}
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
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Coming soon
            </div>
          </div>
        )}
      </main>

      <SaveProfileDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customers={customers}
        onSave={handleSave}
      />

      <Toaster />
    </div>
  )
}

export default App
