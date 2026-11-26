'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface CopyFieldProps {
  value: string
  label: string
}

export function CopyField({ value, label }: CopyFieldProps): React.JSX.Element {
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied.`)
    } catch {
      toast.error('Could not copy to the clipboard.')
    }
  }

  return (
    <div className="flex gap-2">
      <Input readOnly value={value} aria-label={label} />
      <Button type="button" variant="outline" onClick={() => void copy()}>
        Copy
      </Button>
    </div>
  )
}
