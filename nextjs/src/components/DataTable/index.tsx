import { ITableData, Data as TableCellData, TableHeader } from './interface'

import Loader from '../Loader'
import { useAppSelector } from '@/lib/hooks'

interface DataTableProps {
  header: TableHeader[]
  data: ITableData[]
  loading: boolean
  callback?: (clickId: string | null | undefined) => void
  displaySelect?: boolean
  showBtn?: boolean
  isEmailVerification?: boolean
}

const DataTable: React.FC<DataTableProps> = ({
  header,
  data,
  loading,
  callback,
  displaySelect = false,
  showBtn = false,
  isEmailVerification = false,
}) => {
  const isCollapsed = useAppSelector((state) => state.sidebar.isCollapsed)
  return (
    <div className="flex flex-col md:w-auto">
      {loading ? (
        <div className="mb-4 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div
          className={`${
            isCollapsed ? 'md:w-[calc(100vw-20rem)]' : 'md:w-[calc(100vw-7rem)]'
          } w-[calc(100vw-5rem)] overflow-x-auto rounded-lg border border-red-400`}
        >
          <table className="w-full min-w-max border">
            <thead className="bg-muted dark:bg-muted">
              <tr>
                {header.map((ele: TableHeader, index: number) => (
                  <th
                    key={index}
                    scope="col"
                    className={`text-muted-foreground p-4 text-left text-xs font-medium tracking-wider uppercase ${ele.width ?? ''} ${
                      index === 0 && isEmailVerification ? 'pl-12' : ''
                    }`}
                  >
                    <div>{ele.columnName}</div>
                    {ele.subColumnName && (
                      <div className="text-muted-foreground text-sm font-normal">
                        {ele.subColumnName}
                      </div>
                    )}
                  </th>
                ))}
                {(displaySelect || showBtn) && (
                  <th className="text-muted-foreground p-4 text-left text-xs font-medium tracking-wider uppercase">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-background dark:bg-background">
              {data.length > 0 ? (
                data.map((row, rowIndex: number) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-muted/30 border border-b"
                  >
                    {row.data.map((cell: TableCellData, cellIndex: number) => (
                      <td
                        key={cellIndex}
                        className="text-foreground p-4 align-middle text-sm font-normal whitespace-nowrap"
                      >
                        <div>{cell.data}</div>
                        {cell.subData && (
                          <div className="text-muted-foreground text-xs">
                            {cell.subData}
                          </div>
                        )}
                      </td>
                    ))}
                    {(displaySelect || showBtn) && (
                      <td className="text-foreground p-4 align-middle text-sm font-normal whitespace-nowrap">
                        {showBtn && (
                          <button
                            onClick={() => callback?.(row.clickId)}
                            type="button"
                            className="bg-primary hover:bg-primary/90 focus:ring-primary/50 dark:focus:ring-primary/70 mt-2 rounded-lg px-5 py-2.5 text-sm font-medium focus:ring-2 focus:outline-none"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr className="text-center">
                  <td
                    className="text-muted-foreground p-2 text-center"
                    colSpan={header.length + 1}
                  >
                    Empty data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DataTable
