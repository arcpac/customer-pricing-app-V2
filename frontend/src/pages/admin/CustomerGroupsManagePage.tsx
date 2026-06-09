import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { CustomerGroup } from '@/types';
import { getCustomerGroups, createCustomerGroup, updateCustomerGroup, deleteCustomerGroup } from '@/api/customerGroups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export function CustomerGroupsManagePage() {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    getCustomerGroups().then(setGroups).catch(() => toast.error('Failed to load groups')).finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const created = await createCustomerGroup(newName.trim());
      setGroups((prev) => [...prev, created]);
      setNewName('');
      toast.success('Group created');
    } catch {
      toast.error('Failed to create group');
    } finally {
      setAdding(false);
    }
  }

  async function handleSaveEdit(id: string) {
    try {
      const updated = await updateCustomerGroup(id, editName.trim());
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
      setEditingId(null);
      toast.success('Group updated');
    } catch {
      toast.error('Failed to update group');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCustomerGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success('Group deleted');
    } catch {
      toast.error('Failed to delete group');
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b">
          <h1 className="text-sm font-semibold">Customer Groups</h1>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((g) => (
              <TableRow key={g.id}>
                <TableCell>
                  {editingId === g.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm">{g.name}</span>
                  )}
                </TableCell>
                <TableCell className="flex gap-1 justify-end">
                  {editingId === g.id ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => void handleSaveEdit(g.id)}>
                        <Check size={14} className="text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingId(null)}>
                        <X size={14} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingId(g.id); setEditName(g.name); }}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => void handleDelete(g.id)}>
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
        <h2 className="text-sm font-semibold mb-3">Add group</h2>
        <form onSubmit={(e) => void handleAdd(e)} className="flex gap-2 max-w-sm">
          <Input
            placeholder="Group name"
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
