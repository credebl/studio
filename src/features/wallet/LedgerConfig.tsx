/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { ReactNode, useEffect, useState } from 'react'
import {
  apiStatusCodes,
  polygonFaucet,
  polygonScan,
} from '@/config/CommonConstant'
import { getLedgerConfig, getLedgers } from '@/app/api/Agent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import CopyDid from './CopyDid'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import SetDomainValueInput from './SetDomainValueInput'
import SetPrivateKeyValueInput from './SetPrivateKeyValue'
import Stepper from '@/components/StepperComponent'
import { getDidValidationSchema } from '@/lib/validationSchemas'

const LedgerCard = ({
  ledger,
  title,
  description,
  icon,
  selectedLedger,
  handleLedgerSelect,
}: {
  ledger: string
  title: string
  description: string
  icon: ReactNode
  selectedLedger: string
  handleLedgerSelect: (ledger: string) => void
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

const LedgerConfig = ({
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
  const [selectedDid, setSelectedDid] = useState('')
  const [mappedData, setMappedData] = useState<ILedgerConfigData>()
  const [domainValue, setDomainValue] = useState<string>('')
  const [privateKeyValue, setPrivateKeyValue] = useState<string>('')
  const [, setNetworks] = useState([])
  const [walletLabel, setWalletLabel] = useState(walletName)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function processIndy(details: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, subDetails] of Object.entries(details)) {
      if (typeof subDetails === 'object' && subDetails !== null) {
        for (const [subKey, value] of Object.entries(subDetails)) {
          const formattedKey = `${key}:${subKey}`.replace(
            `${DidMethod.INDY}:`,
            '',
          )
          result[formattedKey] = value as string
        }
      }
    }
    return result
  }

  function processPolygon(
    details: Record<string, any>,
  ): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(details)) {
      if (typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          result[subKey] = subValue as string
        }
      } else if (typeof value === 'string') {
        result[key] = value
      }
    }
    return result
  }

  function processNoLedger(
    details: Record<string, any>,
  ): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(details)) {
      result[key] = value as string
    }
    return result
  }

  const fetchLedgerConfig = async (): Promise<void> => {
    try {
      const { data } = (await getLedgerConfig()) as AxiosResponse

      if (data?.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
        return
      }

      const ledgerConfigData: ILedgerConfigData = {
        indy: { [`${DidMethod.INDY}`]: {} },
        polygon: { [`${DidMethod.POLYGON}`]: {} },
        noLedger: {},
      }

      data.data.forEach(({ name, details }: ILedgerItem) => {
        if (!details) {
          return
        }

        const lowerName = name.toLowerCase()

        if (lowerName === Ledgers.INDY) {
          ledgerConfigData.indy[`${DidMethod.INDY}`] = processIndy(details)
        } else if (lowerName === Ledgers.POLYGON) {
          ledgerConfigData.polygon[`${DidMethod.POLYGON}`] =
            processPolygon(details)
        } else if (lowerName === Ledgers.NO_LEDGER.toLowerCase()) {
          ledgerConfigData.noLedger = processNoLedger(details)
        }
      })

      setMappedData(ledgerConfigData)
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
  }, [seeds])

  useEffect(() => {
    setWalletLabel(walletName)
  }, [walletName])

  const validations = getDidValidationSchema({
    haveDidShared,
    selectedMethod,
    includeLabel: true,
  })

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
      process.env.NEXT_PUBLIC_MODE === Environment.PROD &&
      selectedMethod === DidMethod.POLYGON
    ) {
      filteredNetworks = filteredNetworks.filter(
        (network) => network === Network.MAINNET,
      )
    } else if (
      (process.env.NEXT_PUBLIC_MODE === Environment.DEV ||
        process.env.NEXT_PUBLIC_MODE === Environment.QA) &&
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
        <Label className="pb-6">
          Network <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={selectedNetwork}
          onValueChange={(value) => {
            formikHandlers.setFieldValue('network', value)
            const didMethod = networkToDidMap[value] || ''
            handleNetworkChange(value, didMethod)
          }}
          disabled={!selectedMethod}
        >
          {filteredNetworks.map((network) => (
            <div key={network} className="flex items-center space-x-2">
              <RadioGroupItem
                value={networkOptions[network]}
                id={`network-${network}`}
                disabled={!selectedMethod}
                className="text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-gray-300 dark:border-gray-600"
              />
              <Label htmlFor={`network-${network}`}>{network}</Label>
            </div>
          ))}
        </RadioGroup>
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
        <Label className="pb-4">
          Method <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formikHandlers.values.method || ''}
          onValueChange={(value) => {
            formikHandlers.setFieldValue('method', value)
            handleMethodChange(value)
            setDomainValue('')
            formikHandlers.setFieldValue('network', '')
            setSelectedNetwork('')
          }}
        >
          {Object.keys(methods).map((method) => (
            <div key={method} className="flex items-center space-x-2 p-2.5">
              <RadioGroupItem
                value={method}
                id={`method-${method}`}
                className="text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-gray-300 dark:border-gray-600"
              />
              <Label htmlFor={`method-${method}`}>{method}</Label>
            </div>
          ))}
        </RadioGroup>
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
    }

    if (
      (selectedLedger === Ledgers.POLYGON && !privateKeyValue) ||
      (selectedLedger === Ledgers.INDY &&
        (!selectedMethod || !selectedNetwork)) ||
      (selectedLedger === Ledgers.NO_LEDGER &&
        (!selectedMethod || (selectedMethod === DidMethod.WEB && !domainValue)))
    ) {
      return true
    }

    return false
  }

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
      <div className="mb-4 flex items-center">
        <div>
          <h2 className="text-xl font-medium">Ledger Configuration</h2>
          <p className="text-muted-foreground text-sm">
            Choose your ledger and DID method
          </p>
        </div>
        <div className="text-muted-foreground ml-auto text-sm">Step 3 of 4</div>
      </div>
      <Stepper currentStep={3} totalSteps={4} />
      <RadioGroup
        value={haveDidShared ? 'haveDid' : 'createNew'}
        onValueChange={(value) => setHaveDidShared(value === 'haveDid')}
        className="mt-6 mb-6 flex items-center gap-6"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="createNew"
            id="createNewDid"
            className="text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-gray-300 dark:border-gray-600"
          />
          <label htmlFor="createNewDid" className="text-sm font-medium">
            Create a new DID
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem
            value="haveDid"
            id="haveDidShared"
            className="text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-gray-300 dark:border-gray-600"
          />
          <label htmlFor="haveDidShared" className="text-sm font-medium">
            I already have a DID
          </label>
        </div>
      </RadioGroup>

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

      <Formik
        initialValues={initialValues}
        enableReinitialize={true}
        validationSchema={yup.object().shape(validations)}
        onSubmit={async (
          values: IValuesShared,
          actions: FormikHelpers<IValuesShared>,
        ) => {
          setIsSubmitting(true)
          try {
            values.ledger = selectedLedger
            values.method = selectedMethod
            values.network = selectedNetwork
            if (!values.privatekey) {
              values.privatekey = privateKeyValue
            }

            submitSharedWallet(values, domainValue) // assuming async
            // assuming async
            actions.resetForm()
          } catch (error) {
            console.error('Submission failed:', error)
          } finally {
            setIsSubmitting(false)
          }
        }}
      >
        {(formikHandlers) => (
          <Form className="space-y-6">
            {haveDidShared && (
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <label
                    htmlFor="seed"
                    className="mb-2 block text-sm font-medium"
                  >
                    Seed <span className="text-destructive text-xs">*</span>
                  </label>
                  <Input
                    id="seed"
                    name="seed"
                    type="text"
                    className="block w-full rounded-lg p-2.5 sm:text-sm"
                    placeholder="Enter your seed"
                    value={formikHandlers.values.seed}
                    onChange={formikHandlers.handleChange}
                    onBlur={formikHandlers.handleBlur}
                  />
                </div>
                {formikHandlers.errors.seed && formikHandlers.touched.seed && (
                  <div className="text-destructive mt-1 text-xs">
                    {formikHandlers.errors.seed}
                  </div>
                )}
                {selectedMethod && (
                  <>
                    <div className="relative">
                      <label
                        htmlFor="did"
                        className="mb-2 block text-sm font-medium"
                      >
                        DID <span className="text-destructive text-xs">*</span>
                      </label>
                      <Input
                        id="did"
                        name="did"
                        type="text"
                        className="block w-full rounded-lg p-2.5 sm:text-sm"
                        placeholder="Enter your DID"
                        value={formikHandlers.values.did}
                        onChange={formikHandlers.handleChange}
                        onBlur={formikHandlers.handleBlur}
                      />
                    </div>
                    {formikHandlers.errors.did &&
                      formikHandlers.touched.did && (
                        <div className="text-destructive mt-1 text-xs">
                          {formikHandlers.errors.did}
                        </div>
                      )}
                  </>
                )}
              </div>
            )}

            <div className="mb-6">
              <h3 className="mb-4 text-lg font-medium">Select Ledger</h3>
              <div className="grid grid-cols-1 gap-18 md:grid-cols-3">
                <LedgerCard
                  ledger={Ledgers.INDY}
                  title=""
                  description="Hyperledger Indy"
                  selectedLedger={selectedLedger}
                  handleLedgerSelect={handleLedgerSelect}
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
                  description="Polygon Blockchain"
                  selectedLedger={selectedLedger}
                  handleLedgerSelect={handleLedgerSelect}
                  icon={
                    <Image
                      src="/images/polygon.png"
                      alt="Polygon Icon"
                      width={112}
                      height={112}
                    />
                  }
                />
                <LedgerCard
                  ledger={Ledgers.NO_LEDGER}
                  title=""
                  description="No Ledger"
                  selectedLedger={selectedLedger}
                  handleLedgerSelect={handleLedgerSelect}
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
            {selectedLedger && (
              <div className="rounded-lg border p-6 shadow">
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
                        as={Input}
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
                        as={Input}
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
                    <p className="mb-2 block text-sm font-medium">
                      Generated DID Method
                    </p>
                    <div className="text-muted-foreground rounded-lg">
                      {selectedDid}
                    </div>
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
                                  href={polygonFaucet}
                                  className="font-semibold underline"
                                >
                                  {polygonFaucet}
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
                                <a
                                  href={polygonScan}
                                  className="font-semibold underline"
                                >
                                  {polygonScan}
                                </a>
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
              <Button
                disabled={isSubmitDisabled() || isSubmitting}
                type="submit"
              >
                {isSubmitting ? <Loader /> : 'Create Identity'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default LedgerConfig
