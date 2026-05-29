import { useEffect, useState } from 'react'
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

interface Row {
  customerId: string
  customerName: string
  groupId: string
  groupName: string
}

export function CustomerGroupMembershipsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getCustomers(), getCustomerGroups(), getCustomerGroupMemberships()])
      .then(([customers, groups, memberships]: [Customer[], CustomerGroup[], CustomerGroupMembership[]]) => {
        const customerMap = new Map(customers.map((c) => [c.id, c.name]))
        const groupMap = new Map(groups.map((g) => [g.id, g.name]))
        setRows(
          memberships.map((m) => ({
            customerId: m.customerId,
            customerName: customerMap.get(m.customerId) ?? m.customerId,
            groupId: m.customerGroupId,
            groupName: groupMap.get(m.customerGroupId) ?? m.customerGroupId,
          })),
        )
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No memberships found.</p>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Group Memberships</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Group</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={`${r.customerId}-${r.groupId}`}>
              <TableCell>{r.customerName}</TableCell>
              <TableCell>{r.groupName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
