import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getCustomers } from '@/api/customers';
import { getCustomerGroups } from '@/api/customerGroups';
import { getCustomerGroupMemberships } from '@/api/customerGroupMemberships';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GroupedRow {
  groupId: string;
  groupName: string;
  members: { customerId: string; customerName: string }[];
}

const STALE_MS = 3 * 60 * 1000;

export function CustomerGroupMembershipsPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: customers = [], isFetching: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
    staleTime: STALE_MS,
  });

  const { data: customerGroups = [], isFetching: loadingGroups } = useQuery({
    queryKey: ['customerGroups'],
    queryFn: getCustomerGroups,
    staleTime: STALE_MS,
  });

  const { data: memberships = [], isFetching: loadingMemberships } = useQuery({
    queryKey: ['customerGroupMemberships'],
    queryFn: getCustomerGroupMemberships,
    staleTime: STALE_MS,
  });

  const loading = loadingCustomers || loadingGroups || loadingMemberships;

  const groupedRows = useMemo(() => {
    const customerMap = new Map(customers.map((c) => [c.id, c.name]));
    const grouped = new Map<string, GroupedRow>();
    for (const g of customerGroups) {
      grouped.set(g.id, { groupId: g.id, groupName: g.name, members: [] });
    }
    for (const m of memberships) {
      const row = grouped.get(m.customerGroupId);
      if (row) {
        row.members.push({
          customerId: m.customerId,
          customerName: customerMap.get(m.customerId) ?? m.customerId,
        });
      }
    }
    return [...grouped.values()];
  }, [customers, customerGroups, memberships]);

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

  if (groupedRows.length === 0) {
    return <p className="text-sm text-muted-foreground">No groups found.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-muted-foreground">Pages / Group Memberships</p>
        <h1 className="text-2xl font-bold text-foreground mt-0.5">Pricing Group Memberships</h1>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-6" />
              <TableHead>Group</TableHead>
              <TableHead className="text-right">Members</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedRows.map((g) => {
              const isOpen = expanded.has(g.groupId);
              return (
                <React.Fragment key={g.groupId}>
                  <TableRow
                    key={g.groupId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleRow(g.groupId)}
                  >
                    <TableCell className="pr-0 text-muted-foreground">
                      {isOpen ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{g.groupName}</TableCell>
                    <TableCell className="text-right">
                      {g.members.length}
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow key={`${g.groupId}-expanded`}>
                      <TableCell />
                      <TableCell colSpan={2} className="p-0 pb-2">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-xs">Customer</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {g.members.map((m) => (
                              <TableRow
                                key={m.customerId}
                                className="bg-muted/10"
                              >
                                <TableCell className="text-xs">
                                  {m.customerName}
                                </TableCell>
                              </TableRow>
                            ))}
                            {g.members.length === 0 && (
                              <TableRow>
                                <TableCell className="text-xs text-muted-foreground">
                                  No members
                                </TableCell>
                              </TableRow>
                            )}
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
