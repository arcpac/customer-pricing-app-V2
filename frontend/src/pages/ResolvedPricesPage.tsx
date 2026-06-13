import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { getCustomers } from '@/api/customers';

const STALE_MS = 3 * 60 * 1000;

export function ResolvedPricesListPage() {
  const navigate = useNavigate();

  const { data: customers = [], isFetching } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
    staleTime: STALE_MS,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground">Pages / Resolved prices</p>
        <h1 className="text-2xl font-bold text-foreground mt-0.5">Resolved Price</h1>
      </div>

      {isFetching ? (
        <p className="text-sm text-muted-foreground px-1">Loading…</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {customers.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/resolved-prices/${c.id}`)}
              className="rounded-lg border bg-card p-5 flex flex-col items-center gap-3 text-center hover:bg-accent transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Building2 size={22} className="text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
