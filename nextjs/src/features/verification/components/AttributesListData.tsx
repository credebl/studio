'use client'

import { Card } from '@/components/ui/card'
import CopyDid from '@/config/CopyDid'
import { JSX } from 'react'

interface AttributeItem {
  credDefId?: string
  schemaId: string
  [key: string]: string | undefined
}

interface AttributesListProps {
  attributeDataList: AttributeItem[]
}

const groupAndMergeAttributes = (
  data: AttributeItem[],
  key: string,
): AttributeItem[] => {
  const grouped: Record<string, AttributeItem> = {}

  data.forEach((item) => {
    const groupKey = item[key] || item.schemaId
    grouped[groupKey] = { ...grouped[groupKey], ...item }
  })

  return Object.values(grouped)
}

const AttributesListData = ({
  attributeDataList,
}: AttributesListProps): JSX.Element => {
  const mergedData = groupAndMergeAttributes(attributeDataList, 'credDefId')

  return (
    <div>
      {mergedData.map((item, index) => (
        <Card key={`${item.schemaId}-${index}`} className="mb-4">
          <div className="flex flex-col items-start gap-2 p-4">
            <div className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {`Credential ${index + 1}`}
            </div>

            <div className="mb-4 flex flex-col gap-0">
              <div className="flex border-b">
                <div className="text-primary-700 w-5/12 text-left text-lg font-semibold">
                  Attributes
                </div>
                <div className="w-1/12"></div>
                <div className="text-primary-700 w-6/12 text-left text-lg font-semibold">
                  Values
                </div>
              </div>

              {Object.entries(item)
                .filter(([key]) => key !== 'credDefId' && key !== 'schemaId')
                .map(([key, value]) => (
                  <div key={key} className="flex items-center text-lg">
                    <div className="text-primary-700 m-1 min-w-40 p-1 text-start font-semibold">
                      {key} :
                    </div>
                    <div className="m-1 overflow-auto text-start text-gray-600 dark:text-white">
                      {value}
                    </div>
                  </div>
                ))}
              <div className="flex items-center text-lg">
                <div className="text-primary-700 m-1 min-w-40 p-1 text-start font-semibold">
                  schemaId :
                </div>
                <div className="m-1 text-start text-gray-600 dark:text-white">
                  <div className="flex max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap">
                    <CopyDid
                      value={item.schemaId}
                      className={
                        'sm:max-w-x s w-full max-w-[10rem] truncate overflow-hidden text-ellipsis whitespace-nowrap lg:max-w-md'
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {item.credDefId && (
              <div className="flex items-center text-lg">
                <div className="text-primary-700 m-1 w-3/12 p-1 text-start font-semibold">
                  credDefId
                </div>
                <div className="m-1 p-1">:</div>
                <div className="m-1 w-9/12 text-start text-gray-600 dark:text-white">
                  <div className="flex max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap">
                    <CopyDid
                      value={item.credDefId}
                      className="font-courier truncate"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default AttributesListData
