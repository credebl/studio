import { Alert, Button, Card, Label, Pagination, Spinner } from 'flowbite-react';
import { Field, FieldArray, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import BreadCrumbs from '../../BreadCrumbs';
import * as yup from 'yup';
import { apiStatusCodes, schemaVersionRegex } from '../../../config/CommonConstant';
import SchemaCard from '../../../commonComponents/schemaCard';
import CredDeffCard from '../../../commonComponents/credentialDefinitionCard';
import { createCredentialDefinition, getCredDeffById, getSchemaById } from '../../../api/Schema';
import type { AxiosResponse } from 'axios';
import type { CredDeffFieldNameType } from './interfaces';

interface Values {
  tagName: string;
  revocable: boolean;
}

type SchemaData = {
  schema: {
    attrNames: string[];
    name: string;
    version: string;
    issuerId: string;
  };
  schemaId: string;
  resolutionMetadata: Record<string, unknown>;
  schemaMetadata: {
    didIndyNamespace: string;
    indyLedgerSeqNo: number;
  };
};



const ViewSchemas = () => {
  const [schemaDetails, setSchemaDetails] = useState<SchemaData | undefined>(undefined);
  const [credDeffList, setCredDeffList] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true)
  const [createloader, setCreateLoader] = useState<boolean>(false)
  const [credDeffloader, setCredDeffloader] = useState<boolean>(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailur] = useState<string | null>(null)
  const randomString = Math.floor(1000 + Math.random() * 9000).toString();
  const [orgId, setOrgId] = useState<number>(0)


  const getSchemaDetails = async (id: string, organizationId:number) => {
    setLoading(true)
    const SchemaDetails: AxiosResponse = await getSchemaById(id, organizationId)
    if (SchemaDetails.data.data.response) {
      setSchemaDetails(SchemaDetails.data.data.response)
      setLoading(false)
    }

  }

  const getCredentialDefinitionList = async (id: string) => {
    setCredDeffloader(true)
    const credentialDefinitions: AxiosResponse = await getCredDeffById(id)
    if (credentialDefinitions.data.data.data) {
      setCredDeffList(credentialDefinitions.data.data.data)
      setCredDeffloader(false)
    }

  }
  useEffect(() => {
    const organizationId = localStorage.getItem('orgId');
      setOrgId(Number(organizationId))
    if (window?.location?.search) {
      const str = window?.location?.search
      const schemaId = str.substring(str.indexOf('=') + 1);
      getSchemaDetails(schemaId, Number(organizationId))
      getCredentialDefinitionList(schemaId)
    }

  }, [])


  const submit = async (values: Values) => {
    setCreateLoader(true)
    const CredDeffFieldName: CredDeffFieldNameType = {
      tag: values.tagName,
      revocable: values.revocable,
      orgId: orgId,
      schemaLedgerId: schemaDetails?.schemaId

    }
  
    const createSchema = await createCredentialDefinition(CredDeffFieldName);
    const { data } = createSchema as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setCreateLoader(false)
      setSuccess(data?.message)
    }
    else {
      setFailur(createSchema as string)
      setCreateLoader(false)
    }
    getCredentialDefinitionList(schemaDetails?.schemaId)
    setTimeout(() => {
      setSuccess('')
      setFailur('')
    }, 4000);
  }

  return (
    <>
      <div className="mb-4 col-span-full xl:mb-2">
        <BreadCrumbs />
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Schemas
        </h1>
      </div>
      <div >
        <div
          className="flex p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >

          <Card className='w-1/2 h-64 bg-gradient-to-br from-blue-400 to-purple-400 mr-6'>
            {loading
              ? <div className="flex items-center justify-center mb-4">
                <Spinner
                  color="info"
                />
              </div>
              :
              <div>
                <div className='flex space-between'>
                  <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                    Schema Details
                  </h5>
                  <div className='float-right ml-auto'>
                    <a
                      className="text-sm font-medium hover:underline"
                      href={`http://test.bcovrin.vonx.io/browse/domain`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p>
                        Check on ledger
                      </p>
                    </a>
                  </div>

                </div>
                <div className="">
                  <div>
                    <p>
                      Name: {schemaDetails?.schema.name}
                    </p>
                  </div>
                  <div>
                    <p>
                      Version: {schemaDetails?.schema.version}
                    </p>
                  </div>
                  <p>
                    Schema ID: {schemaDetails?.schemaId}
                  </p>
                  <p >
                    Issuer DID: {schemaDetails?.schema.issuerId}
                  </p>
                </div>
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    <li className="py-3 sm:py-4">
                      <div className="flex items-center space-x-4">
                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                          Attributes:
                          {schemaDetails?.schema?.attrNames && schemaDetails?.schema?.attrNames.length > 0 &&
                            schemaDetails?.schema?.attrNames.map((element: string) => (
                              <span className='m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300'> {element}</span>
                            ))}
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            }
          </Card>
          <Card className='w-1/2 h-64 ml-auto'>
            <div>
              <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                Create Credential definition
              </h5>
            </div>
            <div>
              <Formik
                initialValues={{
                  tagName: `${schemaDetails?.schema.name ? schemaDetails?.schema.name + randomString : ''}`,
                  revocable: false
                }}
                validationSchema={yup.object().shape({
                  tagName: yup
                    .string()
                    .trim()
                    .required('Credential Definition is required'),
                  evocable: yup
                    .bool()

                })}
                validateOnBlur
                validateOnChange
                enableReinitialize
                onSubmit={async (values): Promise<void> => {
                  submit(values)

                }}
              >
                {(formikHandlers): JSX.Element => (
                  <Form onSubmit={formikHandlers.handleSubmit}>
                    <div className=" flex items-center space-x-4">
                      <div className='w-full'>
                        <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          <Label htmlFor="credential-definition" value="Credential Definition" />
                          <span className='text-red-600'>*</span>
                        </div>
                        <Field
                          id="tagName"
                          name="tagName"
                          placeholder="Enter Credential definition"
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        />
                        {
                          (formikHandlers?.errors?.tagName && formikHandlers?.touched?.tagName) &&
                          <span className="text-red-500 text-xs">{formikHandlers?.errors?.tagName}</span>
                        }
                      </div>
                    </div>
                    <div>
                      <div className="custom-control custom-checkbox d-flex align-items-center pt-4 p-2">
                        <Field type="checkbox" id="Revocable" name="revocable" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <Label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300" >
                          Revocable
                        </Label>
                      </div>
                    </div>
                    {
                      (success || failure) &&
                      <Alert
                        color={success ? "success" : "failure"}
                        onDismiss={() => setSuccess(null)}
                      >
                        <span>
                          <p>
                            {success || failure}
                          </p>
                        </span>
                      </Alert>
                    }
                    {/* <div > */}
                    <div className='float-right p-2'>
                      <Button
                        type="submit"
                        isProcessing={createloader}
                        color='bg-primary-800'
                        className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                      >
                        Create
                      </Button>
                    </div>
                    <div className='float-right p-2'>
                      <Button
                        type="reset"
                        className="text-base font-medium text-center text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700"
                      >
                        Reset
                      </Button>
                    </div>
                    {/* </div> */}
                  </Form>
                )}
              </Formik>
            </div>
            {/* <>
                    {errorMessage && <CustomErrorComponent
                        title=''
                        message={errorMessage}
                        alertType='danger'
                    />}
                </> */}
          </Card >


        </div>
      </div>
      <>
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white p-4">
          Credential Definitions
        </h5>
        {/* {loading
            ? <div className="flex items-center justify-center mb-4">
              <Spinner
                color="info"
              />
            </div>
            : */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {credDeffList && credDeffList.length > 0 &&
              credDeffList.map((element, key) => (
                <div className='p-2' key={key}>
                  <CredDeffCard credDeffName={element['tag']} credentialDefinitionId={element['credentialDefinitionId']} schemaId={element['schemaLedgerId']} revocable={element['revocable']} />
                </div>
              ))}
          </div>
          <div className="flex items-center justify-end mb-4">
            <Pagination
              currentPage={1}
              onPageChange={() => {
              }}
              totalPages={0}
            />
          </div>
        </div>
        {/* } */}
      </>
    </>
  )
}


export default ViewSchemas


