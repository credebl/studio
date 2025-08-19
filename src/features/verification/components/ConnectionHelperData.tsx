import {
  ConnectionIdCell,
  CreatedOnCell,
  IConnectionList,
  TheirLabelCell,
} from './ConnectionListCells'

import { IColumnData } from '@/components/ui/generic-table-component/columns'
import { IConnectionListAPIParameter } from '@/app/api/connection'
import { SelectCheckboxCell } from '../../organization/connectionIssuance/components/ConnectionListCells'

export const generateColumns = (
  setListAPIParameter: React.Dispatch<
    React.SetStateAction<IConnectionListAPIParameter>
  >,
  selectOrganization: (
    item: IConnectionList,
    checked: boolean,
  ) => Promise<void>,
): IColumnData[] => [
  {
    id: 'select',
    title: '',
    accessorKey: 'select',
    columnFunction: ['hide'],
    cell: ({ row }) => (
      <SelectCheckboxCell
        connection={row.original}
        getIsSelected={row.getIsSelected}
        getToggleSelectedHandler={row.getToggleSelectedHandler}
        onSelect={selectOrganization}
      />
    ),
  },
  {
    id: 'theirLabel',
    title: 'User',
    accessorKey: 'theirLabel',
    columnFunction: [
      {
        sortCallBack: async (order) =>
          setListAPIParameter((prev) => ({
            ...prev,
            sortBy: 'theirLabel',
            sortingOrder: order,
          })),
      },
    ],
    cell: ({ row }) => <TheirLabelCell label={row.original.theirLabel} />,
  },
  {
    id: 'connectionId',
    title: 'Connection ID',
    accessorKey: 'connectionId',
    columnFunction: [
      {
        sortCallBack: async (order) =>
          setListAPIParameter((prev) => ({
            ...prev,
            sortBy: 'connectionId',
            sortingOrder: order,
          })),
      },
    ],
    cell: ({ row }) => (
      <ConnectionIdCell connectionId={row.original.connectionId} />
    ),
  },
  {
    id: 'createDateTime',
    title: 'Created on',
    accessorKey: 'createDateTime',
    columnFunction: [
      {
        sortCallBack: async (order) =>
          setListAPIParameter((prev) => ({
            ...prev,
            sortBy: 'createDateTime',
            sortingOrder: order,
          })),
      },
    ],
    cell: ({ row }) => <CreatedOnCell date={row.original.createDateTime} />,
  },
]
