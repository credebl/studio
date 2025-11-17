'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, Network, Share2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  apiStatusCodes,
  polygonFaucet,
  polygonScan,
} from '@/config/CommonConstant'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DidMethod } from '@/common/enums'
import PageContainer from '@/components/layout/page-container'
import SetDomainValueInput from './SetDomainValueInput'
import SetPrivateKeyValueInput from './SetPrivateKeyValue'
import Stepper from '@/components/StepperComponent'
import { createDid } from '@/app/api/Agent'
import { nanoid } from 'nanoid'
import { useSearchParams } from 'next/navigation'

const TemplateCreation = (): React.JSX.Element => {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isApiInProgress, setIsApiInProgress] = useState<boolean>(false)
  const [selectedDid, setSelectedDid] = useState<string | null>(null)
  const [seeds, setSeeds] = useState<string>('')
  const [maskedSeeds, setMaskedSeeds] = useState<string>('')
  const [privateKeyValue, setPrivateKeyValue] = useState<string>('')
  const [alert, setAlert] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [domainValue, setDomainValue] = useState<string>('')
  const [domainError, setDomainError] = useState<string | null>(null)
 const totalSteps = 4
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId')

  useEffect(() => {
    const generatedSeeds = nanoid(32)
    const masked = maskSeeds(generatedSeeds)
    setSeeds(generatedSeeds)
    setMaskedSeeds(masked)
  }, [])

  const maskSeeds = (seed: string): string => {
    const visiblePart = seed.slice(0, -10)
    const maskedPart = seed.slice(-10).replace(/./g, '*')
    return visiblePart + maskedPart
  }

  const validateForm = (): boolean => {
    setDomainError(null)

    let isValid = true

    if (selectedDid === 'did:web' && !domainValue.trim()) {
      setDomainError('Domain is required')
      isValid = false
    }

    if (!selectedDid) {
      setAlert('Please select a DID method before continuing.')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return
    }

    try {
      setIsApiInProgress(true)
      setAlert(null)
      setSuccess(null)

      const didParts = selectedDid!.split(':')
      const fullMethod = didParts.slice(0, 2).join(':')
      const method = didParts[1]
      let network = ''

      if (fullMethod === DidMethod.INDY) {
        network = didParts.slice(-2).join(':')
      } else if (fullMethod === DidMethod.POLYGON) {
        network = didParts.slice(-2).join(':')
      }

      const payload = {
        seed: method === DidMethod.POLYGON ? '' : seeds,
        keyType: 'ed25519',
        method,
        ledger: didParts[2] || '',
        privatekey: privateKeyValue,
        network,
        domain: domainValue,
        role: method === 'indy' ? 'endorser' : '',
        endorserDid: '',
        clientSocketId: '',
        isPrimaryDid: true,
      }

      console.log('🚀 Payload for createDid:', payload)

      const spinupRes = await createDid(orgId!, payload)
      const { data } = spinupRes as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(data?.message)
        setAlert(null)
      } else {
        setAlert(data?.message || 'Failed to create DID')
        setSuccess(null)
      }
    } catch (error: any) {
      console.error('Error submitting shared wallet:', error)
      if (error.response?.data?.message) {
        const errorMessage = Array.isArray(error.response.data.message)
          ? error.response.data.message.join(', ')
          : error.response.data.message
        setAlert(errorMessage)
      } else {
        setAlert('Error creating DID.')
      }
    } finally {
      setIsApiInProgress(false)
    }
  }

  const handleDomainChange = (value: string) => {
    setDomainValue(value)
    if (domainError && value.trim()) {
      setDomainError(null)
    }
  }


  const protocolOptions = [
    {
      id: 'didcomm',
      title: 'DIDComm',
      desc: 'Use decentralized identifiers for peer-to-peer verifiable communication.',
      icon: <Network className="h-6 w-6 text-blue-600" />,
    },
    {
      id: 'oidc',
      title: 'OIDC',
      desc: 'Use OpenID Connect-based verifiable credential exchange.',
      icon: <Share2 className="h-6 w-6 text-green-600" />,
    },
  ]

  const subOptions =
    selectedProtocol === 'didcomm'
      ? [
          {
            id: 'anoncreds',
            title: 'AnonCreds',
            desc: 'Privacy-preserving credentials issued over DIDComm.',
          },
          {
            id: 'w3c',
            title: 'W3C',
            desc: 'W3C Verifiable Credentials compatible with DIDComm transport.',
          },
        ]
      : selectedProtocol === 'oidc'
        ? [
            {
              id: 'mdoc',
              title: 'MDOC',
              desc: 'Mobile Document (ISO/IEC 18013-5) via OIDC4VC.',
            },
            {
              id: 'sdjwt',
              title: 'SD-JWT',
              desc: 'Selective Disclosure JWT-based credentials for OIDC4VC.',
            },
          ]
        : []

  const didOptions =
    selectedOption === 'anoncreds'
      ? [
          'did:indy:bcovrin:testnet',
          'did:indy:indicio:demonet',
          'did:indy:indicio:mainnet',
          'did:indy:indicio:testnet',
        ]
      : selectedOption === 'w3c'
        ? ['did:polygon:testnet', 'did:polygon:mainnet', 'did:key', 'did:web']
        : []

  return (
    <PageContainer>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <Card className="border border-gray-200 shadow-sm">
              
            <CardHeader className="border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Wallet type</h1>
              <p className="">Setup wallet for your organization</p>
            </div>

            <div className="text-muted-foreground text-sm">
              Step 3 of {totalSteps}
            </div>
          </div>
          <Stepper currentStep={3} totalSteps={totalSteps} />
              <CardTitle className="text-lg font-semibold text-gray-900">
                Select Protocol
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Choose the protocol to issue your credential.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {protocolOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setSelectedProtocol(option.id)
                      setSelectedOption(null)
                      setSelectedDid(null)
                      setDomainError(null)
                    }}
                    className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                      selectedProtocol === option.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {selectedProtocol === option.id && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                    <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-3">
                      {option.icon}
                    </div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedProtocol && (
            <Card className="border border-gray-200 shadow-sm">
              <div className="m-4">
        
                {alert && (
                  <AlertComponent
                    message={alert}
                    type="failure"
                    onAlertClose={() => setAlert(null)}
                  />
                )}
                {success && (
                  <AlertComponent
                    message={success}
                    type="success"
                    onAlertClose={() => setSuccess(null)}
                  />
                )}
              </div>
              <CardHeader className="border-b border-gray-100 bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Select Credential Type
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Choose a credential format for{' '}
                  {selectedProtocol.toUpperCase()}.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {subOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedOption(option.id)
                        setSelectedDid(null)
                        setDomainError(null)
                      }}
                      className={`relative rounded-xl border-2 p-6 text-left transition-all ${
                        selectedOption === option.id
                          ? 'border-foreground bg-green-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      {selectedOption === option.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600">{option.desc}</p>
                    </button>
                  ))}
                </div>

                {selectedProtocol === 'didcomm' && selectedOption && (
                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Select DID Method <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedDid ?? ''}
                      onValueChange={(value) => {
                        setSelectedDid(value)
                        setDomainError(null) 
                      }}
                    >
                      <SelectTrigger className="w-full md:w-1/2">
                        <SelectValue placeholder="Select DID" />
                      </SelectTrigger>
                      <SelectContent>
                        {didOptions.map((did) => (
                          <SelectItem key={did} value={did}>
                            {did}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {selectedDid === 'did:web' && (
                  <SetDomainValueInput
                    domainValue={domainValue}
                    setDomainValue={handleDomainChange}
                    domainError={domainError}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {selectedDid === 'did:polygon:testnet' && (
            <Card className="mt-6 border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-white">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Polygon Configuration
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Configure your Polygon DID by setting the private key and
                  obtaining test tokens.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <div>
                  <SetPrivateKeyValueInput
                    orgId={orgId}
                    privateKeyValue={privateKeyValue}
                    setPrivateKeyValue={setPrivateKeyValue}
                  />
                </div>

                <div className="space-y-5">
                  <h4 className="text-sm font-medium text-gray-800">
                    Steps to get Polygon Testnet Tokens
                  </h4>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-sm font-semibold text-blue-600">
                          Step 1
                        </span>
                        <div className="text-sm text-gray-700">
                          Copy your address and claim free test tokens.
                          <div className="mt-1">
                            Visit{' '}
                            <a
                              href={polygonFaucet}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 underline hover:text-blue-700"
                            >
                              Polygon Faucet
                            </a>{' '}
                            to request tokens.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-sm font-semibold text-blue-600">
                          Step 2
                        </span>
                        <div className="text-sm text-gray-700">
                          Verify the token balance using Polygon Scan.
                          <div className="mt-1">
                            Visit{' '}
                            <a
                              href={polygonScan}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 underline hover:text-blue-700"
                            >
                              Polygon Scan
                            </a>{' '}
                            and paste your address to confirm receipt.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDid && (
            <div className="mt-6 flex flex-col items-end space-y-4">
              <Button
                onClick={handleSubmit}
                disabled={isApiInProgress || !selectedDid}
                className="rounded-lg bg-blue-600 px-8 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isApiInProgress ? 'Creating DID...' : 'Create DID'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

export default TemplateCreation
