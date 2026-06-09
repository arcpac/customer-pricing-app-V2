import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

export function ProductTable({
  products,
  selectedIds,
  onSelectionChange,
}: ProductTableProps) {
  const allSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected = products.some((p) => selectedIds.has(p.id));
  const headerIndeterminate = someSelected && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      // Deselect all filtered rows
      const next = new Set(selectedIds);
      products.forEach((p) => next.delete(p.id));
      onSelectionChange(next);
    } else {
      // Select all filtered rows
      const next = new Set(selectedIds);
      products.forEach((p) => next.add(p.id));
      onSelectionChange(next);
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-white border-b border-gray-100">
            <TableHead className="w-10 py-3 px-4">
              <Checkbox
                checked={allSelected}
                indeterminate={headerIndeterminate}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="w-32 py-3 px-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">SKU</TableHead>
            <TableHead className="py-3 px-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Title</TableHead>
            <TableHead className="py-3 px-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Sub-category</TableHead>
            <TableHead className="py-3 px-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Segment</TableHead>
            <TableHead className="py-3 px-4 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Brand</TableHead>
            <TableHead className="py-3 px-4 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Base Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-8 text-sm"
              >
                No products found.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const isSelected = selectedIds.has(product.id);
              return (
                <TableRow
                  key={product.id}
                  data-state={isSelected ? 'selected' : undefined}
                  className="cursor-pointer hover:bg-slate-50 border-b border-gray-100 last:border-0"
                  onClick={() => toggleRow(product.id)}
                >
                  <TableCell className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(product.id)}
                      aria-label={`Select ${product.title}`}
                    />
                  </TableCell>
                  <TableCell className="py-3 px-4 font-mono text-xs">
                    {product.sku}
                  </TableCell>
                  <TableCell className="py-3 px-4 font-medium">{product.title}</TableCell>
                  <TableCell className="py-3 px-4 text-muted-foreground">
                    {product.subCategory}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-muted-foreground">
                    {product.segment}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-muted-foreground">
                    {product.brand}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    ${product.basePrice.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
