import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCustomers } from '@/api/customers';
import { getResolvedPriceHistory, fetchLatestSnapshot } from '@/api/resolve';
import type { SnapshotData } from '@/api/resolve';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STALE_MS = 3 * 60 * 1000;

export function ResolvedPriceDetailPage({ customerId }: { customerId: string }) {
  const navigate = useNavigate();
  const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);

  const handleFetchSnapshot = async () => {
    setLoadingSnapshot(true);
    try {
      const data = await fetchLatestSnapshot(customerId);
      setSnapshotData(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch snapshot');
    } finally {
      setLoadingSnapshot(false);
    }
  };

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
    staleTime: STALE_MS,
  });

  const customer = customers.find((c) => c.id === customerId);

  const { data: logs = [], isFetching: loading } = useQuery({
    queryKey: ['resolvedPriceHistory', customerId],
    queryFn: () => getResolvedPriceHistory(customerId),
    enabled: !!customerId,
    staleTime: STALE_MS,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-3 border-b flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate('/resolved-prices')}>
            <ArrowLeft size={15} />
          </Button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold">
              {customer ? customer.name : 'Resolved Prices'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Saved resolution history.</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleFetchSnapshot} disabled={loadingSnapshot}>
            {loadingSnapshot ? 'Fetching…' : 'Fetch snapshot'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">No saved prices for this customer.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Resolved Price</TableHead>
                <TableHead>Profile Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Saved At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.productName ?? log.productId}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {log.resolvedPrice != null ? `$${log.resolvedPrice.toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.sourceProfileName ?? '—'}
                  </TableCell>
                  <TableCell>
                    {log.profileExpired && (
                      <Badge variant="destructive" className="text-xs">
                        Expired profile
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {snapshotData && (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Latest snapshot</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(snapshotData.createdAt).toLocaleString()}
            </p>
          </div>
          <pre className="px-4 py-4 text-xs overflow-auto">
            {JSON.stringify(snapshotData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
