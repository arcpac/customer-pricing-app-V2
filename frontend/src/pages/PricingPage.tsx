import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
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
import { ProductFilters } from '@/components/ProductFilters'
import { ProductTable } from '@/components/ProductTable'
import { AdjustmentPanel } from '@/components/AdjustmentPanel'
import { PricingResultTable } from '@/components/PricingResultTable'
import { getProducts } from '@/api/products'
import { getCustomers } from '@/api/customers'
import { getCustomerGroups } from '@/api/customerGroups'
import { savePricingProfile } from '@/api/pricingProfiles'
import { computeAdjustedPrice } from '@/utils/pricing'
import { cn } from '@/lib/utils'
import type { Adjustment, Customer, CustomerGroup, Product, ProductFilters as Filters } from '@/types'

type CustomerScopeType = 'individual' | 'group'
type ProductScopeType = 'one' | 'multiple' | 'all' | 'subCategory' | 'segment'

const CUSTOMER_SCOPE_LABELS: Record<CustomerScopeType, string> = {
  individual: 'Individual',
  group: 'Customer Group',
}

const PRODUCT_SCOPE_LABELS: Record<ProductScopeType, string> = {
  one: 'One Product',
  multiple: 'Multiple Products',
  subCategory: 'By Sub-Category',
  segment: 'By Segment',
  all: 'All Products',
}

