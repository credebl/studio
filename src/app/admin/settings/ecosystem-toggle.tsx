'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useState, useTransition } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { setEcosystemEnableStatus } from '@/lib/ecosystemSlice'
import { setEcosystemEnabledAction } from '../actions'
import { toast } from 'sonner'
import { useAppDispatch } from '@/lib/hooks'

interface EcosystemToggleProps {
  initialEnabled: boolean
}

export function EcosystemToggle({
  initialEnabled,
}: EcosystemToggleProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()

  const handleCheckedChange = (checked: boolean): void => {
    const previousValue = enabled
    setEnabled(checked)

    startTransition(async () => {
      const result = await setEcosystemEnabledAction(checked)

      if (result.status === 'success') {
        dispatch(setEcosystemEnableStatus(checked))
        toast.success(result.message)
        return
      }

      setEnabled(previousValue)
      toast.error(result.message)
    })
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-6 p-6">
        <div className="space-y-1">
          <Label htmlFor="ecosystem-enabled" className="text-base">
            Enable ecosystem feature
          </Label>
          <p
            id="ecosystem-enabled-description"
            className="text-muted-foreground text-sm"
          >
            When disabled, ecosystem pages and APIs are unavailable to all
            organizations.
          </p>
        </div>

        <Switch
          id="ecosystem-enabled"
          checked={enabled}
          onCheckedChange={handleCheckedChange}
          disabled={isPending}
          aria-describedby="ecosystem-enabled-description"
        />
      </CardContent>
    </Card>
  )
}
