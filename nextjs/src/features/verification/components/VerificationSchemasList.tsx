'use client';
import { getAllSchemas, getAllSchemasByOrgId } from '@/app/api/schema';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { AxiosResponse } from 'axios';
import { ChangeEvent, useEffect, useState } from 'react';
import { IAttributesDetails, ISchema, ISchemaData } from '../type/interface';
import { apiStatusCodes, itemPerPage } from '@/config/CommonConstant';
import { getOrganizationById } from '@/app/api/organization';
import { DidMethod, Features, SchemaTypes } from '@/common/enums';
import { pathRoutes } from '@/config/pathRoutes';
import { Button } from '@/components/ui/button';
import Loader from '@/components/Loader';
import { EmptyMessage } from '@/components/EmptyMessage';
import SchemaCard from '@/features/schemas/components/SchemaCard';
import RoleViewButton from '@/components/RoleViewButton';
import { Input } from '@/components/ui/input';
import { IconSearch } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { checkEcosystem, type ICheckEcosystem } from '@/config/ecosystem';
import { Create, SchemaEndorsement } from '@/config/Constant';
import PageContainer from '@/components/layout/page-container';
import { Alert } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  setSchemaAttributes,
  setSchemaId,
  setSelectedSchemasData,
  setW3CSchemaAttributes
} from '@/lib/verificationSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const VerificationSchemasList = (): JSX.Element => {
  const [schemasList, setSchemasList] = useState([]);
  const [schemasDetailsErr, setSchemasDetailsErr] = useState<string | null>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [allSchemasFlag, setAllSchemasFlag] = useState<boolean>(false);
  const [schemasListParameter, setSchemasListParameter] = useState({
    itemPerPage: itemPerPage,
    page: 1,
    search: '',
    sortBy: 'id',
    sortingOrder: 'desc',
    allSearch: ''
  });
  const [walletStatus, setWalletStatus] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [selectedSchemas, setSelectedSchemas] = useState<ISchema[]>([]);
  const [selectedSchemaArray, setSelectedSchemaArray] = useState<ISchema[]>([]);

  const [w3cSchema, setW3cSchema] = useState<boolean>(false);
  const [isNoLedger, setIsNoLedger] = useState<boolean>(false);
  const [schemaType, setSchemaType] = useState('');
  const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>();

  const route = useRouter();
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector((state) => state.organization.orgId);
  const ledgerId = useAppSelector((state) => state.organization.ledgerId);

  const getSchemaListDetails = async () => {
    try {
      setLoading(true);
      let schemasList;
      if (allSchemasFlag) {
        schemasList = await getAllSchemas(
          schemasListParameter,
          schemaType,
          ledgerId
        );
      } else {
        schemasList = await getAllSchemasByOrgId(
          schemasListParameter,
          organizationId
        );
      }

      const { data } = schemasList as AxiosResponse;

      if (schemasList === 'Schema records not found') {
        setLoading(false);
        setSchemasList([]);
      }

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        if (data?.data?.data) {
          setTotalItems(data?.data?.lastPage);
          setSchemasList(data?.data?.data);
          setLoading(false);
        } else {
          setLoading(false);
          if (schemasList !== 'Schema records not found') {
            setSchemasDetailsErr(schemasList as string);
          }
        }
      } else {
        setLoading(false);
        if (schemasList !== 'Schema records not found') {
          setSchemasDetailsErr(schemasList as string);
        }
      }
      setTimeout(() => {
        setSchemasDetailsErr('');
      }, 3000);
    } catch (error) {
      console.error('Error while fetching schema list:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getSchemaListDetails();
  }, [schemasListParameter, allSchemasFlag]);

  const onSchemaListParameterSearch = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    event.preventDefault();
    const inputValue = event.target.value;
    setSearchValue(inputValue);
    if (allSchemasFlag) {
      setSchemasListParameter((prevParams) => ({
        ...prevParams,
        allSearch: inputValue,
        page: 1
      }));
    } else {
      setSchemasListParameter((prevParams) => ({
        ...prevParams,
        search: inputValue,
        page: 1
      }));
    }
  };

  const handleSchemaSelection = (
    schemaId: string,
    attributes: IAttributesDetails[],
    issuerId: string,
    created: string,
    checked: boolean
  ) => {
    const schemaDetails = {
      schemaId: schemaId,
      attributes: attributes,
      issuerId: issuerId,
      createdDate: created
    };

    if (checked) {
      setSelectedSchemas((prevSelectedSchemas) => [
        ...prevSelectedSchemas,
        schemaDetails
      ]);
    } else {
      setSelectedSchemas((prevSelectedSchemas) =>
        prevSelectedSchemas.filter((schema) => schema.schemaId !== schemaId)
      );
    }
  };

  const handleW3cSchemas = async (
    checked: boolean,
    schemaData?: ISchemaData
  ) => {
    if (!schemaData) return;

    const schema: ISchema = {
      ...schemaData,
      schemaId: schemaData.schemaId ?? '',
      createdDate: schemaData.createDateTime
    };

    const updateSchemas = (prevSchemas: ISchema[]) => {
      let updatedSchemas = [...prevSchemas];
      if (checked) {
        updatedSchemas = [...updatedSchemas, schema];
      } else {
        updatedSchemas = updatedSchemas.filter(
          (schema) => schema?.schemaLedgerId !== schema?.schemaLedgerId
        );
      }

      return updatedSchemas;
    };

    setSelectedSchemas((prevSchemas) => {
      if (!Array.isArray(prevSchemas)) {
        console.error('Previous schemas is not an array:', prevSchemas);
        return [];
      }

      const updatedSchemas = updateSchemas(prevSchemas);
      setSelectedSchemaArray(updatedSchemas);
      dispatch(setSelectedSchemasData(updatedSchemas));
      return updatedSchemas;
    });
  };

  const fetchOrganizationDetails = async () => {
    setLoading(true);
    const response = await getOrganizationById(organizationId);
    const { data } = response as AxiosResponse;
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const did = data?.data?.org_agents?.[0]?.orgDid;

      if (data?.data?.org_agents && data?.data?.org_agents?.length > 0) {
        setWalletStatus(true);
      }
      if (
        did.includes(DidMethod.POLYGON) ||
        did.includes(DidMethod.KEY) ||
        did.includes(DidMethod.WEB)
      ) {
        setW3cSchema(true);
        setSchemaType(SchemaTypes.schema_W3C);
      }
      if (did.includes(DidMethod.INDY)) {
        setW3cSchema(false);
        setSchemaType(SchemaTypes.schema_INDY);
      }
      if (did.includes(DidMethod.KEY) || did.includes(DidMethod.WEB)) {
        setIsNoLedger(true);
      }
    }
    setLoading(false);
  };

  const handleContinue = async () => {
    const schemaIds = selectedSchemas?.map((schema) => schema?.schemaId);
    dispatch(setSchemaId(schemaIds));

    const schemaAttributes = selectedSchemas.map((schema) => ({
      schemaId: schema.schemaId,
      attributes: schema.attributes
    }));

    dispatch(setSchemaAttributes(schemaAttributes));
    route.push(`${pathRoutes.organizations.verification.emailCredDef}`);
  };

  const handleW3CSchemaDetails = async () => {
    const w3cSchemaAttributes = selectedSchemaArray
      .filter((schema) => schema.schemaLedgerId)
      .map((schema) => ({
        schemaId: schema.schemaLedgerId ?? '',
        attributes: schema.attributes,
        schemaName: schema.name ?? ''
      }));

    dispatch(setW3CSchemaAttributes(w3cSchemaAttributes));
    route.push(`${pathRoutes.organizations.verification.w3cAttributes}`);
  };

  const options = ['All schemas'];
  const optionsWithDefault = ["Organization's schema", ...options];

  const handleFilter = async (value: string) => {
    const selectedFilter = value;
    setAllSchemasFlag(selectedFilter === 'All schemas');

    setSchemasListParameter((prevParams) => ({
      ...prevParams,
      page: 1,
      search: '',
      allSearch: ''
    }));
    setSearchValue('');
  };
  useEffect(() => {
    fetchOrganizationDetails();
    (async () => {
      try {
        const data: ICheckEcosystem = await checkEcosystem();
        setIsEcosystemData(data);
      } catch (error) {
        console.error(error);
      }
    })();
    setSearchValue('');
  }, []);

  const createSchemaButtonTitle = isEcosystemData?.isEcosystemMember
    ? {
        title: 'Schema Endorsement',
        toolTip: 'Add new schema request',
        svg: <SchemaEndorsement />
      }
    : { title: 'Create', svg: <Create />, toolTip: 'Create new schema' };
  const emptySchemaListTitle = 'No Schemas';
  const emptySchemaListDescription = 'Get started by creating a new Schema';
  const emptySchemaListBtn = isEcosystemData?.isEcosystemMember
    ? { title: 'Schema Endorsement', svg: <SchemaEndorsement /> }
    : { title: 'Create Schema', svg: <Create /> };
  return (
    <PageContainer>
      <div className='px-4 pt-2'>
        <div>
          <div>
            <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
              <h1 className='text-primary-foreground mr-auto ml-1 text-xl font-semibold sm:text-2xl'>
                Schemas
              </h1>
              <div className='relative w-full sm:max-w-sm'>
                <Input
                  type='text'
                  placeholder='Search...'
                  value={searchValue}
                  onChange={onSchemaListParameterSearch}
                  className='bg-background text-muted-foreground focus-visible:ring-primary h-10 rounded-lg pr-4 pl-10 text-sm shadow-sm focus-visible:ring-1'
                />
                <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2' />
              </div>

              <Select
                defaultValue="Organization's schema"
                onValueChange={handleFilter}
              >
                <SelectTrigger className='focus:border-primary focus:ring-primary dark:focus:border-primary dark:focus:ring-primary min-h-[42px] w-[230px] rounded-lg border p-2.5 text-sm'>
                  <SelectValue placeholder='Select schema type' />
                </SelectTrigger>
                <SelectContent>
                  {optionsWithDefault.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className='bg-primary text-foreground flex space-x-2'>
                {walletStatus ? (
                  <RoleViewButton
                    title={createSchemaButtonTitle.toolTip}
                    buttonTitle={createSchemaButtonTitle.title}
                    feature={Features.CRETAE_SCHEMA}
                    svgComponent={createSchemaButtonTitle.svg}
                    onClickEvent={() => {
                      route.push(`${pathRoutes.organizations.createSchema}`);
                    }}
                  />
                ) : (
                  <RoleViewButton
                    buttonTitle={createSchemaButtonTitle.title}
                    feature={Features.CRETAE_SCHEMA}
                    svgComponent={createSchemaButtonTitle.svg}
                    onClickEvent={() => {
                      route.push(`${pathRoutes.organizations.dashboard}`);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          {schemasDetailsErr !== '' && (
            <Alert color='failure'>
              <span>
                <p>{schemasDetailsErr}</p>
              </span>
            </Alert>
          )}

          {schemasList && schemasList.length > 0 ? (
            <div
              className='Flex-wrap'
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div className='mt-0 mb-4 grid w-full grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-2'>
                {schemasList &&
                  schemasList.length > 0 &&
                  schemasList.map((element) => (
                    <div
                      className='px-0 sm:px-2'
                      key={element['schemaLedgerId']}
                    >
                      <SchemaCard
                        selectedSchemas={selectedSchemas}
                        schemaName={element['name']}
                        version={element['version']}
                        schemaId={element['schemaLedgerId']}
                        issuerDid={element['issuerId']}
                        attributes={element['attributes']}
                        created={element['createDateTime']}
                        showCheckbox={true}
                        isClickable={false}
                        w3cSchema={w3cSchema}
                        noLedger={isNoLedger}
                        isVerificationUsingEmail={true}
                        onChange={(checked) => {
                          w3cSchema
                            ? handleW3cSchemas(checked, element)
                            : handleSchemaSelection(
                                element['schemaLedgerId'],
                                element['attributes'],
                                element['issuerId'],
                                element['createDateTime'],
                                checked
                              );
                        }}
                      />
                    </div>
                  ))}
              </div>

              <div className='mb-4 flex items-center justify-end'>
                <Button
                  onClick={w3cSchema ? handleW3CSchemaDetails : handleContinue}
                  disabled={selectedSchemas.length === 0}
                  className='flex items-center gap-2 rounded-lg px-4 py-4 text-base font-medium sm:w-auto'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5 text-current'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <path
                      fill='currentColor'
                      d='M12.516 6.444a.556.556 0 1 0-.787.787l4.214 4.214H4.746a.558.558 0 0 0 0 1.117h11.191l-4.214 4.214a.556.556 0 0 0 .396.95.582.582 0 0 0 .397-.163l5.163-5.163a.553.553 0 0 0 .162-.396.576.576 0 0 0-.162-.396l-5.163-5.164Z'
                    />
                    <path
                      fill='currentColor'
                      d='M12.001 0a12 12 0 0 0-8.484 20.485c4.686 4.687 12.283 4.687 16.969 0 4.686-4.685 4.686-12.282 0-16.968A11.925 11.925 0 0 0 12.001 0Zm0 22.886c-6 0-10.884-4.884-10.884-10.885C1.117 6.001 6 1.116 12 1.116s10.885 4.885 10.885 10.885S18.001 22.886 12 22.886Z'
                    />
                  </svg>
                  Continue
                </Button>
              </div>
              <div
                className='mb-4 flex items-center justify-end'
                id='schemasPagination'
              >
                {totalItems > 1 && (
                  <div className='mt-6 flex justify-end'>
                    <Pagination>
                      <PaginationContent>
                        {schemasListParameter.page > 1 && (
                          <PaginationItem>
                            <PaginationPrevious
                              href='#'
                              onClick={(e) => {
                                e.preventDefault();
                                setSchemasListParameter((prev) => ({
                                  ...prev,
                                  page: prev.page - 1
                                }));
                              }}
                            />
                          </PaginationItem>
                        )}

                        {Array.from({ length: totalItems })
                          .map((_, i) => i + 1)
                          .filter((page) => {
                            return (
                              page === 1 ||
                              page === totalItems ||
                              Math.abs(page - schemasListParameter.page) <= 1
                            );
                          })
                          .reduce<(number | string)[]>((acc, page, i, arr) => {
                            if (
                              i > 0 &&
                              typeof page === 'number' &&
                              typeof arr[i - 1] === 'number' &&
                              page - (arr[i - 1] as number) > 1
                            ) {
                              acc.push('...');
                            }
                            acc.push(page);
                            return acc;
                          }, [])
                          .map((page, idx) =>
                            page === '...' ? (
                              <span
                                key={`ellipsis-${idx}`}
                                className='text-muted-foreground px-2'
                              >
                                ...
                              </span>
                            ) : (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  href='#'
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSchemasListParameter((prev) => ({
                                      ...prev,
                                      page: page as number
                                    }));
                                  }}
                                  className={`rounded-lg px-4 py-2 ${
                                    schemasListParameter.page === page
                                      ? 'bg-primary text-[var(--color-white)]'
                                      : 'bg-background text-muted-foreground'
                                  }`}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          )}

                        {schemasListParameter.page < totalItems && (
                          <PaginationItem>
                            <PaginationNext
                              href='#'
                              onClick={(e) => {
                                e.preventDefault();
                                setSchemasListParameter((prev) => ({
                                  ...prev,
                                  page: prev.page + 1
                                }));
                              }}
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className='mb-4 flex items-center justify-center'>
                  <Loader />
                </div>
              ) : (
                <div className='border-border bg-background rounded-lg border shadow-sm sm:p-6 2xl:col-span-2'>
                  <EmptyMessage
                    title={emptySchemaListTitle}
                    description={emptySchemaListDescription}
                    buttonContent={emptySchemaListBtn.title}
                    svgComponent={emptySchemaListBtn.svg}
                    onClick={() => {
                      route.push(`${pathRoutes.organizations.createSchema}`);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default VerificationSchemasList;
