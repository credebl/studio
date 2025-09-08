import React, { JSX } from 'react'

import { Card } from '@/components/ui/card'

interface ITableProps {
  csvData: string[][] | null
}
export default function Table({ csvData }: ITableProps): JSX.Element {
  return (
    <>
      {csvData && csvData.length > 0 && (
        <Card className="mt-6">
          <div className="overflow-x-auto rounded-lg">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow sm:rounded-lg">
                {csvData && csvData.length > 0 && (
                  <div className="mt-4 mb-2 pb-4">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {csvData.length > 0 &&
                            Object.keys(csvData[0]).map((header, index) => (
                              <th
                                key={`${header}-${index}`}
                                className={
                                  'p-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-white'
                                }
                              >
                                {header}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800">
                        {csvData &&
                          csvData.length > 0 &&
                          csvData.map((row, rowIndex) => (
                            <tr
                              key={`${JSON.stringify(row)}-${rowIndex}`}
                              className={`${
                                rowIndex % 2 !== 0
                                  ? 'bg-gray-50 dark:bg-gray-700'
                                  : ''
                              }`}
                            >
                              {Object.values(row).map((cell, cellIndex) => (
                                <td
                                  key={`${cell}-${cellIndex}`}
                                  className={
                                    'p-4 align-middle text-sm font-normal whitespace-nowrap text-gray-900 dark:text-white'
                                  }
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
