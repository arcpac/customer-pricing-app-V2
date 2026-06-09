import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { computeAdjustedPrice } from '@/utils/pricing';
import { cn } from '@/lib/utils';
import type { AdjustmentDirection, AdjustmentType, Product } from '@/types';

interface PricingResultTableProps {
  products: Product[];
  type: AdjustmentType;
  direction: AdjustmentDirection;
  valueStr: string;
}

export function PricingResultTable({
  products,
  type,
  direction,
  valueStr,
}: PricingResultTableProps) {
  const value = parseFloat(valueStr) || 0;

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-white border-b border-gray-100">
            <TableHead className="w-32 py-3 px-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">SKU</TableHead>
            <TableHead className="py-3 px-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Title</TableHead>
            <TableHead className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Base Price</TableHead>
            <TableHead className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Adjustment</TableHead>
            <TableHead className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">New Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const newPrice = computeAdjustedPrice(
              product.basePrice,
              type,
              direction,
              value,
            );
            const delta =
              type === 'custom_price'
                ? value - product.basePrice
                : type === 'fixed'
                  ? direction === 'increase'
                    ? value
                    : -value
                  : direction === 'increase'
                    ? (value / 100) * product.basePrice
                    : -((value / 100) * product.basePrice);

            return (
              <TableRow key={product.id} className="border-b border-gray-100 last:border-0 hover:bg-slate-50">
                <TableCell className="py-3 px-4 font-mono text-xs">
                  {product.sku}
                </TableCell>
                <TableCell className="py-3 px-4 font-medium">{product.title}</TableCell>
                <TableCell className="py-3 px-4 text-right">
                  ${product.basePrice.toFixed(2)}
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  {value > 0 ? (
                    <span
                      className={cn('font-medium', delta >= 0 ? 'text-green-600' : 'text-red-500')}
                    >
                      {delta >= 0 ? '+' : ''}${Math.abs(delta).toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  {value > 0 ? (
                    newPrice === 0 ? (
                      <Badge variant="destructive">$0.00</Badge>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        ${newPrice.toFixed(2)}
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
