import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { DataTableProps } from '../type/ConnectionIssueTable'
import Loader from '@/components/Loader'

const DataTable: React.FC<DataTableProps> = ({
  header,
  displaySelect,
  data,
  loading,
  callback,
  showBtn,
  isEmailVerification,
}) => (
  <div className="flex flex-col">
    {loading ? (
      <div className="mb-4 flex items-center justify-center">
        <Loader />
      </div>
    ) : (
      <div className="overflow-x-auto rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow sm:rounded-lg">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-700">
                <TableRow>
                  {header &&
                    header.length > 0 &&
                    header.map((ele, id: number) => (
                      <TableHead
                        key={`${ele.columnName}-${id}`}
                        scope="col"
                        className={`p-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-white ${ele.width} ${id === 0 && isEmailVerification ? 'pl-12' : ''}`}
                      >
                        <div className="flex h-full w-full flex-col justify-center">
                          <div>{ele.columnName}</div>
                          {ele.subColumnName && (
                            <div className="text-gray-500">
                              {ele.subColumnName}
                            </div>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length ? (
                  data.map((ele, id: number) => (
                    <TableRow
                      key={id}
                      className={`${
                        id % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700' : ''
                      }`}
                    >
                      {ele.data.map((subEle, id: number) => (
                        <TableCell
                          key={`${subEle.data}-${id}`}
                          className={
                            'p-4 align-middle text-sm font-normal whitespace-nowrap text-gray-900 dark:text-white'
                          }
                        >
                          <div>
                            <div>
                              {typeof subEle.data === 'string' ||
                              typeof subEle.data === 'number' ? (
                                <span>{subEle.data}</span>
                              ) : (
                                subEle.data
                              )}
                            </div>
                            <div>
                              {typeof subEle.subData === 'string' ||
                              typeof subEle.subData === 'number' ? (
                                <span>{subEle.subData}</span>
                              ) : (
                                subEle.subData
                              )}
                            </div>
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="p-4 align-middle text-sm font-normal whitespace-nowrap text-gray-900 dark:text-white">
                        {displaySelect ||
                          (showBtn && (
                            <Button
                              key={id}
                              onClick={() => callback?.(ele?.clickId)}
                              className="w-full sm:w-auto"
                            >
                              Select
                            </Button>
                          ))}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="text-center">
                    <TableCell
                      className="p-2 text-center text-gray-500"
                      colSpan={header.length}
                      key={header.length}
                    >
                      Empty data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )}
  </div>
)

export default DataTable
