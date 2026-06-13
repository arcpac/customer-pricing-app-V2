import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Product } from '@/types';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/api/products';

const STALE_MS = 3 * 60 * 1000;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const EMPTY_FORM = { title: '', sku: '', subCategory: '', segment: '', brand: '', basePrice: '' };

export function ProductsManagePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => getProducts(),
    staleTime: STALE_MS,
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      await createProduct({ ...form, basePrice: Number(form.basePrice) });
      await queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      setForm(EMPTY_FORM);
      toast.success('Product created');
    } catch {
      toast.error('Failed to create product');
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit(id: string) {
    try {
      await updateProduct(id, { ...editForm, basePrice: Number(editForm.basePrice) });
      await queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      setEditingId(null);
      toast.success('Product updated');
    } catch {
      toast.error('Failed to update product');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      await queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditForm({ title: p.title, sku: p.sku, subCategory: p.subCategory, segment: p.segment, brand: p.brand, basePrice: String(p.basePrice) });
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b">
          <h1 className="text-sm font-semibold">Products</h1>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead className="text-right">Base Price</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                {editingId === p.id ? (
                  <>
                    <TableCell><Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} className="h-7 text-sm" /></TableCell>
                    <TableCell><Input value={editForm.sku} onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))} className="h-7 text-sm" /></TableCell>
                    <TableCell><Input value={editForm.brand} onChange={(e) => setEditForm((f) => ({ ...f, brand: e.target.value }))} className="h-7 text-sm" /></TableCell>
                    <TableCell><Input value={editForm.segment} onChange={(e) => setEditForm((f) => ({ ...f, segment: e.target.value }))} className="h-7 text-sm" /></TableCell>
                    <TableCell><Input value={editForm.basePrice} onChange={(e) => setEditForm((f) => ({ ...f, basePrice: e.target.value }))} className="h-7 text-sm text-right" type="number" /></TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => void handleSaveEdit(p.id)}><Check size={14} className="text-green-600" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}><X size={14} /></Button>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-sm font-medium">{p.title}</TableCell>
                    <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                    <TableCell className="text-sm">{p.brand}</TableCell>
                    <TableCell className="text-sm">{p.segment}</TableCell>
                    <TableCell className="text-sm text-right">${p.basePrice.toFixed(2)}</TableCell>
                    <TableCell className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(p)}><Pencil size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => void handleDelete(p.id)}><Trash2 size={14} className="text-destructive" /></Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border bg-card px-4 py-4">
        <h2 className="text-sm font-semibold mb-3">Add product</h2>
        <form onSubmit={(e) => void handleAdd(e)} className="grid grid-cols-3 gap-3 max-w-2xl">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input placeholder="Product title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">SKU</Label>
            <Input placeholder="SKU123" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Brand</Label>
            <Input placeholder="Brand name" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sub-category</Label>
            <Input placeholder="Wine" value={form.subCategory} onChange={(e) => setForm((f) => ({ ...f, subCategory: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Segment</Label>
            <Input placeholder="Red" value={form.segment} onChange={(e) => setForm((f) => ({ ...f, segment: e.target.value }))} required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Base Price</Label>
            <Input placeholder="0.00" type="number" step="0.01" value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} required />
          </div>
          <div className="col-span-3">
            <Button type="submit" disabled={adding}>{adding ? 'Adding…' : 'Add product'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
