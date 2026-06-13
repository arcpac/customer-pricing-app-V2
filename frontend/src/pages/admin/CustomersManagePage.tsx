import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/api/customers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STALE_MS = 3 * 60 * 1000;

const GRADIENTS = [
  'from-slate-400 to-slate-600',
  'from-teal-400 to-cyan-600',
  'from-blue-400 to-indigo-600',
  'from-purple-400 to-violet-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
];

function CustomerInitials({ name }: { name: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xs font-semibold text-white ring-2 ring-white/40">
      {initials}
    </div>
  );
}

export function CustomersManagePage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
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
      setShowAddForm(false);
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">Manage customer accounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {customers.map((c, i) => (
          <div key={c.id} className="rounded-xl border bg-card overflow-hidden flex flex-col shadow-sm">
            <div className={`h-40 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-end p-3`}>
              <CustomerInitials name={c.name} />
            </div>

            <div className="p-4 flex flex-col flex-1 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Customer #{i + 1}</p>
                {editingId === c.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-sm mt-1"
                    autoFocus
                  />
                ) : (
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto">
                {editingId === c.id ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void handleSaveEdit(c.id)}>
                      <Check size={14} className="text-green-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700"
                      onClick={() => { setEditingId(c.id); setEditName(c.name); }}
                    >
                      MANAGE
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => void handleDelete(c.id)}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {showAddForm ? (
          <div className="rounded-xl border bg-card p-4 flex flex-col gap-3 shadow-sm">
            <p className="text-sm font-semibold">New Customer</p>
            <form onSubmit={(e) => void handleAdd(e)} className="flex flex-col gap-2">
              <Input
                placeholder="Customer name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={adding} className="flex-1">
                  {adding ? 'Adding…' : 'Add'}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-xl border-2 border-dashed border-border hover:border-teal-400 bg-card hover:bg-teal-50/30 flex flex-col items-center justify-center gap-2 p-8 min-h-[220px] text-muted-foreground hover:text-teal-600 transition-colors cursor-pointer"
          >
            <Plus size={24} />
            <span className="text-sm font-medium">Add New Customer</span>
          </button>
        )}
      </div>
    </div>
  );
}
