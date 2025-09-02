import { Card, CardContent } from '@/components/ui/card'

import CopyDid from '@/config/CopyDid'
import { DataTypeAttributes } from '@/features/organization/connectionIssuance/type/Issuance'
import { JSX } from 'react'

interface IProps {
  schemaName: string
  version: string
  credDefId?: string
  schemaId: string
  hideCredDefId?: boolean
  schemaAttributes?: DataTypeAttributes[]
}

const SummaryCard = ({
  schemaName,
  version,
  schemaId,
  schemaAttributes,
}: Readonly<IProps>): JSX.Element => (
  <Card className="my-6">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h5 className="mb-2 text-xl leading-none font-bold">{schemaName}</h5>
          <div className="mb-4">
            <b>Version</b>: {version}
          </div>
        </div>
      </div>
      <div className="issuance min-w-0 flex-1">
        <div className="relative mb-2 flex items-center truncate break-all">
          <span className="mr-2 font-semibold">
            <b>Schema ID:</b>{' '}
          </span>
          <span className="">
            <CopyDid value={schemaId || ''} />
          </span>
        </div>
        <span className="mr-2 font-semibold">
          <b>Attributes:</b>
        </span>

        <div className="mt-2 flex flex-wrap overflow-hidden">
          {schemaAttributes
            ?.slice(0, 3)
            .map((element: { attributeName: string }) => (
              <div key={element.attributeName} className="truncate">
                <span className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm transition-colors">
                  {element.attributeName}
                </span>
              </div>
            ))}
          {schemaAttributes && schemaAttributes?.length > 3 && (
            <span className="text-muted-foreground ml-2 text-sm/6">
              +{schemaAttributes.length - 3} more
            </span>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

export default SummaryCard
