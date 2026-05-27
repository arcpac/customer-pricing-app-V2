import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { Adjustment } from '@/types'

interface AdjustmentPanelProps {
  selectedCount: number
  previewMode: boolean
  saveDisabled: boolean
  onPreview: (adj: Adjustment) => void
  onSave: () => void
}

export function AdjustmentPanel({
  selectedCount,
  previewMode,
  saveDisabled,
  onPreview,
  onSave,
}: AdjustmentPanelProps) {
  const [type, setType] = useState<Adjustment['type']>('fixed')
  const [direction, setDirection] = useState<Adjustment['direction']>('increase')
  const [valueStr, setValueStr] = useState('')

  const value = parseFloat(valueStr) || 0

  const handlePreview = () => {
    onPreview({ type, direction, value })
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4 bg-muted/30">
      {/* Type toggle */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Type</Label>
        <div className="flex overflow-hidden rounded-md border">
          <ToggleBtn active={type === 'fixed'} onClick={() => setType('fixed')}>
            Fixed $
          </ToggleBtn>
          <ToggleBtn active={type === 'percentage'} onClick={() => setType('percentage')}>
            Percent %
          </ToggleBtn>
        </div>
      </div>

      {/* Direction toggle */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Direction</Label>
        <div className="flex overflow-hidden rounded-md border">
          <ToggleBtn active={direction === 'increase'} onClick={() => setDirection('increase')}>
            Increase
          </ToggleBtn>
          <ToggleBtn active={direction === 'decrease'} onClick={() => setDirection('decrease')}>
            Decrease
          </ToggleBtn>
        </div>
      </div>

      {/* Value input */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Value</Label>
        <Input
          type="number"
          min="0"
          step={type === 'fixed' ? '0.01' : '1'}
          placeholder={type === 'fixed' ? '0.00' : '0'}
          value={valueStr}
          onChange={(e) => setValueStr(e.target.value)}
          className="h-8 w-28"
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={selectedCount === 0 || value <= 0}
        onClick={handlePreview}
      >
        Preview
      </Button>

      {previewMode && (
        <Button size="sm" disabled={saveDisabled || selectedCount === 0} onClick={onSave}>
          Save Profile
        </Button>
      )}
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
