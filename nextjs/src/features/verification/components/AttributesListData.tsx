import { Card } from '@/components/ui/card'
import CopyDid from '@/config/CopyDid'
import { JSX } from 'react'

interface AttributeItem {
  schemaId?: string
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
      {mergedData?.map((item, index) => (
        <Card key={index} className="mb-4">
          <div className="flex flex-col justify-start gap-2 p-4">
            <div className="mb-2 flex justify-start text-xl font-semibold">
              {`Credential ${index + 1}`}
            </div>

            <div className="mb-4 flex h-full flex-col justify-center gap-0 sm:p-0">
              <div className="flex border-b">
                <div className="text-primary flex w-5/12 truncate text-lg font-semibold sm:mr-8 md:mr-0 md:pl-1">
                  Attributes
                </div>
                <div className="text-primary flex w-1/12 justify-start truncate text-xl font-semibold sm:mr-8 md:mr-0 md:pl-1"></div>
                <div className="text-primary flex w-6/12 truncate text-lg font-semibold sm:pl-4">
                  {' '}
                  Values
                </div>
              </div>

              {Object.entries(item)
                .filter(([key]) => key !== 'credDefId' && key !== 'schemaId')
                .map(([key, value], idx) => (
                  <div key={idx} className="flex w-full items-center text-lg">
                    <div className="text-primary-700 m-1 flex w-3/12 items-center justify-start p-1 text-start font-semibold">
                      {key}
                    </div>
                    <div className="m-1 flex w-1/12 items-center p-1 text-lg">
                      :
                    </div>
                    <div className="m-1 w-9/12 cursor-pointer items-center overflow-auto text-start">
                      {value}
                    </div>
                  </div>
                ))}
            </div>

            <div className="">
              <div className="flex w-full items-center text-lg">
                <div className="text-primary-700 m-1 flex w-3/12 items-center justify-start p-1 text-start font-semibold">
                  schemaId
                </div>
                <div className="m-1 flex items-center p-1">:</div>
                <div className="m-1 w-9/12 cursor-pointer items-center overflow-auto text-start">
                  <div className="flex items-center">
                    <CopyDid
                      value={item.schemaId || ''}
                      className="font-courier mt-2 truncate"
                    />
                  </div>
                </div>
              </div>
            </div>

            {item.credDefId && (
              <div className="mb-4">
                <div className="flex w-full items-center text-lg">
                  <div className="text-primary-700 m-1 flex w-3/12 items-center justify-start p-1 text-start font-semibold">
                    credDefId
                  </div>
                  <div className="m-1 flex items-center p-1">:</div>
                  <div className="m-1 w-9/12 cursor-pointer items-center overflow-auto text-start">
                    <div className="flex items-center">
                      <CopyDid
                        value={
                          typeof item.credDefId === 'string'
                            ? item.credDefId
                            : ''
                        }
                        className="font-courier mt-2 truncate"
                      />
                    </div>
                  </div>
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
