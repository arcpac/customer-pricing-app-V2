import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Product, ProductFilters as Filters } from '@/types'

interface ProductFiltersProps {
  products: Product[]
  onFiltersChange: (filters: Filters) => void
}

export function ProductFilters({ products, onFiltersChange }: ProductFiltersProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sku, setSku] = useState('')
  const [debouncedSku, setDebouncedSku] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [segment, setSegment] = useState('')
  const [brand, setBrand] = useState('')

  // Debounce search + sku inputs 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSku(sku), 300)
    return () => clearTimeout(t)
  }, [sku])

  // Emit combined filters whenever any value changes (text inputs already debounced)
  const onFiltersChangeRef = useRef(onFiltersChange)
  onFiltersChangeRef.current = onFiltersChange

  useEffect(() => {
    const filters: Filters = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (debouncedSku) filters.sku = debouncedSku
    if (subCategory) filters.subCategory = subCategory
    if (segment) filters.segment = segment
    if (brand) filters.brand = brand
    onFiltersChangeRef.current(filters)
  }, [debouncedSearch, debouncedSku, subCategory, segment, brand])

  // Derive unique options from current product list
  const subCategories = [...new Set(products.map((p) => p.subCategory))].sort()
  const segments = [...new Set(products.map((p) => p.segment))].sort()
  const brands = [...new Set(products.map((p) => p.brand))].sort()

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-9 w-52"
      />
      <Input
        placeholder="SKU…"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
        className="h-9 w-32"
      />

      <FilterSelect
        placeholder="Sub-category"
        value={subCategory}
        onValueChange={(v) => setSubCategory(v ?? '')}
        options={subCategories}
      />
      <FilterSelect
        placeholder="Segment"
        value={segment}
        onValueChange={(v) => setSegment(v ?? '')}
        options={segments}
      />
      <FilterSelect
        placeholder="Brand"
        value={brand}
        onValueChange={(v) => setBrand(v ?? '')}
        options={brands}
      />
    </div>
  )
}

// Small internal helper to avoid repeating Select boilerplate 3×
interface FilterSelectProps {
  placeholder: string
  value: string
  onValueChange: (v: string | null) => void
  options: string[]
}

function FilterSelect({ placeholder, value, onValueChange, options }: FilterSelectProps) {
  return (
    <Select value={value || null} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-40">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {value && (
          <SelectItem value="">
            All
          </SelectItem>
        )}
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
