import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getPricingProfiles, deletePricingProfile } from '@/api/pricingProfiles';
import { getCustomers } from '@/api/customers';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ProfileRow } from './ProfileRow';

const STALE_MS = 3 * 60 * 1000;

export function PricingProfilesPage() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: profiles = [], isFetching: loadingProfiles } = useQuery({
    queryKey: ['pricingProfiles'],
    queryFn: getPricingProfiles,
    staleTime: STALE_MS,
  });

  const { data: customers = [], isFetching: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
    staleTime: STALE_MS,
  });

  const loading = loadingProfiles || loadingCustomers;

  const nameMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers],
  );

  const toggleRow = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const deleteMutation = useMutation({
    mutationFn: deletePricingProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pricingProfiles'] });
      toast.success('Profile deleted');
    },
    onError: () => toast.error('Failed to delete profile'),
  });

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (profiles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No pricing profiles saved yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground">Pages / Pricing Profiles</p>
        <h1 className="text-2xl font-bold text-foreground mt-0.5">Pricing Profiles</h1>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-6" />
              <TableHead>Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Product Scope</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Effective To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <ProfileRow
                key={p.id}
                profile={p}
                nameMap={nameMap}
                isOpen={expanded.has(p.id)}
                onToggle={toggleRow}
                onDelete={deleteMutation.mutate}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === p.id}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
