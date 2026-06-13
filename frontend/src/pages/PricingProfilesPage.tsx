import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getPricingProfiles } from '@/api/pricingProfiles';
import { getCustomers } from '@/api/customers';
import type { PricingProfile } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatRule(profile: PricingProfile): string {
  const { adjustmentType, adjustmentDirection, adjustmentValue } = profile;
  const sign = adjustmentDirection === 'increase' ? '+' : '-';
  if (adjustmentType === 'percentage') return `${sign}${adjustmentValue}%`;
  if (adjustmentType === 'fixed')
    return `${sign}$${adjustmentValue.toFixed(2)}`;
  return `$${adjustmentValue.toFixed(2)} custom`;
}

function formatProductScope(profile: PricingProfile): string {
  const { productScope, productFilter, items } = profile;
  if (productScope === 'all') return 'All products';
  if (productScope === 'segment')
    return `Segment: ${productFilter?.segment ?? '—'}`;
  if (productScope === 'subCategory')
    return `Sub-category: ${productFilter?.subCategory ?? '—'}`;
  if (productScope === 'product')
    return `Product: ${productFilter?.productId ?? '—'}`;
  return `${items.length} explicit`;
}

function formatCustomer(
  profile: PricingProfile,
  nameMap: Map<string, string>,
): string {
  if (profile.customerScope === 'group')
    return `Group: ${profile.customerGroupName ?? '—'}`;
  const name = profile.customerId
    ? (nameMap.get(profile.customerId) ?? profile.customerId)
    : '—';
  return `Individual: ${name}`;
}

const STALE_MS = 3 * 60 * 1000;

export function PricingProfilesPage() {
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

  function toggleRow(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => {
              const isOpen = expanded.has(p.id);
              return (
                <React.Fragment key={p.id}>
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleRow(p.id)}
                  >
                    <TableCell className="pr-0 text-muted-foreground">
                      {isOpen ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-sm">
                      {formatCustomer(p, nameMap)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatProductScope(p)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatRule(p)}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {p.items.length}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.effectiveFrom ? new Date(p.effectiveFrom).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.effectiveTo ? new Date(p.effectiveTo).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow key={`${p.id}-expanded`}>
                      <TableCell />
                      <TableCell colSpan={6} className="p-0 pb-2">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-xs">
                                Product ID
                              </TableHead>
                              <TableHead className="text-xs">
                                Product Name
                              </TableHead>
                              <TableHead className="text-xs text-right">
                                Base Price
                              </TableHead>
                              <TableHead className="text-xs text-right">
                                Adjusted Price
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {p.items.map((item) => (
                              <TableRow
                                key={item.productId}
                                className="bg-muted/10"
                              >
                                <TableCell className="font-mono text-xs">
                                  {item.productId}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {item.name}
                                </TableCell>
                                <TableCell className="text-xs text-right">
                                  ${item.basePrice.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-xs text-right">
                                  ${item.adjustedPrice.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
