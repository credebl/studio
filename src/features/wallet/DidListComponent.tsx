/* eslint-disable max-lines */
import * as React from 'react'
import * as Yup from 'yup'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Check, Copy, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DidMethod, Network, Roles } from '@/common/enums'
import { type EncryptedKey, parseKeyMaterial } from '@/utils/keyImport'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  apiStatusCodes,
  currentPageNumber,
  itemPerPage,
  polygonFaucet,
} from '@/config/CommonConstant'
import {
  createDid,
  createPolygonKeyValuePair,
  getDids,
  updatePrimaryDid,
} from '@/app/api/Agent'
import {
  encryptKeyForDidImport,
  polygonKeyMaterial,
} from '@/utils/didKeyImport'
import { getOrganizationById, getOrganizations } from '@/app/api/organization'
import { useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import { AlertDialogDemo } from './ConfirmationDialogue'
import { AxiosResponse } from 'axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { CommonConstants } from '../common/enum'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { Textarea } from '@/components/ui/textarea'
import { dateConversion } from '@/utils/DateConversion'
import { ethers } from 'ethers'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'

interface IDidListData {
  id: string
  did: string
  isPrimaryDid: boolean
  createDateTime: string
  lastChangedDateTime: string
}

interface IUpdatePrimaryDid {
  id: string
  did: string
}

interface IPolygonKeys {
  privateKey: string
  publicKeyBase58: string
  address: string
}

interface IFormValues {
  method: string
  ledger: string
  network: string
  domain: string
  privatekey: string
  privateKey: string
  passphrase: string
  endorserDid: string
  did: string
}

interface OrgRole {
  name: string
}

interface UserOrgRole {
  orgId: string | null
  organisation: {
    id: string
    name: string
  } | null
  orgRole: OrgRole
}

interface Organization {
  id: string
  name: string
  userOrgRoles: UserOrgRole[]
}

const createDidMethods: DidMethod[] = [
  DidMethod.INDY,
  DidMethod.KEY,
  DidMethod.WEB,
  DidMethod.POLYGON,
]

const indyNetworks = [
  'bcovrin:testnet',
  'indicio:testnet',
  'indicio:demonet',
  'indicio:mainnet',
]

const polygonNetworks =
  process.env.NEXT_PUBLIC_MODE === 'PROD' ? ['testnet', 'mainnet'] : ['testnet']

const getMethodDefaults = (
  didMethod: DidMethod,
  network?: string,
): Pick<IFormValues, 'ledger' | 'network'> => {
  switch (didMethod) {
    case DidMethod.INDY:
      return {
        ledger: 'indy',
        network:
          network && indyNetworks.includes(network) ? network : indyNetworks[0],
      }
    case DidMethod.POLYGON:
      return {
        ledger: 'polygon',
        network:
          network === Network.MAINNET &&
          polygonNetworks.includes(Network.MAINNET)
            ? Network.MAINNET
            : Network.TESTNET,
      }
    default:
      return { ledger: 'No Ledger', network: '' }
  }
}

const getCompleteDidMethod = (
  didMethod: DidMethod,
  network: string,
): string => {
  if (didMethod === DidMethod.INDY) {
    return `did:indy:${network}`
  }

  return didMethod
}

const DateTooltip = ({
  date,
  children,
}: {
  date: string
  children: React.ReactNode
}): React.JSX.Element => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span>{children}</span>
    </TooltipTrigger>
    <TooltipContent>
      <p>{new Date(date).toLocaleString()}</p>
    </TooltipContent>
  </Tooltip>
)

