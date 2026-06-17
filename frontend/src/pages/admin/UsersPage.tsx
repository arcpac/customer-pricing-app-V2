import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: STALE_MS,
  });

  const inviteMutation = useMutation({
    mutationFn: inviteUser,
    onSuccess: (_, email) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Invite sent to ${email}`);
      setInviteEmail('');
    },
    onError: () => toast.error('Failed to send invite'),
  });

  const roleChangeMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => updateUserRole(id, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Role updated');
    },
    onError: () => toast.error('Failed to update role'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });

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
                    onChange={(e) => roleChangeMutation.mutate({ id: u.id, role: e.target.value as Role })}
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
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(u.id)}
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
        <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(inviteEmail); }} className="flex gap-2 max-w-sm">
          <Input
            type="email"
            placeholder="email@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={inviteMutation.isPending}>
            {inviteMutation.isPending ? 'Sending…' : 'Send invite'}
          </Button>
        </form>
      </div>
    </div>
  );
}
