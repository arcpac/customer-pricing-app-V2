import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import type { Role } from '@/types';
import { getUsers, inviteUser, updateUserRole, deleteUser } from '@/api/users';

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  STAFF: 'Staff',
}

const STALE_MS = 3 * 60 * 1000;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export function UsersPage() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: STALE_MS,
  });

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      await inviteUser(inviteEmail);
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      toast.error('Failed to send invite');
    } finally {
      setInviting(false);
    }
  }

  async function handleRoleChange(id: string, role: Role) {
    try {
      await updateUserRole(id, role);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b">
          <h1 className="text-sm font-semibold">Users</h1>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell>
                  <select
                    value={u.role}
                    onChange={(e) => void handleRoleChange(u.id, e.target.value as Role)}
                    className="text-sm border rounded px-2 py-1 bg-background"
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
                  </select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleDelete(u.id)}
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border bg-card px-4 py-4">
        <h2 className="text-sm font-semibold mb-3">Invite user</h2>
        <form onSubmit={(e) => void handleInvite(e)} className="flex gap-2 max-w-sm">
          <Input
            type="email"
            placeholder="email@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={inviting}>
            {inviting ? 'Sending…' : 'Send invite'}
          </Button>
        </form>
      </div>
    </div>
  );
}