export function PricingPage() {
  // Setup Profile
  const [setupOpen, setSetupOpen] = useState(false)
  const [profileName, setProfileName] = useState('')

  // Customer scope
  const [customerScope, setCustomerScope] = useState<CustomerScopeType>('individual')
  const [customerId, setCustomerId] = useState('')
  const [customerGroupName, setCustomerGroupName] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])

  // Product scope
  const [productScope, setProductScope] = useState<ProductScopeType>('multiple')
  const [products, setProducts] = useState<Product[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<Filters>({})
  const [filterSubCategory, setFilterSubCategory] = useState('')
  const [filterSegment, setFilterSegment] = useState('')
  const [loading, setLoading] = useState(false)

  // Adjustment
  const [adjustmentType, setAdjustmentType] = useState<Adjustment['type']>('fixed')
  const [adjustmentDirection, setAdjustmentDirection] = useState<Adjustment['direction']>('increase')
  const [adjustmentValueStr, setAdjustmentValueStr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCustomers().then(setCustomers).catch(console.error)
    getCustomerGroups().then(setCustomerGroups).catch(console.error)
  }, [])

  // Fetch products for explicit selection scopes
  useEffect(() => {
    if (productScope === 'all' || productScope === 'subCategory' || productScope === 'segment') return
    setLoading(true)
    getProducts(filters)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filters, productScope])

  // Fetch full catalog for all/category scopes
  useEffect(() => {
    if (productScope !== 'all' && productScope !== 'subCategory' && productScope !== 'segment') return
    setLoading(true)
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [productScope])

  const handleProductScopeChange = useCallback((next: ProductScopeType) => {
    setProductScope(next)
    setSelectedIds(new Set())
    setFilterSubCategory('')
    setFilterSegment('')
  }, [])

  const handleFiltersChange = useCallback((f: Filters) => {
    setFilters(f)
  }, [])

  const handleSelectionChange = useCallback(
    (ids: Set<string>) => {
      if (productScope === 'one') {
        const added = [...ids].find((id) => !selectedIds.has(id))
        setSelectedIds(added ? new Set([added]) : new Set())
      } else {
        setSelectedIds(ids)
      }
    },
    [productScope, selectedIds],
  )

  // Distinct values for category dropdowns
  const subCategories = useMemo(() => [...new Set(products.map((p) => p.subCategory))].sort(), [products])
  const segments = useMemo(() => [...new Set(products.map((p) => p.segment))].sort(), [products])

  // Products shown in preview
  const selectedProducts = useMemo(() => {
    if (productScope === 'all') return products
    if (productScope === 'subCategory') return filterSubCategory ? products.filter((p) => p.subCategory === filterSubCategory) : []
    if (productScope === 'segment') return filterSegment ? products.filter((p) => p.segment === filterSegment) : []
    return products.filter((p) => selectedIds.has(p.id))
  }, [productScope, products, selectedIds, filterSubCategory, filterSegment])

  const adjustmentValue = parseFloat(adjustmentValueStr) || 0

  const hasZeroPrice = selectedProducts.some(
    (p) => computeAdjustedPrice(p.basePrice, adjustmentType, adjustmentDirection, adjustmentValue) === 0,
  )

  const customerReady =
    customerScope === 'individual' ? customerId !== '' : customerGroupName !== ''

  const productReady =
    productScope === 'all'
      ? true
      : productScope === 'subCategory'
        ? filterSubCategory !== ''
        : productScope === 'segment'
          ? filterSegment !== ''
          : selectedProducts.length > 0

  const canSave =
    profileName.trim() !== '' &&
    customerReady &&
    productReady &&
    adjustmentValue > 0 &&
    !hasZeroPrice

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const customerPayload =
        customerScope === 'individual'
          ? { customerScope: 'individual' as const, customerId }
          : { customerScope: 'group' as const, customerGroup: customerGroupName }

      const productPayload = (() => {
        switch (productScope) {
          case 'one':
            return { productScope: 'product' as const, productIds: [...selectedIds] }
          case 'multiple':
            return { productScope: 'explicit' as const, productIds: [...selectedIds] }
          case 'all':
            return { productScope: 'all' as const, productIds: [] }
          case 'subCategory':
            return { productScope: 'subCategory' as const, productFilter: { subCategory: filterSubCategory }, productIds: [] }
          case 'segment':
            return { productScope: 'segment' as const, productFilter: { segment: filterSegment }, productIds: [] }
        }
      })()

      await savePricingProfile({
        name: profileName.trim(),
        ...customerPayload,
        adjustmentType,
        adjustmentDirection,
        adjustmentValue,
        ...productPayload,
      })

      toast.success('Pricing profile saved!')
      setProfileName('')
      setCustomerId('')
      setCustomerGroupName('')
      setSelectedIds(new Set())
      setAdjustmentValueStr('')
      setFilterSubCategory('')
      setFilterSegment('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save pricing profile')
    } finally {
      setSaving(false)
    }
  }, [
    customerScope, customerId, customerGroupName,
    adjustmentType, adjustmentDirection, adjustmentValue,
    productScope, selectedIds, filterSubCategory, filterSegment, profileName,
  ])

  const selectedCustomerLabel =
    customerScope === 'individual'
      ? customers.find((c) => c.id === customerId)?.name
      : customerGroupName || undefined

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Section 1: Setup Profile */}
      <div className="rounded-lg border bg-card">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors rounded-lg"
          onClick={() => setSetupOpen((o) => !o)}
        >
          <span>Setup Profile</span>
          <div className="flex items-center gap-2">
            {profileName && selectedCustomerLabel && !setupOpen && (
              <span className="text-xs font-normal text-muted-foreground">
                {profileName} · {selectedCustomerLabel}
              </span>
            )}
            {setupOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </div>
        </button>

        {setupOpen && (
          <div className="px-4 pb-4 pt-3 border-t space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Profile Name</Label>
                <Input
                  placeholder="e.g. VIP Summer Discount"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Customer Scope</Label>
                <div className="flex overflow-hidden rounded-md border">
                  {(Object.keys(CUSTOMER_SCOPE_LABELS) as CustomerScopeType[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setCustomerScope(s); setCustomerId(''); setCustomerGroupName('') }}
                      className={cn(
                        'flex-1 px-3 py-1.5 text-xs font-medium transition-colors',
                        customerScope === s
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-foreground hover:bg-muted',
                      )}
                    >
                      {CUSTOMER_SCOPE_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div />
              <div className="space-y-1.5">
                {customerScope === 'individual' ? (
                  <>
                    <Label className="text-xs text-muted-foreground">Customer</Label>
                    <Select value={customerId || undefined} onValueChange={(v) => setCustomerId(v ?? '')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select customer…" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Label className="text-xs text-muted-foreground">Customer Group</Label>
                    <Select value={customerGroupName || undefined} onValueChange={(v) => setCustomerGroupName(v ?? '')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select group…" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerGroups.map((g) => (
                          <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Setup Product Pricing */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold">Setup Product Pricing</h2>

        {/* Product scope selector */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Product Scope</Label>
          <div className="flex overflow-hidden rounded-md border w-fit">
            {(Object.keys(PRODUCT_SCOPE_LABELS) as ProductScopeType[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleProductScopeChange(s)}
                className={cn(
                  'px-4 py-1.5 text-xs font-medium transition-colors',
                  productScope === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground hover:bg-muted',
                )}
              >
                {PRODUCT_SCOPE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Product selection UI */}
        {productScope === 'subCategory' ? (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Sub-Category</Label>
            <Select value={filterSubCategory || undefined} onValueChange={(v) => setFilterSubCategory(v ?? '')}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select sub-category…" />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((sc) => (
                  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : productScope === 'segment' ? (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Segment</Label>
            <Select value={filterSegment || undefined} onValueChange={(v) => setFilterSegment(v ?? '')}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select segment…" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((seg) => (
                  <SelectItem key={seg} value={seg}>{seg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : productScope === 'all' ? (
          loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Adjustment will apply to all {products.length} products in the catalog.
            </div>
          )
        ) : (
          <>
            <ProductFilters products={products} onFiltersChange={handleFiltersChange} />
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <ProductTable
                products={products}
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
              />
            )}
          </>
        )}

        <AdjustmentPanel
          type={adjustmentType}
          direction={adjustmentDirection}
          valueStr={adjustmentValueStr}
          onTypeChange={setAdjustmentType}
          onDirectionChange={setAdjustmentDirection}
          onValueChange={setAdjustmentValueStr}
        />

        {selectedProducts.length > 0 && (
          <PricingResultTable
            products={selectedProducts}
            type={adjustmentType}
            direction={adjustmentDirection}
            valueStr={adjustmentValueStr}
          />
        )}

        <Button disabled={!canSave || saving} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </div>
    </div>
  )
}
