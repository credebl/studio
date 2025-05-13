'use client'

import { Field, Form, Formik, type FormikHelpers, FormikProps } from 'formik'
import React, { ReactNode, useEffect, useState } from 'react'
import { getLedgerConfig, getLedgers } from '@/app/api/Agent'
import { apiStatusCodes } from '@/config/CommonConstant'
import * as yup from 'yup'
import type { AxiosResponse } from 'axios'
import { DidMethod, Environment, Ledgers, Network } from '../common/enum'
import { envConfig } from '@/config/envConfig'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CopyDid from './CopyDid'
import SetDomainValueInput from './SetDomainValueInput'
import SetPrivateKeyValueInput from './SetPrivateKeyValue'
import Stepper from '@/components/StepperComponent'
import {
  ILedgerConfigData,
  ILedgerConfigProps,
  ILedgerItem,
  IValuesShared,
} from '../organization/components/interfaces/organization'

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
  const [maskedSeedVal, setMaskedSeedVal] = useState('')
  const [selectedDid, setSelectedDid] = useState('')
  const [mappedData, setMappedData] = useState<ILedgerConfigData>()
  const [domainValue, setDomainValue] = useState<string>('')
  const [privateKeyValue, setPrivateKeyValue] = useState<string>('')
  const [, setNetworks] = useState([])
  const [walletLabel, setWalletLabel] = useState('')
  const id = React.useId()

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
    if (!selectedLedger || !mappedData || selectedMethod === DidMethod.KEY) {
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

    return (
      <div className="relative w-full">
        <label htmlFor="network" className="mb-2 block text-sm font-medium">
          Network <span className="text-destructive text-xs">*</span>
        </label>
        <select
          id="network"
          name="network"
          className="block w-full rounded-lg border p-2.5 text-sm"
          value={selectedNetwork}
          onChange={(e) => {
            formikHandlers.setFieldValue('network', e.target.value)
            const selectedOption = e.target.options[e.target.selectedIndex]
            const didMethod = selectedOption.getAttribute('data-did')
            handleNetworkChange(e.target.value, didMethod ?? '')
          }}
        >
          <option value="">Select Network</option>
          {filteredNetworks.map((network) => (
            <option
              key={network}
              value={networkOptions[network]}
              data-did={networkOptions[network]}
            >
              {network}
            </option>
          ))}
        </select>
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
        <label htmlFor="method" className="mb-2 block text-sm font-medium">
          Method <span className="text-destructive text-xs">*</span>
        </label>
        <select
          id="method"
          name="method"
          className="block w-full rounded-lg p-2.5 text-sm"
          value={formikHandlers.values.method || ''}
          onChange={(e) => {
            const { value } = e.target
            formikHandlers.setFieldValue('method', value)
            handleMethodChange(value)
            setDomainValue('')
          }}
        >
          <option value="">Select Method</option>
          {Object.keys(methods).map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </select>
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
    <div
      className={`border ${selectedLedger === ledger ? 'shadow-lg' : ''} flex cursor-pointer flex-col items-center justify-center rounded-lg p-6 transition-all hover:shadow-md`}
      onClick={() => handleLedgerSelect(ledger)}
    >
      <div
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
          ledger === Ledgers.INDY ? '' : ledger === Ledgers.POLYGON ? '' : ''
        }`}
      >
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-semibold">{title}</h3>
      <p className="text-center text-sm">{description}</p>
    </div>
  )

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
        <div className="mb-6 rounded-lg p-4">
          <div className="mb-2 block text-sm font-medium">
            {/* <Label value="Generated Seed" /> */}
            <Label htmlFor={`${id}-to`} className="sr-only">
              Generated Seed
            </Label>
          </div>
          <div className="flex items-center">
            <div className="flex-1 rounded-lg bg-white p-3 break-all">
              {maskedSeedVal}
            </div>
            <CopyDid className="ml-2" value={seedVal} />
          </div>

          <div className="mt-2 flex items-center text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Save this seed securely. It will be required to recover your wallet.
          </div>
        </div>
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
            title="Indy"
            description="Hyperledger Indy"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
          />
          <LedgerCard
            ledger={Ledgers.POLYGON}
            title="Polygon"
            description="Polygon blockchain"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
          />
          <LedgerCard
            ledger={Ledgers.NO_LEDGER}
            title="No Ledger"
            description="Local key generation"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-600"
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
        initialValues={
          {
            seed: seedVal || '',
            method: selectedMethod || '',
            network: selectedNetwork || '',
            did: '',
            ledger: selectedLedger || '',
            domain: '',
            privatekey: '',
            label: walletLabel,
            keyType: '',
          } as IValuesShared
        }
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

                  {renderNetworkOptions(formikHandlers)}
                </div>

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
                    value={walletLabel}
                    name="label"
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
                          <li className="flex items-start">
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
                          <li className="flex items-start">
                            <span className="mr-2 font-semibold">Step 2:</span>
                            <div>
                              Check that you have received the tokens.
                              <div className="mt-1">
                                For example, copy the address and check the
                                balance on{' '}
                                <a
                                  href="https://mumbai.polygonscan.com/"
                                  className="underline"
                                >
                                  https://mumbai.polygonscan.com/
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

            <div className="mt-8 flex justify-between">
              {/* <Button
                    variant='secondary'
                    onClick={() => router.push('/organizations/create-organization?step=2')}
                    className='flex items-center gap-2'
                    >
                    <ArrowLeft className='h-4 w-4' />
                    Back to Agent Config                   
            </Button> */}

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
