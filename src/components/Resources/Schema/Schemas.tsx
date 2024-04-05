import { setToLocalStorage } from "../../../api/Auth"
import { storageKeys } from "../../../config/CommonConstant"
import { pathRoutes } from "../../../config/pathRoutes"
import SchemaList from "./SchemasList"

const Schemas = () => {
    const schemaSelectionCallback = async (schemaId: string, attributes:any) => {
        await setToLocalStorage(storageKeys.SCHEMA_ATTR, attributes)
        window.location.href = `${pathRoutes.organizations.viewSchema}/${encodeURIComponent(schemaId)}`
    }
  };

  const createSchema = () => {
    window.location.href = `${pathRoutes.organizations.createSchema}?OrgId=${orgId}`
  }

  useEffect(() => {
    getSchemaList(schemaListAPIParameter)
  }, []);

  useEffect(() => {
    getSchemaList(schemaListAPIParameter)

  }, [schemaListAPIParameter])

  const onSearch = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    event.preventDefault()
    setSchemaListAPIParameter({
      ...schemaListAPIParameter,
      search: event.target.value
    })

    getSchemaList({
      ...schemaListAPIParameter,
      search: event.target.value
    })

  }
  return (
    <div className="px-4 pt-6">
      <div className="pl-5 mb-4 col-span-full xl:mb-2">
        <BreadCrumbs />
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Schemas
        </h1>
      </div>
      <div>
        <div
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >
          <div className="flex flex-col items-center justify-between mb-4 pr-4 sm:flex-row">
            <div id='schemasSearchInput' className='mb-2 pl-2'>
              <SearchInput
                onInputChange={onSearch}
              />
            </div>
            <Button
              id='createSchemaButton'
              onClick={createSchema}
              className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
            > <svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
              </svg>

              Create
            </Button>
          </div>
          {
            schemaListErr &&
            <Alert
              color="failure"
              onDismiss={() => setSchemaListErr(null)}
            >
              <span>
                <p>
                  {schemaListErr}
                </p>
              </span>
            </Alert>
          }
          {loading
            ? (<div className="flex items-center justify-center mb-4">
              <Spinner
                color="info"
              />
            </div>)
            :
            schemaList && schemaList.length > 0 ? (

              <div className='Flex-wrap' style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
                  {schemaList.map((element, key) => (
                    <div className='p-2' key={key}>
                      <SchemaCard schemaName={element['name']} version={element['version']} schemaId={element['schemaLedgerId']} issuerDid={element['issuerId']} attributes={element['attributes']} created={element['createDateTime']} />
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end mb-4" id="schemasPagination">

                  <Pagination
                    currentPage={1}
                    onPageChange={(page) => {
                      setSchemaListAPIParameter(prevState => ({
                        ...prevState,
                        page: page
                      }));
                    }}
                    totalPages={0}
                  />
                </div>
              </div>) : (<EmptyListMessage
                message={'No Schemas'}
                description={'Get started by creating a new Schema'}
                buttonContent={'Create Schema'}
                svgComponent={<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                </svg>}
                onClick={createSchema}
              />)
          }
        </div>
      </div>
    </div>

  )
}

export  default Schemas