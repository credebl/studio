import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { AlertTriangle } from 'lucide-react'
import React from 'react'

const PasskeyAlert = (): React.JSX.Element => (
  <div className="mt-4 flex">
    <Alert className="flex w-auto items-start space-x-3 bg-yellow-100 p-2 text-yellow-700">
      <AlertTriangle className="mt-1 h-5 w-5 text-yellow-500" />
      <div>
        <AlertTitle className="text-yellow-700">Notice</AlertTitle>
        <AlertDescription className="text-warning">
          This browser or device partially supports passkey.
        </AlertDescription>
      </div>
    </Alert>
  </div>
)

export default PasskeyAlert
