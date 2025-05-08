'use client';
import { Main } from '@/components/layout/main';
import {
  getColumns,
  IColumnData,
  ITableMetadata,
  TableStyling
} from '../../components/ui/generic-table-component/columns';
import { DataTable } from '../../components/ui/generic-table-component/data-table';
import { useAppSelector } from '@/lib/hooks';
import { getConnectionsByOrg } from '@/app/api/connection';
import { useEffect, useState } from 'react';
import { Connection } from './types/connections-interface';

export default function Connections() {
  const metadata: ITableMetadata = {
    enableSelection: true,
  };
  const orgId = useAppSelector((state) => state.organization.orgId);
  const [connectionData, setConnectionData] = useState<Connection[]>([{
    createDateTime: '',
    createdBy: '',
    orgId: '',
    state: '',
    theirLabel: '',
    connectionId: ''
  }]);
	const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
	const [pageCount, setPageCount] = useState(1);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState('createDateTime');

  useEffect(() => {
    if (!orgId) return;
    async function fetchConnections() {
      try {
        const connectionList = await getConnectionsByOrg({
          itemPerPage: pageSize,
          page: pageIndex + 1,
          search: searchTerm,
          sortBy: sortBy,
          sortingOrder: 'desc',
          orgId
        });

        if (connectionList && Array.isArray(connectionList.data)) {
          setConnectionData(connectionList.data || []);
          setPageCount(connectionList.lastPage || 1);
        } else {
          setConnectionData([]);
          setPageCount(1);
        }
      } catch (error) {
        console.error('Failed to fetch connections:', error);
        setConnectionData([]);
      }
    }

    fetchConnections();
  }, [orgId, pageIndex, pageSize, searchTerm]); // Rerun if orgId change


  const columnData: IColumnData[] = [
    {
      id: 'theirLabel',
      title: 'Their Label',
      accessorKey: 'theirLabel',
      columnFunction: ['hide', {
					sortCallBack: async (order) => {
            setSortBy('theirLabel');
            const connections = await getConnectionsByOrg({
              itemPerPage: pageSize,
              page: pageIndex + 1,
              search: searchTerm,
              sortBy: sortBy,
              sortingOrder: order,
              orgId
            });

            if (connections && Array.isArray(connections.data)) {
              setConnectionData(connections.data || []);
            } else {
              setConnectionData([]);
            }
          }
        }
      ],
    },
    {
      id: 'connectionId',
      title: 'connectionId',
      accessorKey: 'connectionId',
      columnFunction: ['hide', 'sort']
      // cell:<div></div> // Optional if we want to send our own cell
    },
    {
      id: 'state',
      title: 'state',
      accessorKey: 'state',
      columnFunction: ['hide']
      // cell:<div></div> // Optional if we want to send our own cell
    },
    {
      id: 'orgId',
      title: 'orgId',
      accessorKey: 'orgId',
      columnFunction: ['hide']
      // cell:<div></div> // Optional if we want to send our own cell
    },
    {
      id: 'createdBy',
      title: 'createdBy',
      accessorKey: 'createdBy',
      columnFunction: ['hide']
      // cell:<div></div> // Optional if we want to send our own cell
    },
    {
      id: 'createDateTime',
      title: 'createDateTime',
      accessorKey: 'createDateTime',
      columnFunction: [
        {
					sortCallBack: async (order) => {
            setSortBy('createDateTime');
            const connections = await getConnectionsByOrg({
              itemPerPage: pageSize,
              page: pageIndex + 1,
              search: searchTerm,
              sortBy: sortBy,
              sortingOrder: order,
              orgId
            });

            if (connections && Array.isArray(connections.data)) {
              setConnectionData(connections.data || []);
            } else {
              setConnectionData([]);
            }
          }
        }
      ]
      // cell:<div></div> // Optional if we want to send our own cell
    }
  ];

  const tableStyling: TableStyling = { metadata, columnData };
  const column = getColumns<Connection>(tableStyling);

  return (
    <Main>
      <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Connections</h2>
          <p className='text-muted-foreground'>
            Here&apos;s a list of Connection!
          </p>
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <DataTable
          data={connectionData}
          columns={column}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          onPageChange={setPageIndex} // Function to handle pageIndex change
          onPageSizeChange={(size) => {
            // Function to handle pageSize change
            setPageSize(size);
            setPageIndex(0);
          }}
          onSearchTerm={setSearchTerm} // Function to handle searchTerm change
        />
      </div>
    </Main>
  );
}
