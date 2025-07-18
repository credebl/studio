import CopyDid from '@/config/CopyDid'
import { JSX } from 'react'

interface SchemaCredDefProps {
  schemaCredDefList: {
    name: string
    credDefId?: string
    schemaId: string
  }[]
}

const IdDisplay = ({
  label,
  value,
}: {
  label: string
  value: string
}): JSX.Element => (
  <div className="flex-start mb-2 flex w-full">
    <div className="text-primary-700 m-1 flex w-3/12 items-center justify-start p-1 text-start font-semibold dark:bg-gray-800">
      {label}
    </div>
    <div className="m-1 flex items-center p-1">:</div>
    <div className="m-1 w-9/12 cursor-pointer items-center overflow-auto text-start text-gray-600 dark:text-white">
      <div className="flex w-full">
        <CopyDid value={value} className="font-courier mt-2 truncate" />
      </div>
    </div>
  </div>
)

const SchemaCredDefDetails = ({
  schemaCredDefList,
}: SchemaCredDefProps): JSX.Element => (
  <>
    {schemaCredDefList.map((item) => (
      <div key={item.schemaId} className="mt-6 ml-2 flex w-full justify-start">
        <div className="w-full">
          {item.schemaId && !item.credDefId && (
            <IdDisplay label="Schema Id" value={item.schemaId} />
          )}
          {item.schemaId && item.credDefId && (
            <>
              <IdDisplay label="Schema Id" value={item.schemaId} />
              <IdDisplay label="CredDef Id" value={item.credDefId} />
            </>
          )}
        </div>
      </div>
    ))}
  </>
)

export default SchemaCredDefDetails
