import type { AdjustmentDirection, AdjustmentType } from '@/types'

export function computeAdjustedPrice(
  basePrice: number,
  type: AdjustmentType,
  direction: AdjustmentDirection,
  value: number,
): number {
  if (type === 'custom_price') return Math.max(0, Math.round(value * 100) / 100)
  let adjusted: number
  if (type === 'fixed') {
    adjusted = direction === 'increase' ? basePrice + value : basePrice - value
  } else {
    const delta = basePrice * (value / 100)
    adjusted = direction === 'increase' ? basePrice + delta : basePrice - delta
  }
  return Math.max(0, Math.round(adjusted * 100) / 100)
}
