/* eslint-disable max-lines */
'use client'

import * as React from 'react'
import * as Yup from 'yup'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { CommonConstants, DidMethod, Network } from '@/common/enums'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import { createDid, createPolygonKeyValuePair } from '@/app/api/Agent'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiStatusCodes } from '@/config/CommonConstant'
import { envConfig } from '@/config/envConfig'
import { ethers } from 'ethers'
import { getOrganizationById } from '@/app/api/organization'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'

interface IPolygonKeys {
  privateKey: string
  publicKeyBase58: string
  address: string
}

interface CreateDIDModalProps {
  openModal: boolean
  orgId: string
  setOpenModal: (open: boolean) => void
  setMessage: (message: string) => void
  onEditSucess?: () => void
}

interface IFormValues {
  method: string | null
  ledger: string | null
  network: string | null
  domain: string
  privatekey: string
  endorserDid: string
  did?: string
}
// Icons
function CopyIcon(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
const CreateDidComponent = (props: CreateDIDModalProps): React.JSX.Element => {
  const [loading, setLoading] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [errMsg, setErrMsg] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null)
  const [seed, setSeed] = React.useState('')
  const [generatedKeys, setGeneratedKeys] = React.useState<IPolygonKeys | null>(
    null,
  )
  const [method, setMethod] = React.useState<string | null>(null)
  const [completeDidMethodValue, setCompleteDidMethodValue] = React.useState<
    string | null
  >(null)
  const [havePrivateKey, setHavePrivateKey] = React.useState(false)
  const [privateKeyValue, setPrivateKeyValue] = React.useState<string>('')
  const [walletErrorMessage, setWalletErrorMessage] = React.useState<
    string | null
  >(null)
  const [initialValues, setInitialValues] = React.useState<IFormValues>({
    method: '',
    ledger: '',
    network: '',
    domain: '',
    privatekey: '',
    endorserDid: '',
    did: '',
  })

  const router = useRouter()

  // Dynamic validation schema based on method
  const getValidationSchema = (): Yup.ObjectSchema<{
    method: string
    ledger: string
    network?: string
    domain?: string
    privatekey?: string
    endorserDid?: string
    did?: string
  }> => {
    let schema = Yup.object().shape({
      method: Yup.string().required('Method is required'),
      ledger: Yup.string().required('Ledger is required'),
      network: Yup.string(),
      domain: Yup.string(),
      privatekey: Yup.string(),
      endorserDid: Yup.string(),
      did: Yup.string(),
    })

    if (method === DidMethod.WEB) {
      schema = schema.shape({
        domain: Yup.string().required('Domain is required'),
      })
    } else if (method === DidMethod.POLYGON) {
      schema = schema.shape({
        privatekey: Yup.string()
          .required('Private key is required')
          .length(64, 'Private key must be exactly 64 characters long'),
      })
    }

    return schema
  }

  const fetchOrganizationDetails = async (): Promise<void> => {
    const response = await getOrganizationById(props.orgId)
    const { data } = response as AxiosResponse
    setLoading(false)
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const didMethod = data?.data?.org_agents[0]?.orgDid
        ?.split(':')
        .slice(0, 2)
        .join(':')
      setMethod(didMethod)

      let ledgerName: string | null = ''
      if (didMethod === DidMethod.INDY || DidMethod.POLYGON) {
        ledgerName = data?.data?.org_agents[0]?.orgDid.split(':')[1]
      } else {
        ledgerName = 'No Ledger'
      }

      let networkName: string | null = ''
      if (didMethod === DidMethod.INDY) {
        networkName = data?.data?.org_agents[0]?.orgDid
          .split(':')
          .slice(2, 4)
          .join(':')
      } else if (didMethod === DidMethod.POLYGON) {
        networkName = data?.data?.org_agents[0]?.orgDid.split(':')[2]
      } else {
        networkName = ''
      }

      let completeDidMethod: string | null = ''
      if (didMethod === DidMethod.INDY) {
        completeDidMethod = data?.data?.org_agents[0]?.orgDid
          .split(':')
          .slice(0, 4)
          .join(':')
      } else {
        completeDidMethod = didMethod
      }
      setCompleteDidMethodValue(completeDidMethod)

      // Update form values
      setInitialValues({
        method: didMethod,
        ledger: ledgerName,
        network: networkName,
        domain: '',
        privatekey: generatedKeys?.privateKey.slice(2) || '',
        endorserDid: '',
        did: '',
      })
    } else {
      console.error('Error in fetching organization:::')
    }
  }

  React.useEffect(() => {
    fetchOrganizationDetails()
  }, [])

  const checkBalance = async (
    privateKey: string,
    network: Network,
  ): Promise<string | null> => {
    try {
      const rpcUrls = {
        testnet: `${envConfig.PLATFORM_DATA.polygonTestnet}`,
        mainnet: `${envConfig.PLATFORM_DATA.polygonMainnet}`,
      }

      const networkUrl = rpcUrls?.[network]

      const provider = new ethers.JsonRpcProvider(networkUrl)

      const wallet = new ethers.Wallet(privateKey, provider)
      const address = await wallet.getAddress()
      const balance = await provider.getBalance(address)

      const etherBalance = ethers.formatEther(balance)

      if (parseFloat(etherBalance) < CommonConstants.BALANCELIMIT) {
        setWalletErrorMessage('You have insufficient funds.')
      } else {
        setWalletErrorMessage(null)
      }

      return etherBalance
    } catch (error) {
      console.error('Error checking wallet balance:', error)
      return null
    }
  }

  React.useEffect(() => {
    if (privateKeyValue && privateKeyValue.length === 64) {
      checkBalance(privateKeyValue, Network.TESTNET)
    } else {
      setWalletErrorMessage(null)
    }
  }, [privateKeyValue])

  const createNewDid = async (values: IFormValues): Promise<void> => {
    setLoading(true)

    let network = ''
    if (values.method === DidMethod.INDY) {
      network = values?.network || ''
    } else if (values.method === DidMethod.POLYGON) {
      network = `${values.ledger}:${values.network}`
    }
    const didData = {
      seed: values.method === DidMethod.POLYGON ? '' : seed,
      keyType: 'ed25519',
      method: values.method?.split(':')[1] || '',
      network,
      domain: values.method === DidMethod.WEB ? values.domain : '',
      role: values.method === DidMethod.INDY ? 'endorser' : '',
      privatekey: values.method === DidMethod.POLYGON ? values.privatekey : '',
      did: values?.did ?? '',
      endorserDid: values?.endorserDid || '',
      isPrimaryDid: false,
    }
    try {
      const response = await createDid(props.orgId, didData)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        if (props?.onEditSucess) {
          props?.onEditSucess()
        }
        props.setOpenModal(false)
        props.setMessage(data?.message)
        setSuccessMsg(data?.message)
        setLoading(true)
        setTimeout(() => {
          router.refresh()
        }, 2000)
      } else {
        setErrMsg(response as string)
        setLoading(false)
        props.setOpenModal(true)
      }
    } catch (error) {
      console.error('An error occurred while creating did:', error)
      setLoading(false)
    }
  }

  const generatePolygonKeyValuePair = async (
    setFieldValue: FormikHelpers<IFormValues>['setFieldValue'],
  ): Promise<void> => {
    setIsLoading(true)
    try {
      const resCreatePolygonKeys = await createPolygonKeyValuePair(props.orgId)
      const { data } = resCreatePolygonKeys as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setGeneratedKeys(data?.data)
        setIsLoading(false)
        const privateKey = data?.data?.privateKey.slice(2)
        setPrivateKeyValue(privateKeyValue || privateKey)
        setFieldValue('privatekey', privateKey)
        await checkBalance(privateKeyValue || privateKey, Network.TESTNET)
      }
    } catch (err) {
      console.error('Generate private key ERROR::::', err)
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    setSeed(nanoid(32))
  }, [])

  React.useEffect(() => {
    if (havePrivateKey) {
      setPrivateKeyValue('')
      setWalletErrorMessage(null)
      setGeneratedKeys(null)
    } else {
      setPrivateKeyValue('')
      setWalletErrorMessage(null)
    }
  }, [havePrivateKey])

  function CopyDid({
    value,
    className,
  }: {
    value: string
    className?: string
  }): React.JSX.Element {
    const [copied, setCopied] = React.useState(false)

    const copyToClipboard = (): void => {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="truncate">{value}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-8 w-8"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }

  function TokenWarningMessage(): React.JSX.Element {
    return (
      <div className="mt-3 text-xs">
        <p>Note: You need to have tokens in your wallet to create a DID.</p>
      </div>
    )
  }

  return (
    <Dialog open={props.openModal} onOpenChange={props.setOpenModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create DID</DialogTitle>
        </DialogHeader>

        {(successMsg || errMsg) && (
          <Alert variant={successMsg ? 'default' : 'destructive'}>
            <AlertDescription>{successMsg || errMsg}</AlertDescription>
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={getValidationSchema()}
          enableReinitialize={true}
          onSubmit={(values) => createNewDid(values)}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ledger">
                    Ledger <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Field
                    as={Input}
                    id="ledger"
                    name="ledger"
                    readOnly
                    value={values.ledger}
                  />
                  <ErrorMessage
                    name="ledger"
                    component="div"
                    className="text-destructive mt-1 text-sm"
                  />
                </div>

                {method !== DidMethod.KEY && (
                  <div>
                    <Label htmlFor="method">
                      Method <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="method"
                      name="method"
                      readOnly
                      value={values.method}
                    />
                    <ErrorMessage
                      name="method"
                      component="div"
                      className="text-destructive mt-1 text-sm"
                    />
                  </div>
                )}

                {method !== DidMethod.WEB && method !== DidMethod.KEY && (
                  <div>
                    <Label htmlFor="network">
                      Network{' '}
                      <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="network"
                      name="network"
                      readOnly
                      value={values.network}
                    />
                    <ErrorMessage
                      name="network"
                      component="div"
                      className="text-destructive mt-1 text-sm"
                    />
                  </div>
                )}

                {method === DidMethod.WEB && (
                  <div>
                    <Label htmlFor="domain">
                      Domain <span className="text-destructive text-xs">*</span>
                    </Label>
                    <Field
                      as={Input}
                      id="domain"
                      name="domain"
                      placeholder="Enter Name"
                    />
                    <ErrorMessage
                      name="domain"
                      component="div"
                      className="text-destructive mt-1 text-sm"
                    />
                  </div>
                )}

                <div>
                  <Label>
                    DID Method{' '}
                    <span className="text-destructive text-xs">*</span>
                  </Label>
                  <Input value={completeDidMethodValue || ''} readOnly />
                </div>

                {method === DidMethod.POLYGON && (
                  <>
                    <div className="col-span-1 sm:col-span-2">
                      <div className="mb-4 flex items-center space-x-2">
                        <Checkbox
                          id="havePrivateKey"
                          checked={havePrivateKey}
                          onCheckedChange={(checked) =>
                            setHavePrivateKey(checked === true)
                          }
                        />
                        <Label htmlFor="havePrivateKey">
                          Already have a private key?
                        </Label>
                      </div>

                      {!havePrivateKey ? (
                        <>
                          <div className="my-3 flex items-center justify-between">
                            <Label>
                              Generate private key{' '}
                              <span className="text-destructive text-xs">
                                *
                              </span>
                            </Label>
                            <Button
                              type="button"
                              onClick={() =>
                                generatePolygonKeyValuePair(setFieldValue)
                              }
                              disabled={isLoading}
                            >
                              {isLoading ? 'Generating...' : 'Generate'}
                            </Button>
                          </div>

                          {generatedKeys && (
                            <>
                              <div className="relative mt-3">
                                <div className="flex items-center">
                                  <Field
                                    as={Input}
                                    name="privatekey"
                                    className="truncate"
                                    readOnly
                                    value={generatedKeys.privateKey.slice(2)}
                                  />
                                  <div className="ml-2">
                                    <CopyDid
                                      value={generatedKeys.privateKey.slice(2)}
                                    />
                                  </div>
                                </div>
                                <ErrorMessage
                                  name="privatekey"
                                  component="div"
                                  className="text-destructive mt-1 text-sm"
                                />
                                {walletErrorMessage && (
                                  <p className="text-destructive text-sm">
                                    {walletErrorMessage}
                                  </p>
                                )}
                              </div>

                              <TokenWarningMessage />

                              <div className="my-3">
                                <p className="text-sm">
                                  <span className="font-semibold">
                                    Address:
                                  </span>
                                  <CopyDid
                                    value={generatedKeys.address}
                                    className="mt-1"
                                  />
                                </p>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div>
                          <Field
                            as={Input}
                            name="privatekey"
                            placeholder="Enter private key"
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => {
                              setFieldValue('privatekey', e.target.value)
                              setPrivateKeyValue(e.target.value)
                              setWalletErrorMessage(null)
                              if (e.target.value.length === 64) {
                                checkBalance(e.target.value, Network.TESTNET)
                              }
                            }}
                          />
                          <ErrorMessage
                            name="privatekey"
                            component="div"
                            className="text-destructive mt-1 text-sm"
                          />
                          {walletErrorMessage && (
                            <p className="text-destructive text-sm">
                              {walletErrorMessage}
                            </p>
                          )}
                          <TokenWarningMessage />
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <h3 className="mb-2 text-sm font-semibold">
                        Follow these instructions to generate polygon tokens:
                      </h3>
                      <ol className="space-y-2 text-sm">
                        <li>
                          <span className="font-semibold">Step 1:</span>
                          <div className="ml-4">
                            Copy the address and get the free tokens for the
                            testnet.
                            <div>
                              For eg. use{' '}
                              <a
                                href="https://faucet.polygon.technology/"
                                className="underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                https://faucet.polygon.technology/
                              </a>{' '}
                              to get free token
                            </div>
                          </div>
                        </li>
                        <li>
                          <span className="font-semibold">Step 2:</span>
                          <div className="ml-4">
                            Check that you have received the tokens.
                            <div>
                              For eg. copy the address and check the balance on{' '}
                              <a
                                href="https://mumbai.polygonscan.com/"
                                className="underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                https://mumbai.polygonscan.com/
                              </a>
                            </div>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    (method === DidMethod.POLYGON && !values.privatekey)
                  }
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

export default CreateDidComponent
