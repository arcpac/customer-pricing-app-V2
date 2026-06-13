import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { Customer } from '@/types';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/api/customers';

const STALE_MS = 3 * 60 * 1000;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export function CustomersManagePage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data: customers = [], isLoading: loading } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
    staleTime: STALE_MS,
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      await createCustomer(newName.trim());
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      setNewName('');
      toast.success('Customer created');
    } catch {
      toast.error('Failed to create customer');
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit(id: string) {
    try {
      await updateCustomer(id, editName.trim());
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingId(null);
      toast.success('Customer updated');
    } catch {
      toast.error('Failed to update customer');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCustomer(id);
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted');
    } catch {
      toast.error('Failed to delete customer');
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b">
          <h1 className="text-sm font-semibold">Customers</h1>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  {editingId === c.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm">{c.name}</span>
                  )}
                </TableCell>
                <TableCell className="flex gap-1 justify-end">
                  {editingId === c.id ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => void handleSaveEdit(c.id)}>
                        <Check size={14} className="text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                        <X size={14} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingId(c.id); setEditName(c.name); }}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void handleDelete(c.id)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border bg-card px-4 py-4">
        <h2 className="text-sm font-semibold mb-3">Add customer</h2>
        <form onSubmit={(e) => void handleAdd(e)} className="flex gap-2 max-w-sm">
          <Input
            placeholder="Customer name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Button type="submit" disabled={adding}>
            {adding ? 'Adding…' : 'Add'}
          </Button>
        </form>
      </div>
    </div>
  );
}
