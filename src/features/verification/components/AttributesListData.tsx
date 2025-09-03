'use client'

import { Card } from '@/components/ui/card'
import CopyDid from '@/config/CopyDid'
import { JSX } from 'react'

interface AttributeItem {
  schemaId?: string
  credDefId?: string
  [key: string]: string | number | boolean | undefined
}

interface AttributesListProps {
  attributeDataList: AttributeItem[]
}

const groupAndMergeAttributes = (
  data: AttributeItem[],
  key: string,
): AttributeItem[] => {
  const grouped: Record<string, AttributeItem> = {}

  for (const item of data) {
    const groupKey = item[key] ?? item.schemaId ?? ''
    if (typeof groupKey === 'string') {
      if (!grouped[groupKey]) {
        grouped[groupKey] = {}
      }
      grouped[groupKey] = { ...grouped[groupKey], ...item }
    }
  }

  return Object.values(grouped)
}

const AttributesListData = ({
  attributeDataList,
}: AttributesListProps): JSX.Element => {
  const mergedData = groupAndMergeAttributes(attributeDataList, 'credDefId')

  return (
    <>
      {mergedData?.map((item) => (
        <Card
          key={item.credDefId ?? item.schemaId ?? crypto.randomUUID()}
          className="mb-4 overflow-x-auto"
        >
          <div className="flex flex-col justify-start gap-4 p-4 sm:p-6">
            <div className="text-left text-xl font-semibold">Credential</div>

            <div className="text-primary grid grid-cols-12 gap-2 border-b pb-2 text-lg font-semibold">
              <div className="col-span-4 text-left">Attributes</div>
              <div className="col-span-1 text-left">:</div>
              <div className="col-span-7 text-left">Values</div>
            </div>

            {Object.entries(item)
              .filter(([key]) => key !== 'credDefId' && key !== 'schemaId')
              .map(([attrKey, value]) => (
                <div
                  key={attrKey}
                  className="grid grid-cols-12 items-center gap-2 text-base"
                >
                  <div className="text-muted-foreground col-span-4 truncate text-left font-semibold">
                    {attrKey}
                  </div>
                  <div className="col-span-1 text-left">:</div>
                  <div className="col-span-7 text-left break-words">
                    {value}
                  </div>
                </div>
              ))}

            {item.schemaId && (
              <div
                key={`schema-${item.schemaId}`}
                className="grid grid-cols-12 items-center gap-2 text-base"
              >
                <div className="text-muted-foreground col-span-4 text-left font-semibold">
                  schemaId
                </div>
                <div className="col-span-1 text-left">:</div>
                <div className="col-span-7 text-left break-words">
                  <CopyDid
                    value={item.schemaId}
                    className="font-courier mt-2 truncate"
                  />
                </div>
              </div>
            )}

            {item.credDefId && (
              <div
                key={`credDef-${item.credDefId}`}
                className="grid grid-cols-12 items-center gap-2 text-base"
              >
                <div className="text-muted-foreground col-span-4 text-left font-semibold">
                  credDefId
                </div>
                <div className="col-span-1 text-left">:</div>
                <div className="col-span-7 text-left break-words">
                  <CopyDid
                    value={
                      typeof item.credDefId === 'string' ? item.credDefId : ''
                    }
                    className="font-courier mt-2 truncate"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </>
  )
}

export default AttributesListData
