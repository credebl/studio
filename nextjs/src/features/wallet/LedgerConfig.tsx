/* eslint-disable max-lines */
'use client'

import * as yup from 'yup'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { DidMethod, Environment, Ledgers, Network } from '../common/enum'
import { Field, Form, Formik, type FormikHelpers, FormikProps } from 'formik'
import {
  ILedgerConfigData,
  ILedgerConfigProps,
  ILedgerItem,
  IValuesShared,
} from '../organization/components/interfaces/organization'
import React, { ReactNode, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiStatusCodes, polygonScan } from '@/config/CommonConstant'
import { getLedgerConfig, getLedgers } from '@/app/api/Agent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import CopyDid from './CopyDid'
import Image from 'next/image'
import { Label } from '@/components/ui/label'
import SetDomainValueInput from './SetDomainValueInput'
import SetPrivateKeyValueInput from './SetPrivateKeyValue'
import Stepper from '@/components/StepperComponent'
import { envConfig } from '@/config/envConfig'

const LedgerConfig = ({
  maskedSeeds,
  orgId,
  seeds,
  submitSharedWallet,
  walletName,
}: ILedgerConfigProps): React.JSX.Element => {
  const [haveDidShared, setHaveDidShared] = useState(false)
  const [selectedLedger, setSelectedLedger] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState('')
  const [seedVal, setSeedVal] = useState('')
  const [, setMaskedSeedVal] = useState('')
  const [selectedDid, setSelectedDid] = useState('')
  const [mappedData, setMappedData] = useState<ILedgerConfigData>()
  const [domainValue, setDomainValue] = useState<string>('')
  const [privateKeyValue, setPrivateKeyValue] = useState<string>('')
  const [, setNetworks] = useState([])
  const [walletLabel, setWalletLabel] = useState(walletName)

  const fetchLedgerConfig = async (): Promise<void> => {
    try {
      const { data } = (await getLedgerConfig()) as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const ledgerConfigData: ILedgerConfigData = {
          indy: {
            [`${DidMethod.INDY}`]: {},
          },
          polygon: {
            [`${DidMethod.POLYGON}`]: {},
          },
          noLedger: {},
        }

        data.data.forEach(({ name, details }: ILedgerItem) => {
          const lowerName = name.toLowerCase()

          if (lowerName === Ledgers.INDY && details) {
            for (const [key, subDetails] of Object.entries(details)) {
              if (typeof subDetails === 'object' && subDetails !== null) {
                for (const [subKey, value] of Object.entries(subDetails)) {
                  const formattedKey = `${key}:${subKey}`.replace(
                    `${DidMethod.INDY}:`,
                    '',
                  )
                  ledgerConfigData.indy[`${DidMethod.INDY}`][formattedKey] =
                    value as string
                }
              }
            }
          } else if (lowerName === Ledgers.POLYGON && details) {
            for (const [key, value] of Object.entries(details)) {
              if (typeof value === 'object' && value !== null) {
                for (const [subKey, subValue] of Object.entries(value)) {
                  ledgerConfigData.polygon[`${DidMethod.POLYGON}`][subKey] =
                    subValue as string
                }
              } else if (typeof value === 'string') {
                ledgerConfigData.polygon[`${DidMethod.POLYGON}`][key] = value
              }
            }
          } else if (lowerName === Ledgers.NO_LEDGER.toLowerCase() && details) {
            for (const [key, value] of Object.entries(details)) {
              ledgerConfigData.noLedger[key] = value as string
            }
          }
        })

        setMappedData(ledgerConfigData)
      }
    } catch (err) {
      console.error('Fetch Network ERROR::::', err)
    }
  }

  const fetchNetworks = async (): Promise<void> => {
    try {
      const { data } = (await getLedgers()) as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setNetworks(data?.data || [])
      }
    } catch (err) {
      console.error('Fetch Network ERROR::::', err)
    }
  }

  const handleLedgerSelect = (ledger: string): void => {
    setSelectedLedger(ledger)
    setSelectedMethod('')
    setSelectedNetwork('')
    setSelectedDid('')
  }

  const handleMethodChange = (method: string): void => {
    setSelectedMethod(method)
    setSelectedDid('')
  }

  const handleNetworkChange = (network: string, didMethod: string): void => {
    setSelectedNetwork(network)
    setSelectedDid(didMethod)
  }

  useEffect(() => {
    fetchNetworks()
    fetchLedgerConfig()
  }, [])

  useEffect(() => {
    setSeedVal(seeds)
    setMaskedSeedVal(maskedSeeds)
  }, [seeds])

  useEffect(() => {
    setWalletLabel(walletName)
  }, [walletName])

  const validations = {
    label: yup
      .string()
      .required('Wallet label is required')
      .trim()
      .min(2, 'Wallet label must be at least 2 characters')
      .max(25, 'Wallet label must be at most 25 characters'),
    method: yup.string().required('Method is required'),
    ledger: yup.string().required('Ledger is required'),
    ...(haveDidShared && {
      seed: yup.string().required('Seed is required'),
      did: yup.string().required('DID is required'),
    }),
    ...((DidMethod.INDY === selectedMethod ||
      DidMethod.POLYGON === selectedMethod) && {
      network: yup.string().required('Network is required'),
    }),
    ...(DidMethod.WEB === selectedMethod && {
      domain: yup.string().required('Domain is required'),
    }),
  }

  const renderNetworkOptions = (
    formikHandlers: FormikProps<IValuesShared>,
  ): React.JSX.Element | null => {
    if (
      !selectedLedger ||
      !mappedData ||
      selectedMethod === DidMethod.KEY ||
      selectedMethod === DidMethod.WEB
    ) {
      return null
    }

    const networkOptions =
      mappedData[selectedLedger as keyof ILedgerConfigData][
        selectedMethod as keyof ILedgerConfigData[keyof ILedgerConfigData]
      ]

    if (!networkOptions) {
      return null
    }

    let filteredNetworks = Object.keys(networkOptions)
    if (
      envConfig.MODE === Environment.PROD &&
      selectedMethod === DidMethod.POLYGON
    ) {
      filteredNetworks = filteredNetworks.filter(
        (network) => network === Network.MAINNET,
      )
    } else if (
      (envConfig.MODE === Environment.DEV ||
        envConfig.MODE === Environment.QA) &&
      selectedMethod === DidMethod.POLYGON
    ) {
      filteredNetworks = filteredNetworks.filter(
        (network) => network === Network.TESTNET,
      )
    }

    // Create a mapping of network values to didMethods
    const networkToDidMap: Record<string, string> = {}
    filteredNetworks.forEach((network) => {
      networkToDidMap[networkOptions[network]] = networkOptions[network]
    })

    return (
      <div className="relative w-full">
        <Label className="pb-2">
          Network <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedNetwork}
          onValueChange={(value) => {
            formikHandlers.setFieldValue('network', value)
            const didMethod = networkToDidMap[value] || ''
            handleNetworkChange(value, didMethod)
          }}
          disabled={!selectedMethod}
        >
          <SelectTrigger className="disabled:bg-muted flex h-10 w-full items-center justify-between border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">
            <SelectValue placeholder="Select Network" />
          </SelectTrigger>
          <SelectContent>
            {filteredNetworks.map((network) => (
              <SelectItem key={network} value={networkOptions[network]}>
                {network}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formikHandlers.errors.network && formikHandlers.touched.network && (
          <div className="text-destructive mt-1 text-xs">
            {formikHandlers.errors.network}
          </div>
        )}
      </div>
    )
  }

  const renderMethodOptions = (
    formikHandlers: FormikProps<IValuesShared>,
  ): React.JSX.Element | null => {
    if (!selectedLedger || !mappedData) {
      return null
    }

    const methods = mappedData[selectedLedger as keyof ILedgerConfigData]

    if (!methods) {
      return null
    }

    return (
      <div className="relative w-full">
        <Label className="pb-2">
          Method <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formikHandlers.values.method || ''}
          onValueChange={(value) => {
            formikHandlers.setFieldValue('method', value)
            handleMethodChange(value)
            setDomainValue('')
            // Reset network when method changes
            formikHandlers.setFieldValue('network', '')
            setSelectedNetwork('')
          }}
        >
          <SelectTrigger className="disabled:bg-muted flex h-10 w-full items-center justify-between border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50">
            <SelectValue placeholder="Select Method" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(methods).map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formikHandlers.errors.method && formikHandlers.touched.method && (
          <div className="text-destructive mt-1 text-xs">
            {formikHandlers.errors.method}
          </div>
        )}
      </div>
    )
  }

  const isSubmitDisabled = (): boolean => {
    if (!selectedLedger) {
      return true
    } else if (
      (selectedLedger === Ledgers.POLYGON && !privateKeyValue) ||
      (selectedLedger === Ledgers.INDY && (!selectedMethod || !selectedNetwork))
    ) {
      return true
    } else if (
      (selectedLedger === Ledgers.NO_LEDGER && !selectedMethod) ||
      (selectedLedger === Ledgers.NO_LEDGER &&
        selectedMethod === DidMethod.WEB &&
        !domainValue)
    ) {
      return true
    }

    return false
  }

  const LedgerCard = ({
    ledger,
    title,
    description,
    icon,
  }: {
    ledger: string
    title: string
    description: string
    icon: ReactNode
  }): React.JSX.Element => (
    <Card
      className={`flex cursor-pointer flex-col items-center p-4 text-center shadow transition-all hover:scale-[1.02] ${
        selectedLedger === ledger ? 'bg-muted border-2' : 'border'
      }`}
      onClick={() => handleLedgerSelect(ledger)}
    >
      <div className="mb-4 flex items-center justify-center">{icon}</div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="text-sm">{description}</p>
    </Card>
  )

  const initialValues: IValuesShared = {
    seed: seedVal || '',
    method: selectedMethod || '',
    network: selectedNetwork || '',
    did: '',
    ledger: selectedLedger || '',
    domain: '',
    privatekey: '',
    label: walletLabel,
    keyType: '',
    role: '',
  }

  return (
    <div className="">
      <div className="mb-6">
        <h2 className="mb-1 text-xl font-semibold">Ledger Configuration</h2>
        <p className="text-sm">Choose your ledger and DID method</p>
      </div>
      <Stepper currentStep={3} totalSteps={4} />
      <div className="mt-6 mb-6 flex items-center gap-4">
        <div className="flex items-center">
          <input
            id="createNewDid"
            type="radio"
            name="didOption"
            className="h-4 w-4 focus:ring-yellow-500"
            checked={!haveDidShared}
            onChange={() => setHaveDidShared(false)}
          />
          <label htmlFor="createNewDid" className="ml-2 text-sm font-medium">
            Create a new DID
          </label>
        </div>
        <div className="ml-6 flex items-center">
          <input
            id="haveDidShared"
            type="radio"
            name="didOption"
            className="h-4 w-4"
            checked={haveDidShared}
            onChange={() => setHaveDidShared(true)}
          />
          <label htmlFor="haveDidShared" className="ml-2 text-sm font-medium">
            I already have a DID
          </label>
        </div>
      </div>

      {!haveDidShared && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <Label className="mb-2 block text-sm font-medium">
              Generated Seed
            </Label>
            <div className="flex items-center">
              <CopyDid className="ml-2" value={seedVal} />
            </div>
            <Alert variant="default" className="mt-2">
              <AlertDescription className="flex items-center text-sm">
                Save this seed securely. It will be required to recover your
                wallet.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {haveDidShared && (
        <div className="mb-6 space-y-4">
          <div className="relative">
            <label htmlFor="seed" className="mb-2 block text-sm font-medium">
              Seed <span className="text-destructive text-xs">*</span>
            </label>
            <input
              id="seed"
              name="seed"
              type="text"
              className="block w-full rounded-lg p-2.5 sm:text-sm"
              placeholder="Enter your seed"
            />
          </div>
          <div className="relative">
            <label htmlFor="did" className="mb-2 block text-sm font-medium">
              DID <span className="text-destructive text-xs">*</span>
            </label>
            <input
              id="did"
              name="did"
              type="text"
              className="block w-full rounded-lg p-2.5 sm:text-sm"
              placeholder="Enter your DID"
            />
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-4 text-lg font-medium">Select Ledger</h3>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <LedgerCard
            ledger={Ledgers.INDY}
            title=""
            description="Hyperledger Indy"
            icon={
              <Image
                src="/images/Indicio.png"
                alt="Indy Icon"
                width={112}
                height={112}
              />
            }
          />
          <LedgerCard
            ledger={Ledgers.POLYGON}
            title=""
            description="Polygon blockchain"
            icon={
              <Image
                src="/images/polygon.png"
                alt="Indy Icon"
                width={112}
                height={112}
              />
            }
          />
          <LedgerCard
            ledger={Ledgers.NO_LEDGER}
            title=""
            description="Local key generation"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mb-4 h-8 w-8 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            }
          />
        </div>
      </div>
      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={yup.object().shape(validations)}
        onSubmit={(
          values: IValuesShared,
          actions: FormikHelpers<IValuesShared>,
        ) => {
          values.ledger = selectedLedger
          values.method = selectedMethod
          values.network = selectedNetwork
          if (!values.privatekey) {
            values.privatekey = privateKeyValue
          }
          submitSharedWallet(values, domainValue)
          actions.resetForm()
        }}
      >
        {(formikHandlers) => (
          <Form className="space-y-6">
            {selectedLedger && (
              <div className="rounded-lg p-6 shadow">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {renderMethodOptions(formikHandlers)}

                  {/* This will show either the network dropdown OR the wallet label */}
                  {!selectedMethod ||
                  selectedMethod === DidMethod.KEY ||
                  selectedMethod === DidMethod.WEB ? (
                    <div className="relative w-full">
                      <label
                        htmlFor="label"
                        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Wallet Label{' '}
                        <span className="text-destructive text-xs">*</span>
                      </label>
                      <Field
                        id="label"
                        name="label"
                        value={walletLabel}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setWalletLabel(e.target.value)
                        }
                        className="block w-full rounded-lg p-2.5 sm:text-sm"
                        type="text"
                      />
                      {formikHandlers.errors.label &&
                        formikHandlers.touched.label && (
                          <div className="text-destructive mt-1 text-xs">
                            {formikHandlers.errors.label}
                          </div>
                        )}
                    </div>
                  ) : (
                    renderNetworkOptions(formikHandlers)
                  )}
                </div>

                {/* Wallet label moves here when network dropdown is visible */}
                {selectedMethod &&
                  selectedMethod !== DidMethod.KEY &&
                  selectedMethod !== DidMethod.WEB && (
                    <div className="mt-6">
                      <label
                        htmlFor="label"
                        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Wallet Label{' '}
                        <span className="text-destructive text-xs">*</span>
                      </label>
                      <Field
                        id="label"
                        name="label"
                        value={walletLabel}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setWalletLabel(e.target.value)
                        }
                        className="block w-full rounded-lg p-2.5 sm:text-sm"
                        type="text"
                      />
                      {formikHandlers.errors.label &&
                        formikHandlers.touched.label && (
                          <div className="text-destructive mt-1 text-xs">
                            {formikHandlers.errors.label}
                          </div>
                        )}
                    </div>
                  )}

                {selectedDid && (
                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium">
                      Generated DID Method
                    </label>
                    <div className="rounded-lg p-3">{selectedDid}</div>
                  </div>
                )}

                {selectedMethod === DidMethod.WEB && (
                  <div className="mt-6">
                    <SetDomainValueInput
                      setDomainValue={setDomainValue}
                      domainValue={domainValue}
                      formikHandlers={formikHandlers}
                    />
                  </div>
                )}

                {selectedMethod === DidMethod.POLYGON && (
                  <div className="bg-muted mx-auto mt-6 max-w-2xl rounded-lg p-4">
                    <div className="">
                      <div>
                        <SetPrivateKeyValueInput
                          orgId={orgId}
                          setPrivateKeyValue={setPrivateKeyValue}
                          privateKeyValue={privateKeyValue}
                          formikHandlers={formikHandlers}
                        />
                      </div>
                      <div>
                        <h4 className="mb-3 text-sm font-medium">
                          Follow these instructions to generate polygon tokens:
                        </h4>
                        <ol className="space-y-3 text-sm">
                          <li className="">
                            <span className="mr-2 font-semibold">Step 1:</span>
                            <div>
                              Copy the address and get the free tokens for the
                              testnet.
                              <div className="mt-1">
                                For example, use{' '}
                                <a
                                  href="https://faucet.polygon.technology/"
                                  className="underline"
                                >
                                  https://faucet.polygon.technology/
                                </a>{' '}
                                to get free tokens.
                              </div>
                            </div>
                          </li>
                          <li className="">
                            <span className="mr-2 font-semibold">Step 2:</span>
                            <div>
                              Check that you have received the tokens.
                              <div className="mt-1">
                                For example, copy the address and check the
                                balance on{' '}
                                <a href={polygonScan} className="underline">
                                  {polygonScan}
                                </a>
                                .
                              </div>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button disabled={isSubmitDisabled()} type="submit">
                Create Identity
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default LedgerConfig
