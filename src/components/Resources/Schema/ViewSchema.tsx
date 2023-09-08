import { Alert, Button, Card, Label, Pagination } from 'flowbite-react';
import { Field, FieldArray, Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import BreadCrumbs from '../../BreadCrumbs';
import * as yup from 'yup';
import { apiStatusCodes, schemaVersionRegex, storageKeys } from '../../../config/CommonConstant';
import SchemaCard from '../../../commonComponents/SchemaCard';
import CredDeffCard from '../../../commonComponents/CredentialDefinitionCard';
import { createCredentialDefinition, getCredDeffById, getSchemaById } from '../../../api/Schema';
import type { AxiosResponse } from 'axios';
import type { CredDeffFieldNameType } from './interfaces';
import { getFromLocalStorage, setToLocalStorage } from '../../../api/Auth';
import { EmptyListMessage } from '../../EmptyListComponent';
import { nanoid } from 'nanoid';
import { pathRoutes } from '../../../config/pathRoutes';
import CustomSpinner from '../../CustomSpinner';

interface Values {
  tagName: string;
  revocable: boolean;
}

interface SchemaData {
  schemaName: string;
  version: string;
  issuerDid: string;
  schemaId: string;
  attributes: string[];
  createdDateTime: string;
};

const ViewSchemas = () => {
  const [schemaDetails, setSchemaDetails] = useState<SchemaData | null >(null);
  const [credDeffList, setCredDeffList] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true)
  const [createloader, setCreateLoader] = useState<boolean>(false)
  const [credDeffloader, setCredDeffloader] = useState<boolean>(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [credDefListErr, setCredDefListErr] = useState<string | null>(null)
  const [schemaDetailErr, setSchemaDetailErr] = useState<string | null>(null)
  const [failure, setFailur] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<number>(0)
  const [credDefAuto, setCredDefAuto] = useState<string>('')

  const getSchemaDetails = async () => {

    try {
      const schemaDetails = await getFromLocalStorage(storageKeys.SCHEMA_ATTR)
      const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID)
      const parts = schemaId.split(":");
      const schemaName = parts[2];
      const version = parts[3];
      const schemaDidObject = JSON.parse(schemaDetails)
      schemaDidObject.schema = schemaId;

      await setToLocalStorage(storageKeys.SCHEMA_ID, schemaId)
      if (schemaDidObject) {
        console.log(schemaDetails);
        setLoading(false);
        setSchemaDetails({
          attributes: schemaDidObject.attribute,
          schemaId: schemaId,
          schemaName: schemaName,
          version: version,
          issuerDid: schemaDidObject.issuerDid,
          createdDateTime: schemaDidObject.createdDateTime

        })
      }
      setLoading(false);

    } catch (error) {
      setSchemaDetailErr('Error while fetching schema details')
      setLoading(false);
    }
  };

  const getCredentialDefinitionList = async (id: string, orgId: number) => {
    try {
      setCredDeffloader(true);
      const credentialDefinitions = await getCredDeffById(id, orgId);
      const { data } = credentialDefinitions as AxiosResponse
      if (data?.data?.data.length === 0) {
        setCredDefListErr('No Data Found');
      }
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setCredDeffList(data?.data?.data);
        setCredDeffloader(false);
      } else {
        setCredDefListErr(credentialDefinitions as string)
        setCredDeffloader(false)
      }
    } catch (error) {
      console.error('Error while fetching credential definition list:', error);
      setCredDeffloader(false);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
      setOrgId(Number(organizationId));
      if (window?.location?.search) {
        const str = window?.location?.search;
        const schemaId = str.substring(str.indexOf('=') + 1);
        await getSchemaDetails();
        await getCredentialDefinitionList(schemaId, Number(organizationId));
      }
    };
    getSchemaDetails();
    fetchData();
  }, []);


  const submit = async (values: Values) => {
    setCreateLoader(true)
    const CredDeffFieldName: CredDeffFieldNameType = {
      tag: values?.tagName,
      revocable: values?.revocable,
      orgId: orgId,
      schemaLedgerId: schemaDetails?.schemaId

    }

    const createCredDeff = await createCredentialDefinition(CredDeffFieldName);
    const { data } = createCredDeff as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setCreateLoader(false)
      setSuccess(data?.message)
    }
    else {
      setFailur(createCredDeff as string)
      setCreateLoader(false)
    }
    getCredentialDefinitionList(schemaDetails?.schemaId, orgId)
  }

  const credDefSelectionCallback = async (schemaId: string, credentialDefinitionId: string) => {
    await setToLocalStorage(storageKeys.CRED_DEF_ID, credentialDefinitionId)
    window.location.href = `${pathRoutes.organizations.Issuance.connections}`
  }
  return (
    <div className="px-4 pt-6">
      <div className="mb-4 col-span-full xl:mb-2">
        <BreadCrumbs />

        <div className='flex items-center content-between'>
          <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            Schemas
          </h1>
          <Button
            type="submit"
            color='bg-primary-800'
            onClick={() => {
              window.location.href = `${pathRoutes.back.schema.schemas}`
            }}
            className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto dark:text-white'
            style={{ height: '2.5rem', width: '5rem', minWidth: '2rem' }}
          >
            <svg className='mr-1' xmlns="http://www.w3.org/2000/svg" width="22" height="12" fill="none" viewBox="0 0 30 20">
              <path fill="#1F4EAD" d="M.163 9.237a1.867 1.867 0 0 0-.122 1.153c.083.387.287.742.587 1.021l8.572 7.98c.198.19.434.343.696.447a2.279 2.279 0 0 0 1.657.013c.263-.1.503-.248.704-.435.201-.188.36-.41.468-.655a1.877 1.877 0 0 0-.014-1.543 1.999 1.999 0 0 0-.48-.648l-4.917-4.576h20.543c.568 0 1.113-.21 1.515-.584.402-.374.628-.882.628-1.411 0-.53-.226-1.036-.628-1.41a2.226 2.226 0 0 0-1.515-.585H7.314l4.914-4.574c.205-.184.368-.404.48-.648a1.878 1.878 0 0 0 .015-1.542 1.99 1.99 0 0 0-.468-.656A2.161 2.161 0 0 0 11.55.15a2.283 2.283 0 0 0-1.657.013 2.154 2.154 0 0 0-.696.447L.626 8.589a1.991 1.991 0 0 0-.463.648Z" />
            </svg>

            Back
          </Button>
        </div>

      </div>

      <div
        className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
      >
        <div className='flex flex-col sm:flex-row'>
          <Card className='h-64 sm:w-1/2 p-2 mr-1 mb-1' id="viewSchemaDetailsCard">
            {loading ? (
              <div className="flex items-center justify-center mb-4">
                <CustomSpinner />
              </div>
            ) : (
              <div className='pt-4'>
                <div className='flex space-between'>
                  <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white p-1 pb-2">
                    Schema Details
                  </h5>
                  <div className='ml-auto'>
                    <a
                      className="text-sm font-medium hover:underline"
                      href={`http://test.bcovrin.vonx.io/browse/domain?query=${schemaDetails?.schemaId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        type="submit"
                        color='bg-primary-800'
                        title='View schema details on ledger'
                        className='dark:text-white bg-primary-700 bg-transparent ring-primary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto'
                        style={{ height: '1.5rem', width: '13rem', minWidth: '2rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" className='mr-2' fill="none" viewBox="0 0 17 17">
                          <path fill="#000" d="M15.749 6.99c-.334-.21-.813-.503-.813-.697.01-.397.113-.786.3-1.136.277-.69.561-1.395.204-1.915-.358-.519-1.122-.462-1.853-.405-.358.082-.73.082-1.089 0a2.74 2.74 0 0 1-.374-1.087c-.162-.739-.333-1.501-.942-1.704-.61-.203-1.154.3-1.699.811-.309.276-.723.65-.934.65-.212 0-.634-.374-.943-.65C7.07.362 6.51-.14 5.908.046c-.602.187-.805.933-.967 1.671-.05.383-.18.75-.382 1.08a2.295 2.295 0 0 1-1.09 0c-.722-.066-1.478-.13-1.844.405-.365.535-.081 1.225.195 1.914.19.35.295.739.31 1.136-.066.195-.521.487-.854.698C.65 7.34 0 7.76 0 8.41c0 .649.65 1.07 1.276 1.468.333.211.812.495.853.69-.014.4-.12.791-.309 1.144-.276.69-.56 1.395-.195 1.914.366.52 1.122.463 1.845.398a2.441 2.441 0 0 1 1.089.04c.2.33.33.697.382 1.08.162.738.333 1.508.934 1.711a.86.86 0 0 0 .277.106 2.439 2.439 0 0 0 1.422-.812c.308-.275.731-.657.942-.657.212 0 .626.382.935.657.544.487 1.105.998 1.698.812.593-.187.813-.974.943-1.712a2.69 2.69 0 0 1 .374-1.08 2.472 2.472 0 0 1 1.089-.04c.73.065 1.479.138 1.852-.397.374-.536.073-1.225-.203-1.915a2.585 2.585 0 0 1-.3-1.144c.056-.194.511-.478.812-.69C16.35 9.587 17 9.174 17 8.517c0-.658-.618-1.136-1.251-1.526Zm-.431 2.248c-.537.332-1.04.649-1.195 1.135a2.73 2.73 0 0 0 .325 1.68c.155.373.399.99.293 1.151-.106.163-.731.09-1.113.057a2.393 2.393 0 0 0-1.626.203 2.594 2.594 0 0 0-.682 1.55c-.082.365-.236 1.054-.406 1.111-.171.057-.667-.422-.894-.625a2.585 2.585 0 0 0-1.48-.868c-.58.11-1.105.417-1.486.868-.22.203-.756.674-.894.625-.138-.049-.325-.746-.407-1.111a2.594 2.594 0 0 0-.674-1.55 1.522 1.522 0 0 0-.95-.243 7.016 7.016 0 0 0-.708.04c-.374 0-1.008.09-1.105-.056-.098-.146.097-.78.26-1.112.285-.51.4-1.1.325-1.68-.146-.486-.65-.81-1.186-1.135-.358-.227-.902-.568-.902-.811 0-.244.544-.552.902-.811.536-.333 1.04-.658 1.186-1.136a2.754 2.754 0 0 0-.325-1.688c-.163-.348-.398-.973-.284-1.127.113-.154.73-.09 1.105-.057.549.122 1.123.05 1.625-.203.392-.427.629-.972.674-1.55.082-.364.236-1.054.407-1.11.17-.058.674.421.894.624.381.45.907.753 1.487.86a2.569 2.569 0 0 0 1.479-.86c.227-.203.756-.673.894-.625.138.049.325.747.406 1.112.048.578.288 1.123.682 1.55a2.397 2.397 0 0 0 1.626.202c.382 0 1.007-.09 1.113.057.106.146-.138.811-.292 1.144a2.755 2.755 0 0 0-.326 1.687c.155.479.659.811 1.195 1.136.357.227.902.568.902.811 0 .243-.488.527-.845.755Z" />
                          <path fill="#000" d="m11.253 6.126-3.78 3.943-1.687-1.403a.473.473 0 0 0-.149-.08.556.556 0 0 0-.352 0 .473.473 0 0 0-.148.08.377.377 0 0 0-.101.12.306.306 0 0 0 0 .284.377.377 0 0 0 .101.12l2.002 1.7a.459.459 0 0 0 .152.083.548.548 0 0 0 .181.027.601.601 0 0 0 .19-.043.499.499 0 0 0 .153-.097l4.105-4.284a.312.312 0 0 0 .074-.265.365.365 0 0 0-.174-.234.55.55 0 0 0-.632.049h.065Z" />
                        </svg>

                        Check on ledger
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="">
                  <div>
                    <p className='p-1 dark:text-white break-words'>
                      Name:  {schemaDetails?.schemaName}
                    </p>
                  </div>
                  <div>
                    <p className='p-1 dark:text-white break-words'>
                      Version: {schemaDetails?.version}
                    </p>
                  </div>
                  <p className='p-1 dark:text-white break-all'>
                    Schema ID: {schemaDetails?.schemaId}
                  </p>
                  <p className='p-1 dark:text-white break-words'>
                    Issuer DID: {schemaDetails?.issuerDid}
                  </p>
                </div>
                <div className="flow-root overflow-y-auto">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    <li className="py-3 sm:py-4">
                      <div className="flex items-center space-x-4">
                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white flex-wrap p-1">
                          Attributes:
                          {schemaDetails?.attributes && schemaDetails?.attributes?.length > 0 &&
                            schemaDetails?.attributes.map((element: string) => (
                              <span className='m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300'>{element?.attributeName}</span>
                            ))}
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </Card>
          <Card className='h-64 sm:w-1/2 p-2 ml-1' id="credentialDefinitionCard">
            <div>
              <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                Create Credential Definition
              </h5>
            </div>
            <div>
              <Formik
                initialValues={{
                  tagName: '',
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
                onSubmit={async (values, formikHandlers): Promise<void> => {
                  await submit(values)
                  formikHandlers.resetForm();

                }}
              >
                {(formikHandlers): JSX.Element => (
                  <Form onSubmit={formikHandlers.handleSubmit}>
                    <div className=" flex items-center space-x-4">
                      <div className='w-full'>
                        <div className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          <Label htmlFor="credential-definition" value="Name" />
                          <span className='text-red-600'>*</span>
                        </div>
                        <Field
                          id="tagName"
                          name="tagName"
                          placeholder="Enter Credential definition"
                          className="w-full bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          disabled={createloader}
                        />
                        {
                          (formikHandlers?.errors?.tagName && formikHandlers?.touched?.tagName) &&
                          <span className="text-red-500 text-xs">{formikHandlers?.errors?.tagName}</span>
                        }
                      </div>
                    </div>

                    <div className='flex items-center'>
                      <div className="custom-control custom-checkbox d-flex align-items-center pt-4 p-2">
                        {/* <Field type="checkbox" id="Revocable" name="revocable" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" /> */}
                        {/* <Label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300" >
                          Revocable
                        </Label> */}
                      </div>
                      {createloader && <div className='ml-auto'>
                        <p className='text-gray-500 text-sm italic ml-5'>
                          <svg className='animate-spin mr-1 h-4 w-4 text-blue-600 inline-block' xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.86 3.182 8.009l2.01-2.01zM12 20a8 8 0 008-8h-4a4 4 0 11-8 0H0a8 8 0 008 8v-4a4 4 0 018 0v4z"></path>
                          </svg>
                          Hold your coffee, this might take a moment...
                        </p>
                      </div>}
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
                        title="Add new credential-definition on ledger"
                        isProcessing={createloader}
                        color='bg-primary-800'
                        disabled={createloader}
                        className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                      >
                        <svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                        </svg>
                        Create
                      </Button>
                    </div>

                    <div className='float-right p-2'>
                      <Button
                        type="reset"
                        color='bg-primary-800'
                        onClick={() => {
                          setCredDefAuto('')
                        }}
                        disabled={createloader}
                        className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto dark:text-white'

                        style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className='mr-2' width="18" height="18" fill="none" viewBox="0 0 20 20">
                          <path fill="#1F4EAD" d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z" />
                        </svg>

                        Reset
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Card >
        </div>
      </div>
      <>
        <div className='p-4'>
          {schemaDetailErr && (
            <Alert color="failure" onDismiss={() => setSchemaDetailErr(null)}>
              <span>
                <p>
                  {schemaDetailErr}
                </p>
              </span>
            </Alert>
          )}
        </div>
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white p-4">
          Credential Definitions
        </h5>

        {credDeffloader ? (<div className="flex items-center justify-center mb-4">

          <CustomSpinner />
        </div>)
          : credDeffList && credDeffList.length > 0 ? (
            <div className='Flex-wrap' style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
                {credDeffList && credDeffList.length > 0 &&
                  credDeffList.map((element, key) => (
                    <div className='p-2' key={key}>
                      <CredDeffCard credDeffName={element['tag']} credentialDefinitionId={element['credentialDefinitionId']} schemaId={element['schemaLedgerId']} revocable={element['revocable']} onClickCallback={credDefSelectionCallback} />
                    </div>
                  ))
                }
              </div>
              <div className="flex items-center justify-end mb-4">
                <Pagination
                  currentPage={1}
                  onPageChange={() => {
                  }}
                  totalPages={0}
                />
              </div>
            </div>) : (<EmptyListMessage
              message={'No credential definition'}
              description={'Get started by creating a new credential definition'}
              buttonContent={''}
              svgComponent={<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
              </svg>}
              onClick={() => { }}
            />)
        }
      </>
    </div>
  )
}


export default ViewSchemas