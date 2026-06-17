import React, { memo } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import type { PricingProfile } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface ProfileRowProps {
  profile: PricingProfile;
  nameMap: Map<string, string>;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

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

export const ProfileRow = memo(function ProfileRow({
  profile: p,
  nameMap,
  isOpen,
  onToggle,
  onDelete,
  isDeleting,
}: ProfileRowProps) {
  console.log(nameMap)
  return (
    <React.Fragment>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => onToggle(p.id)}
      >
        <TableCell className="pr-0 text-muted-foreground">
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </TableCell>
        <TableCell className="font-medium">{p.name}</TableCell>
        <TableCell className="text-sm">{formatCustomer(p, nameMap)}</TableCell>
        <TableCell className="text-sm">{formatProductScope(p)}</TableCell>
        <TableCell className="font-mono text-sm">{formatRule(p)}</TableCell>
        <TableCell className="text-right text-sm">{p.items.length}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {p.effectiveFrom ? new Date(p.effectiveFrom).toLocaleDateString() : '—'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {p.effectiveTo ? new Date(p.effectiveTo).toLocaleDateString() : '—'}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {new Date(p.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow key={`${p.id}-expanded`}>
          <TableCell />
          <TableCell colSpan={6} className="p-0 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs">Product ID</TableHead>
                  <TableHead className="text-xs">Product Name</TableHead>
                  <TableHead className="text-xs text-right">Base Price</TableHead>
                  <TableHead className="text-xs text-right">Adjusted Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {p.items.map((item) => (
                  <TableRow key={item.productId} className="bg-muted/10">
                    <TableCell className="font-mono text-xs">{item.productId}</TableCell>
                    <TableCell className="font-mono text-xs">{item.name}</TableCell>
                    <TableCell className="text-xs text-right">${item.basePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-right">${item.adjustedPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
});
