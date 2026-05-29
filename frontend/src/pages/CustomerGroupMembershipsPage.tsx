import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getCustomers } from '@/api/customers'
import { getCustomerGroups } from '@/api/customerGroups'
import { getCustomerGroupMemberships } from '@/api/customerGroupMemberships'
import type { Customer, CustomerGroup, CustomerGroupMembership } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface GroupedRow {
  groupId: string
  groupName: string
  members: { customerId: string; customerName: string }[]
}

export function CustomerGroupMembershipsPage() {
  const [groupedRows, setGroupedRows] = useState<GroupedRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([getCustomers(), getCustomerGroups(), getCustomerGroupMemberships()])
      .then(([customers, groups, memberships]: [Customer[], CustomerGroup[], CustomerGroupMembership[]]) => {
        const customerMap = new Map(customers.map((c) => [c.id, c.name]))
        const grouped = new Map<string, GroupedRow>()
        for (const g of groups) {
          grouped.set(g.id, { groupId: g.id, groupName: g.name, members: [] })
        }
        for (const m of memberships) {
          const row = grouped.get(m.customerGroupId)
          if (row) {
            row.members.push({
              customerId: m.customerId,
              customerName: customerMap.get(m.customerId) ?? m.customerId,
            })
          }
        }
        setGroupedRows([...grouped.values()])
      })
      .finally(() => setLoading(false))
  }, [])

  function toggleRow(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (groupedRows.length === 0) {
    return <p className="text-sm text-muted-foreground">No groups found.</p>
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="px-4 py-3 border-b">
        <h1 className="text-sm font-semibold">Group Memberships</h1>
      </div>
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
            const isOpen = expanded.has(g.groupId)
            return (
              <>
                <TableRow
                  key={g.groupId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleRow(g.groupId)}
                >
                  <TableCell className="pr-0 text-muted-foreground">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </TableCell>
                  <TableCell className="font-medium">{g.groupName}</TableCell>
                  <TableCell className="text-right">{g.members.length}</TableCell>
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
                            <TableRow key={m.customerId} className="bg-muted/10">
                              <TableCell className="text-xs">{m.customerName}</TableCell>
                            </TableRow>
                          ))}
                          {g.members.length === 0 && (
                            <TableRow>
                              <TableCell className="text-xs text-muted-foreground">No members</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
