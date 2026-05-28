import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Adjustment } from '@/types'

interface AdjustmentPanelProps {
  type: Adjustment['type']
  direction: Adjustment['direction']
  valueStr: string
  onTypeChange: (type: Adjustment['type']) => void
  onDirectionChange: (direction: Adjustment['direction']) => void
  onValueChange: (v: string) => void
}

export function AdjustmentPanel({
  type,
  direction,
  valueStr,
  onTypeChange,
  onDirectionChange,
  onValueChange,
}: AdjustmentPanelProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4 bg-muted/30">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Type</Label>
        <div className="flex overflow-hidden rounded-md border">
          <ToggleBtn active={type === 'fixed'} onClick={() => onTypeChange('fixed')}>
            Fixed $
          </ToggleBtn>
          <ToggleBtn active={type === 'percentage'} onClick={() => onTypeChange('percentage')}>
            Percent %
          </ToggleBtn>
          <ToggleBtn active={type === 'custom_price'} onClick={() => onTypeChange('custom_price')}>
            Custom Price
          </ToggleBtn>
        </div>
      </div>

      {type !== 'custom_price' && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Direction</Label>
          <div className="flex overflow-hidden rounded-md border">
            <ToggleBtn active={direction === 'increase'} onClick={() => onDirectionChange('increase')}>
              Increase
            </ToggleBtn>
            <ToggleBtn active={direction === 'decrease'} onClick={() => onDirectionChange('decrease')}>
              Decrease
            </ToggleBtn>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">
          {type === 'fixed' ? 'Fixed Amount ($)' : type === 'percentage' ? 'Rate (%)' : 'Target Price ($)'}
        </Label>
        <Input
          type="number"
          min="0"
          step={type === 'percentage' ? '1' : '0.01'}
          placeholder={type === 'percentage' ? '0' : '0.00'}
          value={valueStr}
          onChange={(e) => onValueChange(e.target.value)}
          className="h-8 w-28"
        />
      </div>
    </div>
  )
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-background text-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