// Shared components
const CopyDid = ({
  value,
  className,
  showCheck = false,
  didListLoading,
}: {
  value: string
  className?: string
  showCheck?: boolean
  didListLoading?: boolean
}): React.JSX.Element => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (): void => {
    const resetCopied = (): void => setCopied(false)
    const handleCopySuccess = (): void => {
      setCopied(true)
      setTimeout(resetCopied, 2000)
    }
    const handleCopyError = (): void => {
      console.error('Failed to copy text to clipboard')
    }
    navigator.clipboard
      .writeText(value)
      .then(handleCopySuccess)
      .catch(handleCopyError)
  }

  if (showCheck) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="truncate">{value}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-8 w-8"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }

  if (didListLoading) {
    return <Loader />
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-2 ${className}`}>
          <span className="truncate font-mono">{value}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy to clipboard</p>
      </TooltipContent>
    </Tooltip>
  )
}

const TokenWarningMessage = (): React.JSX.Element => (
  <div className="mt-3 text-xs">
    <p>Note: You need to have tokens in your wallet to create a DID.</p>
  </div>
)

const DIDListComponent = ({ orgId }: { orgId: string }): React.JSX.Element => {
  // State for DID list
  const [didList, setDidList] = useState<IDidListData[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [errorPath, setErrorPath] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isMethodLoading, setIsMethodLoading] = useState(false)

  // State for Create DID modal
  const [loading, setLoading] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [isCreatingDid, setIsCreatingDid] = useState(false)
  const [seed, setSeed] = useState('')
  const [generatedKeys, setGeneratedKeys] = useState<IPolygonKeys | null>(null)
  const [method, setMethod] = useState<DidMethod>()
  const [completeDidMethodValue, setCompleteDidMethodValue] = useState<
    string | null
  >(null)
  const [havePrivateKey, setHavePrivateKey] = useState(false)
  const [haveKeyMaterial, setHaveKeyMaterial] = useState(false)
  const [privateKeyValue, setPrivateKeyValue] = useState<string>('')
  const [walletErrorMessage, setWalletErrorMessage] = useState<string | null>(
    null,
  )
  const [currentPage] = useState(currentPageNumber)
  const [pageSize] = useState(itemPerPage)
  const [searchTerm] = useState('')
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [didListLoading, setDidListLoading] = useState<boolean>(true)

  const [initialValues, setInitialValues] = useState<IFormValues>({
    method: '',
    ledger: '',
    network: '',
    domain: '',
    privatekey: '',
    privateKey: '',
    passphrase: '',
    endorserDid: '',
    did: '',
  })

  const router = useRouter()
  const getData = async (): Promise<void> => {
    setDidListLoading(true)
    try {
      const response = await getDids(orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const sortedDids = data?.data.sort(
          (a: { isPrimaryDid: boolean }, b: { isPrimaryDid: boolean }) => {
            if (a.isPrimaryDid && !b.isPrimaryDid) {
              return -1
            }
            if (!a.isPrimaryDid && b.isPrimaryDid) {
              return 1
            }
            return 0
          },
        )
        setDidList(sortedDids)
      }
    } catch (error) {
      console.error('Error fetching DIDs:', error)
    } finally {
      setDidListLoading(false)
    }
  }
  const setPrimaryDid = async (id: string, did: string): Promise<void> => {
    try {
      const payload: IUpdatePrimaryDid = {
        id,
        did,
      }
      const response = await updatePrimaryDid(orgId, payload)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        getData()
        router.refresh()
      } else {
        setErrorPath('')
        setErrorMsg(response as string)
      }
    } catch (error) {
      console.error('Error setting primary DID:', error)
    }
  }

  const fetchOrganizations = async (): Promise<void> => {
    try {
      const response = await getOrganizations(
        currentPage,
        pageSize,
        searchTerm,
        '',
      )
      if (typeof response !== 'string' && response?.data?.data?.organizations) {
        const { organizations } = response.data.data

        const currentOrg = organizations.find(
          (org: Organization) => org.id === orgId,
        )
        const roles =
          currentOrg?.userOrgRoles?.map(
            (role: UserOrgRole) => role.orgRole.name,
          ) || []
        setUserRoles(roles)
      } else {
        setUserRoles([])
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [currentPage, pageSize, searchTerm])

  useEffect(() => {
    getData()
  }, [])

  // Create DID functions
  const getValidationSchema = (): Yup.AnyObject => {
    let schema = Yup.object().shape({
      method: Yup.string().required('Method is required'),
      ledger: Yup.string().required('Ledger is required'),
      network: Yup.string(),
      domain: Yup.string(),
      privatekey: Yup.string(),
      privateKey: Yup.string(),
      passphrase: Yup.string(),
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
    } else if (method === DidMethod.INDY) {
      schema = schema.shape({
        network: Yup.string().required('Network is required'),
      })
    }

    if (
      (method === DidMethod.KEY || method === DidMethod.WEB) &&
      haveKeyMaterial
    ) {
      schema = schema.shape({
        privateKey: Yup.string().required(
          'Private key (PEM, base64 DER or JWK) is required',
        ),
      })
    }

    return schema
  }

  const fetchOrganizationDetails = async (): Promise<
    IFormValues | undefined
  > => {
    const response = await getOrganizationById(orgId)
    if (typeof response === 'string') {
      console.error('Error in fetching organization:::', response)
      setLoading(false)
      return undefined
    }

    const { data } = response as AxiosResponse
    setLoading(false)
    if (data?.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
      console.error('Error in fetching organization:::')
      return undefined
    }

    const orgDid: string | undefined = data?.data?.org_agents?.[0]?.orgDid

    const orgDidMethod = orgDid?.split(':').slice(0, 2).join(':') as
      | DidMethod
      | undefined

    // The organization's current DID method is only used to preselect a sensible
    // default. It must never block creating a DID with a different method.
    const didMethod =
      orgDidMethod && createDidMethods.includes(orgDidMethod)
        ? orgDidMethod
        : DidMethod.KEY

    const networkFromDid =
      didMethod === DidMethod.INDY
        ? orgDid?.split(':').slice(2, 4).join(':')
        : didMethod === DidMethod.POLYGON
          ? orgDid?.split(':')[2]
          : undefined

    const { ledger, network } = getMethodDefaults(didMethod, networkFromDid)
    setMethod(didMethod)
    setCompleteDidMethodValue(getCompleteDidMethod(didMethod, network))

    // Update initial values
    const resolvedValues: IFormValues = {
      method: didMethod,
      ledger,
      network,
      domain: '',
      privatekey: generatedKeys?.privateKey.slice(2) || '',
      privateKey: '',
      passphrase: '',
      endorserDid: '',
      did: '',
    }
    setInitialValues(resolvedValues)

    return resolvedValues
  }

  const handleMethodChange = (
    nextMethod: DidMethod,
    setFieldValue: FormikHelpers<IFormValues>['setFieldValue'],
  ): void => {
    const { ledger, network } = getMethodDefaults(nextMethod)

    setMethod(nextMethod)
    setCompleteDidMethodValue(getCompleteDidMethod(nextMethod, network))
    setFieldValue('method', nextMethod)
    setFieldValue('ledger', ledger)
    setFieldValue('network', network)
    setFieldValue('domain', '')
    setFieldValue('privatekey', '')
    setFieldValue('privateKey', '')
    setFieldValue('passphrase', '')
    setHavePrivateKey(false)
    setHaveKeyMaterial(false)
    setGeneratedKeys(null)
    setPrivateKeyValue('')
    setWalletErrorMessage(null)
  }

  const getButtonLabel = (): React.ReactNode => {
    if (isMethodLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      )
    }

    if (
      isCreatingDid &&
      method !== DidMethod.POLYGON &&
      method !== DidMethod.WEB
    ) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating DID...
        </>
      )
    }

    return 'Create DID'
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
        testnet: `${process.env.NEXT_PUBLIC_POLYGON_TESTNET_URL}`,
        mainnet: `${process.env.NEXT_PUBLIC_POLYGON_MAINNET_URL}`,
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

  const getCreateDidErrorMessage = (message: unknown): string => {
    const text = Array.isArray(message) ? message.join(', ') : message

    if (
      typeof text === 'string' &&
      text.toLowerCase().includes('network is mismatched')
    ) {
      return "This organization's agent is not configured for the selected ledger network. Choose did:key or did:web, or configure the agent for that ledger before creating a ledger-based DID."
    }

    return typeof text === 'string' && text ? text : 'Failed to create DID'
  }

  /**
   * Requests a single-use import session and encrypts the pasted key to it in the browser. Only the resulting JWE
   * envelope is sent to the gateway, so the plaintext key never leaves this tab.
   */
  const buildEncryptedKey = async (
    values: IFormValues,
  ): Promise<EncryptedKey> => {
    const didMethod = values.method?.split(':')[1] || ''
    // Parse before asking for a session, so an invalid key does not burn one.
    // did:polygon uses the hex secp256k1 key from the Polygon key pair flow.
    const material =
      values.method === DidMethod.POLYGON
        ? polygonKeyMaterial(values.privatekey)
        : parseKeyMaterial(values.privateKey, values.passphrase)

    return encryptKeyForDidImport(orgId, didMethod, material)
  }

  const createNewDid = async (values: IFormValues): Promise<void> => {
    setLoading(true)
    setErrMsg(null)

    // Only set isCreatingDid for non-Polygon and non-Web methods
    if (method !== DidMethod.POLYGON && method !== DidMethod.WEB) {
      setIsCreatingDid(true)
    }

    let network = ''
    if (values.method === DidMethod.INDY) {
      network = values?.network || ''
    } else if (values.method === DidMethod.POLYGON) {
      network = `${values.ledger}:${values.network}`
    }

    const usesImportedKey =
      (values.method === DidMethod.KEY || values.method === DidMethod.WEB) &&
      haveKeyMaterial

    let encryptedKey: EncryptedKey | undefined = undefined
    if (usesImportedKey || values.method === DidMethod.POLYGON) {
      try {
        encryptedKey = await buildEncryptedKey(values)
      } catch (error) {
        setErrMsg(
          error instanceof Error
            ? error.message
            : 'Failed to encrypt the private key for import',
        )
        setLoading(false)
        setIsCreatingDid(false)
        return
      }
    }

    const didData = {
      seed: values.method === DidMethod.POLYGON || usesImportedKey ? '' : seed,
      keyType: 'ed25519',
      method: values.method?.split(':')[1] || '',
      network,
      domain: values.method === DidMethod.WEB ? values.domain : '',
      role: values.method === DidMethod.INDY ? 'endorser' : '',
      encryptedKey,
      did: values?.did ?? '',
      endorserDid: values?.endorserDid || '',
      isPrimaryDid: false,
    }
    try {
      const response = await createDid(orgId, didData)

      if (typeof response === 'string') {
        setErrMsg(response)
        setLoading(false)
        setIsCreatingDid(false)
        if (
          values.method === DidMethod.POLYGON ||
          values.method === DidMethod.WEB
        ) {
          setShowPopup(true)
        }
        return
      }

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setShowPopup(false)
        setSuccessMsg(data?.message)
        setLoading(false)
        setIsCreatingDid(false)
        await getData()
        setTimeout(() => {
          router.refresh()
        }, 2000)
      } else {
        setErrMsg(getCreateDidErrorMessage(data?.message))
        setLoading(false)
        setIsCreatingDid(false)
        if (
          values.method === DidMethod.POLYGON ||
          values.method === DidMethod.WEB
        ) {
          setShowPopup(true)
        }
        setTimeout(() => {
          router.refresh()
        }, 2000)
      }
    } catch (error) {
      console.error('An error occurred while creating did:', error)
      setErrMsg(
        error instanceof Error
          ? error.message
          : 'An error occurred while creating the DID. Please try again.',
      )
      setLoading(false)
      setIsCreatingDid(false)
    }
  }

  const generatePolygonKeyValuePair = async (
    setFieldValue: FormikHelpers<IFormValues>['setFieldValue'],
  ): Promise<void> => {
    setIsLoading(true)
    try {
      const resCreatePolygonKeys = await createPolygonKeyValuePair(orgId)
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

  return (
    <div className="w-full space-y-4">
      {successMsg && (
        <div className="w-full" role="alert">
          <AlertComponent
            message={successMsg}
            type={'success'}
            onAlertClose={() => {
              setSuccessMsg(null)
            }}
          />
        </div>
      )}
      {(errorMsg || errMsg) && !showPopup && (
        <div className="w-full" role="alert">
          <AlertComponent
            message={errorMsg || errMsg || ''}
            type={'failure'}
            onAlertClose={() => {
              setErrorMsg(null)
              setErrMsg(null)
              setErrorPath('')
            }}
            viewButton={Boolean(errorPath)}
            path={errorPath}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          onClick={async () => {
            setIsMethodLoading(true)
            setErrMsg(null)
            setErrorMsg(null)
            setErrorPath('')

            const resolvedValues = await fetchOrganizationDetails()
            setIsMethodLoading(false)

            if (!resolvedValues) {
              setErrMsg(
                'Unable to load the organization wallet. Please try again.',
              )
              return
            }

            setShowPopup(true)
          }}
          disabled={
            userRoles.includes(Roles.MEMBER) ||
            userRoles.includes(Roles.ISSUER) ||
            userRoles.includes(Roles.VERIFIER) ||
            isMethodLoading ||
            isCreatingDid
          }
        >
          {getButtonLabel()}
        </Button>
      </div>

      <div className="divide-y rounded-lg border">
        {didListLoading ? (
          <div className="my-5">
            <Loader />
          </div>
        ) : (
          <>
            {didList.map((item: IDidListData, index: number) => (
              <div key={item.id} className={'grid h-20 items-center p-4'}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <span className="w-16 shrink-0">DID {index + 1}</span>
                    <span>:</span>

                    {item?.did ? (
                      <CopyDid value={item.did} className="flex-1 font-mono" />
                    ) : (
                      <span className="flex-1 font-mono">Not available</span>
                    )}
                  </div>
                  <div className={item.isPrimaryDid ? 'grow' : ''}>
                    {item.isPrimaryDid ? (
                      <Badge
                        variant="default"
                        className="cursor-default text-sm"
                      >
                        Primary DID
                      </Badge>
                    ) : (
                      <div className="ml-auto">
                        <AlertDialogDemo
                          handler={() => setPrimaryDid(item.id, item.did)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <p className="text-muted-foreground text-sm">Created</p>
                  <DateTooltip
                    date={item.lastChangedDateTime ?? item.createDateTime}
                  >
                    <div className="text-muted-foreground text-sm">
                      {dateConversion(
                        item.lastChangedDateTime ?? item.createDateTime,
                      )}
                    </div>
                  </DateTooltip>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Create DID dialog. The method is chosen by the user, so an
          organization is never limited to its current primary DID method. */}
      {showPopup && (
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
          <DialogContent className="max-w-2xl!">
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
                    <div className="col-span-1 sm:col-span-2">
                      <Label>
                        DID Method{' '}
                        <span className="text-destructive text-xs">*</span>
                      </Label>
                      <Select
                        value={method ?? ''}
                        onValueChange={(value) =>
                          handleMethodChange(value as DidMethod, setFieldValue)
                        }
                      >
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Select DID method" />
                        </SelectTrigger>
                        <SelectContent>
                          {createDidMethods.map((didMethod) => (
                            <SelectItem key={didMethod} value={didMethod}>
                              {didMethod}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {completeDidMethodValue && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {completeDidMethodValue}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="ledger">Ledger</Label>
                      <Field
                        as={Input}
                        id="ledger"
                        name="ledger"
                        readOnly
                        tabIndex={-1}
                        className="bg-muted cursor-default select-none"
                        value={values.ledger}
                      />
                      <ErrorMessage
                        name="ledger"
                        component="div"
                        className="text-destructive mt-1 text-sm"
                      />
                    </div>

                    {(method === DidMethod.INDY ||
                      method === DidMethod.POLYGON) && (
                      <div>
                        <Label>
                          Network{' '}
                          <span className="text-destructive text-xs">*</span>
                        </Label>
                        <Select
                          value={values.network}
                          onValueChange={(value) => {
                            setFieldValue('network', value)
                            setCompleteDidMethodValue(
                              getCompleteDidMethod(method as DidMethod, value),
                            )
                          }}
                        >
                          <SelectTrigger className="mt-1 w-full">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            {(method === DidMethod.INDY
                              ? indyNetworks
                              : polygonNetworks
                            ).map((networkOption) => (
                              <SelectItem
                                key={networkOption}
                                value={networkOption}
                              >
                                {networkOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ErrorMessage
                          name="network"
                          component="div"
                          className="text-destructive mt-1 text-sm"
                        />
                      </div>
                    )}

                    {method === DidMethod.WEB && (
                      <div className="col-span-1 sm:col-span-2">
                        <Label htmlFor="domain">
                          Domain{' '}
                          <span className="text-destructive text-xs">*</span>
                        </Label>
                        <Field
                          as={Input}
                          id="domain"
                          name="domain"
                          placeholder="Enter domain (e.g., example.com)"
                          className="mt-1"
                        />
                        <ErrorMessage
                          name="domain"
                          component="div"
                          className="text-destructive mt-1 text-sm"
                        />
                        <p className="text-muted-foreground mt-1 text-sm">
                          Enter the domain where your DID document will be
                          hosted
                        </p>
                      </div>
                    )}

                    {(method === DidMethod.KEY || method === DidMethod.WEB) && (
                      <div className="col-span-1 space-y-4 rounded-md border p-4 sm:col-span-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="haveKeyMaterial"
                            checked={haveKeyMaterial}
                            onCheckedChange={(checked) => {
                              setHaveKeyMaterial(checked === true)
                              setFieldValue('privateKey', '')
                              setFieldValue('passphrase', '')
                            }}
                          />
                          <Label htmlFor="haveKeyMaterial">
                            Import an existing private key
                          </Label>
                        </div>

                        {haveKeyMaterial && (
                          <>
                            <div>
                              <Label htmlFor="privateKey">
                                Private key{' '}
                                <span className="text-destructive text-xs">
                                  *
                                </span>
                              </Label>
                              <Field
                                as={Textarea}
                                id="privateKey"
                                name="privateKey"
                                autoComplete="off"
                                spellCheck={false}
                                rows={4}
                                className="mt-1 font-mono text-xs"
                                placeholder="-----BEGIN PRIVATE KEY----- ... or a private JWK JSON"
                              />
                              <ErrorMessage
                                name="privateKey"
                                component="div"
                                className="text-destructive mt-1 text-sm"
                              />
                              <p className="text-muted-foreground mt-1 text-sm">
                                The key is encrypted in your browser to a
                                single-use key before it is sent, so it never
                                appears in request bodies or logs. PEM (PKCS#8,
                                SEC1 or PKCS#1, optionally encrypted), base64
                                DER (PKCS#8) or a private JWK. Ed25519, P-256,
                                P-384, P-521 and secp256k1 are supported; RSA is
                                available for did:web only.
                              </p>
                            </div>

                            <div>
                              <Label htmlFor="passphrase">
                                Passphrase (optional)
                              </Label>
                              <Field
                                as={Input}
                                id="passphrase"
                                name="passphrase"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Passphrase of an encrypted PEM key"
                                className="mt-1"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

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
                                    <div className="relative mt-3 w-full overflow-x-auto">
                                      <div className="flex w-full items-center">
                                        <div className="ml-2 shrink-0">
                                          <CopyDid
                                            value={generatedKeys.privateKey.slice(
                                              2,
                                            )}
                                            showCheck={true}
                                          />
                                        </div>
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
                                    <div className="text-sm">
                                      <span className="font-semibold">
                                        Address:
                                      </span>
                                      <CopyDid
                                        value={generatedKeys.address}
                                        className="mt-1"
                                        showCheck={true}
                                      />
                                    </div>
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
                                    checkBalance(
                                      e.target.value,
                                      Network.TESTNET,
                                    )
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
                            Follow these instructions to generate polygon
                            tokens:
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
                                    href={polygonFaucet}
                                    className="font-semibold underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {polygonFaucet}
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
                                  For eg. copy the address and check the balance
                                  on{' '}
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
                        (method === DidMethod.POLYGON && !values.privatekey) ||
                        (method === DidMethod.WEB && !values.domain) ||
                        ((method === DidMethod.KEY ||
                          method === DidMethod.WEB) &&
                          haveKeyMaterial &&
                          !values.privateKey)
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
      )}
    </div>
  )
}

export default DIDListComponent
