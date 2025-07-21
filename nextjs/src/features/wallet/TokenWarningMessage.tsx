import { AlertTriangle } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

const TokenWarningMessage = (): React.JSX.Element => (
  <span
    className={cn(
      'bg-warning mt-2 mr-2 inline-flex items-center rounded-sm px-2 py-2 text-xs font-medium',
      '',
    )}
  >
    <AlertTriangle className="my-2 mr-1.5 mr-2" size={20} />
    Before creating the wallet, ensure that you have added tokens to the above
    address.
  </span>
)

export default TokenWarningMessage
