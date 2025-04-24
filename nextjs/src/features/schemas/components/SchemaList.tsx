'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  apiStatusCodes,
  itemPerPage
} from '../../../config/CommonConstant';
import { pathRoutes } from '../../../config/pathRoutes';
import { useAppSelector } from '@/lib/hooks';
import { getAllSchemas, getAllSchemasByOrgId } from '@/app/api/schema';
import SchemaCard from './SchemaCard';
import { EmptyMessage } from '@/components/EmptyMessage';
import { Input } from '@/components/ui/input';
import { IconSearch } from '@tabler/icons-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { GetAllSchemaListParameter } from '@/features/dashboard/type/schema';
import { AxiosResponse } from 'axios';
import { getOrganizationById } from '@/app/api/organization';
import { DidMethod, SchemaTypes } from '@/common/enums';
import { IW3cSchemaDetails, SchemaDetails } from '../type/schemas-interface';

const SchemaList = (props: {
  schemaSelectionCallback: (
    schemaId: string,
    schemaDetails: SchemaDetails
  ) => void;

  W3CSchemaSelectionCallback: (
    schemaId: string,
    w3cSchemaDetails: IW3cSchemaDetails
  ) => void;

  verificationFlag?: boolean;
}) => {
  const verificationFlag = props.verificationFlag ?? false;
  const organizationId = useAppSelector((state) => state.organization.orgId);
  const ledgerId = useAppSelector((state) => state.organization.ledgerId);
  const [schemaList, setSchemaList] = useState([]);
  const [schemaListErr, setSchemaListErr] = useState<string | null>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [allSchemaFlag, setAllSchemaFlag] = useState<boolean>(false);
  const [schemaType, setSchemaType] = useState('');
  const [walletStatus, setWalletStatus] = useState(false);
  const [totalItem, setTotalItem] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [selectedValue, setSelectedValue] = useState<string>(
    `Organization's schema`
  );
  const [w3cSchema, setW3CSchema] = useState<boolean>(false);
  const [isNoLedger, setIsNoLedger] = useState<boolean>(false);

  const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
    itemPerPage: itemPerPage,
    page: 1,
    search: '',
    sortBy: 'id',
    sortingOrder: 'desc',
    allSearch: ''
  });



  const getSchemaList = async (
    schemaListAPIParameter: GetAllSchemaListParameter,
    flag: boolean
  ) => {
    try {
      setLoading(true);
      let schemaResponse;

      if (allSchemaFlag) {
        schemaResponse = await getAllSchemas(
          schemaListAPIParameter,
          schemaType,
          ledgerId
        );
      } else {
        schemaResponse = await getAllSchemasByOrgId(
          schemaListAPIParameter,
          organizationId
        );
      }

      const { data } = schemaResponse as AxiosResponse;

      if (schemaResponse === 'Schema records not found') {
        setSchemaList([]);
        setLoading(false);
        return;
      }

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (data?.data?.data) {
          setTotalItem(data?.data?.lastPage);
          setSchemaList(data?.data?.data);
        } else {
          setSchemaListErr(schemaResponse as string);
        }
      } else {
        setSchemaListErr(schemaResponse as string);
      }
    } catch (error) {
      console.error('Error while fetching schema list:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setSchemaListErr(''), 3000);
    }
  };

  const fetchOrganizationDetails = async () => {
    setLoading(true);
    const response = await getOrganizationById(organizationId);
    const { data } = response as AxiosResponse;

    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const did = data?.data?.org_agents?.[0]?.orgDid;

      // await setToLocalStorage(storageKeys.ORG_DID, did)
      if (data?.data?.org_agents && data?.data?.org_agents.length > 0) {
        setWalletStatus(true);
      }

      if (
        did.includes(DidMethod.POLYGON) ||
        did.includes(DidMethod.KEY) ||
        did.includes(DidMethod.WEB)
      ) {
        setW3CSchema(true);
        setSchemaType(SchemaTypes.schema_W3C);
      }

      if (did.includes(DidMethod.INDY)) {
        setW3CSchema(false);
        setSchemaType(SchemaTypes.schema_INDY);
      }

      if (did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
        setIsNoLedger(true);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    setSelectedValue(`Organization's schema`);
    fetchOrganizationDetails();
  }, []);

  useEffect(() => {
    getSchemaList(schemaListAPIParameter, false);
  }, [schemaListAPIParameter, allSchemaFlag]);

  const onSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    const inputValue = event.target.value;
    setSearchValue(inputValue);

    const updatedParams = {
      ...schemaListAPIParameter,
      search: allSchemaFlag ? '' : inputValue,
      allSearch: allSchemaFlag ? inputValue : ''
    };

    setSchemaListAPIParameter(updatedParams);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const isAllSchemas = value === 'all';

    setSelectedValue(value);
    setAllSchemaFlag(isAllSchemas);

    // await setToLocalStorage(storageKeys.ALL_SCHEMAS, isAllSchemas ? `true` : `false`);
    setSchemaListAPIParameter((prev) => ({ ...prev, page: 1 }));
  };

  const schemaSelectionCallback = ({
    schemaId,
    attributes,
    issuerDid,
    created
  }: {
    schemaId: string;
    attributes: string[];
    issuerDid: string;
    created: string;
  }) => {
    const schemaDetails = {
      attribute: attributes,
      issuerDid,
      createdDate: created
    };
    props.schemaSelectionCallback(schemaId, schemaDetails);
  };

  const W3CSchemaSelectionCallback = ({
    schemaId,
    schemaName,
    version,
    issuerDid,
    attributes,
    created
  }: {
    schemaId: string;
    schemaName: string;
    version: string;
    issuerDid: string;
    attributes: [];
    created: string;
  }) => {
    const w3cSchemaDetails = {
      schemaId,
      schemaName,
      version,
      issuerDid,
      attributes,
      created
    };
    props.W3CSchemaSelectionCallback(schemaId, w3cSchemaDetails);
    // await setToLocalStorage(storageKeys.W3C_SCHEMA_DATA, w3cSchemaDetails);
  };

  const handleW3CIssue = async (
    schemaId: string,
    schemaName: string,
    version: string,
    issuerDid: string,
    attributes: [],
    created: string
  ) => {
    const schemaDetails = {
      schemaId,
      schemaName,
      version,
      issuerDid,
      attributes,
      created
    };
    // await setToLocalStorage(storageKeys.W3C_SCHEMA_DETAILS, schemaDetails);
  };

  return (
    <PageContainer>
      <div className='px-4 pt-2'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
          <h1 className='mr-auto ml-1 text-xl font-semibold sm:text-2xl'>
            Schemas
          </h1>

          <div className='relative w-full max-w-sm'>
            <Input
              type='text'
              placeholder='Search...'
              value={searchValue}
              onChange={onSearch}
              className='bg-background text-muted-foreground focus-visible:ring-primary h-10 rounded-lg pr-4 pl-10 text-sm shadow-sm focus-visible:ring-1'
            />
            <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2' />
          </div>

          <select
            onChange={handleFilterChange}
            value={allSchemaFlag ? 'all' : 'org'}
            className='bg-background text-foreground h-full min-h-[42px] rounded-lg border p-2.5 sm:text-sm'
          >
            <option value='org'>Organization&apos;s schema</option>
            <option value='all'>All schemas</option>
          </select>

          <Button>
            <Plus /> Create
          </Button>
        </div>

        {schemaListErr && (
          <div className='text-destructive mb-2'>{schemaListErr}</div>
        )}

        {loading ? (
          <p>Loading.......</p>
        ) : schemaList.length ? (
          <>
            <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
              {schemaList &&
                schemaList.length > 0 &&
                schemaList.map((element, key) => (
                  <div className='px-0 sm:px-2' key={`SchemaList-${key}`}>
                    <SchemaCard
                      schemaName={element['name']}
                      version={element['version']}
                      schemaId={element['schemaLedgerId']}
                      issuerDid={element['issuerId']}
                      attributes={element['attributes']}
                      created={element['createDateTime']}
                      showCheckbox={false}
                      onClickCallback={schemaSelectionCallback}
                      onClickW3CCallback={W3CSchemaSelectionCallback}
                      onClickW3cIssue={handleW3CIssue}
                      w3cSchema={w3cSchema}
                      noLedger={isNoLedger}
                      isVerification={verificationFlag}
                    />
                  </div>
                ))}
            </div>

            <div className='mt-6 flex justify-end'>
              <Pagination>
                <PaginationContent>
                  {schemaListAPIParameter.page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href='#'
                        onClick={() =>
                          setSchemaListAPIParameter((prev) => ({
                            ...prev,
                            page: prev.page - 1
                          }))
                        }
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalItem }).map((_, index) => {
                    const page = index + 1;
                    const isActive = page === schemaListAPIParameter.page;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={isActive}
                          href='#'
                          onClick={() =>
                            setSchemaListAPIParameter((prev) => ({
                              ...prev,
                              page
                            }))
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  {schemaListAPIParameter.page < totalItem && (
                    <PaginationItem>
                      <PaginationNext
                        href='#'
                        onClick={() =>
                          setSchemaListAPIParameter((prev) => ({
                            ...prev,
                            page: prev.page + 1
                          }))
                        }
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </>
        ) : (
          <EmptyMessage
            title='No Schemas'
            description='Get started by creating a new Schema'
            buttonContent='Create Schema'
            svgComponent='Create'
            onClick={() => {
              window.location.href = `${pathRoutes.organizations.createSchema}`;
            }}
          />
        )}
      </div>
    </PageContainer>
  );
};

export default SchemaList;
