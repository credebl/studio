import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { AlertTriangle } from 'lucide-react'
import React from 'react'

const PasskeyAlert = (): React.JSX.Element => (
  <div className="mt-4 flex">
    <Alert variant="default" className="flex w-full items-start space-x-3 p-4">
      <AlertTriangle className="mt-1 h-5 w-5 text-yellow-500" />
      <div>
        <AlertTitle className="text-yellow-700">Notice</AlertTitle>
        <AlertDescription>
          This browser or device partially supports passkey.
        </AlertDescription>
      </div>
    </Alert>
  </div>
)

export default PasskeyAlert
