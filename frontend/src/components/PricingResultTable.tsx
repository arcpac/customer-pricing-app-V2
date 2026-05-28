import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { computeAdjustedPrice } from '@/utils/pricing'
import type { AdjustmentDirection, AdjustmentType, Product } from '@/types'

interface PricingResultTableProps {
  products: Product[]
  type: AdjustmentType
  direction: AdjustmentDirection
  valueStr: string
}

export function PricingResultTable({ products, type, direction, valueStr }: PricingResultTableProps) {
  const value = parseFloat(valueStr) || 0

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-32">SKU</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Base Price</TableHead>
            <TableHead className="text-right">Adjustment ($)</TableHead>
            <TableHead className="text-right">New Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const newPrice = computeAdjustedPrice(product.basePrice, type, direction, value)
            const delta =
              type === 'custom_price'
                ? value - product.basePrice
                : type === 'fixed'
                  ? direction === 'increase' ? value : -value
                  : direction === 'increase'
                    ? (value / 100) * product.basePrice
                    : -((value / 100) * product.basePrice)

            return (
              <TableRow key={product.id}>
                <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell className="text-right">${product.basePrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {value > 0 ? (
                    <span className={delta >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {delta >= 0 ? '+' : ''}${Math.abs(delta).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {value > 0 ? (
                    newPrice === 0 ? (
                      <Badge variant="destructive">$0.00</Badge>
                    ) : (
                      <span className="font-medium">${newPrice.toFixed(2)}</span>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
