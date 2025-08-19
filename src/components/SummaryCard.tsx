import { Card, CardContent } from '@/components/ui/card'

import CopyDid from '@/config/CopyDid'
import { JSX } from 'react'

interface IProps {
  schemaName: string
  version: string
  credDefId?: string
  schemaId: string
  hideCredDefId?: boolean
}

const SummaryCard = ({
  schemaName,
  version,
  credDefId,
  schemaId,
}: Readonly<IProps>): JSX.Element => (
  <Card className="my-6">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h5 className="text-xl leading-none font-bold dark:text-white">
            {schemaName}
          </h5>
          <div className="mb-4 dark:text-white">
            <b>Version</b>: {version}
          </div>
        </div>
      </div>
      <div className="issuance min-w-0 flex-1">
        <div className="relative flex truncate break-all dark:text-white">
          <span className="mr-2 font-semibold">
            <b>Schema ID:</b>{' '}
          </span>
          <span className="w-schema-id flex">
            <CopyDid
              value={schemaId || ''}
              className="font-courier mt-[2px] truncate"
            />
          </span>
        </div>
        <div className="flex truncate break-all dark:text-white">
          <span className="mr-2 font-semibold">
            <b>Credential Definition:</b>{' '}
          </span>
          <span className="w-cred-id flex">
            <CopyDid
              value={credDefId || ''}
              className="font-courier mt-[2px] truncate"
            />
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default SummaryCard
