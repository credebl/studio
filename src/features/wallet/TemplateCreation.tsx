'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, Info } from 'lucide-react'
import React, { useEffect, useState } from 'react'
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
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { didExamples, protocolOptions } from '@/config/didOptions'
import { useRouter, useSearchParams } from 'next/navigation'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DidMethod } from '@/common/enums'
import PageContainer from '@/components/layout/page-container'
import SetDomainValueInput from './SetDomainValueInput'
import SetPrivateKeyValueInput from './SetPrivateKeyValue'
import Stepper from '@/components/StepperComponent'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createDid } from '@/app/api/Agent'
import { nanoid } from 'nanoid'

const TemplateCreation = (): React.JSX.Element => {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isApiInProgress, setIsApiInProgress] = useState<boolean>(false)
  const [selectedDid, setSelectedDid] = useState<string | null>(null)
  const [seeds, setSeeds] = useState<string>('')
  const [privateKeyValue, setPrivateKeyValue] = useState<string>('')
  const [alert, setAlert] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [domainValue, setDomainValue] = useState<string>('')
  const [domainError, setDomainError] = useState<string | null>(null)
  const [_createdDid, setCreatedDid] = useState<string | null>(null)
  const [step, setStep] = useState(3)

  const totalSteps = 4
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId')
  const router = useRouter()

  useEffect(() => {
    const generatedSeeds = nanoid(32)
    setSeeds(generatedSeeds)
  }, [])

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
      setStep(4)
      setIsApiInProgress(true)
      setAlert(null)
      setSuccess(null)

      const didParts = selectedDid!.split(':')
      const [didPrefix, method] = didParts
      const fullMethod = `${didPrefix}:${method}`
      let network = ''

      if (fullMethod === DidMethod.INDY || fullMethod === DidMethod.POLYGON) {
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

      const spinupRes = await createDid(orgId!, payload)
      const { data } = spinupRes as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const generatedDid = data?.did || data?.data?.did || data?.result?.did

        if (!generatedDid) {
          console.error('API Response:', data)
          setAlert(
            'DID created but could not retrieve DID identifier. Please check the response.',
          )
          return
        }

        setCreatedDid(generatedDid)
        setSuccess(data?.message)
        setAlert(null)

        const params = new URLSearchParams({
          protocol: selectedProtocol || '',
          credentialType: selectedOption || '',
          didMethod: selectedDid || '',
          generatedDid,
          orgId: orgId || '',
        })
        router.push(`/did-details?${params.toString()}`)
      } else {
        setAlert(data?.message || 'Failed to create DID')
        setSuccess(null)
      }
    } catch (error) {
      console.error('Error creating did', error)
    } finally {
      setIsApiInProgress(false)
    }
  }

  const handleDomainChange = (value: string): void => {
    setDomainValue(value)
    if (domainError && value.trim()) {
      setDomainError(null)
    }
  }

  type SubOption = {
    id: string
    title: string
    desc: string
  }

  let subOptions: SubOption[] = []
  if (selectedProtocol === 'didcomm') {
    subOptions = [
      {
        id: 'anoncreds',
        title: 'AnonCreds',
        desc: 'Privacy-preserving credentials issued over DIDComm.',
      },
      {
        id: 'w3c',
        title: 'W3C/JSONLD',
        desc: 'W3C Verifiable Credentials compatible with DIDComm transport.',
      },
    ]
  } else if (selectedProtocol === 'oid') {
    subOptions = [
      {
        id: 'mdoc',
        title: 'MDOC',
        desc: 'Mobile Document (ISO/IEC 18013-5) via OID4VC.',
      },
      {
        id: 'sdjwt',
        title: 'SD-JWT',
        desc: 'Selective Disclosure JWT-based credentials for OID4VC.',
      },
    ]
  } else {
    subOptions = []
  }

  let didOptions: string[] = []
  if (selectedOption === 'anoncreds') {
    didOptions = [
      'did:indy:bcovrin:testnet',
      'did:indy:indicio:demonet',
      'did:indy:indicio:mainnet',
      'did:indy:indicio:testnet',
    ]
  } else if (selectedOption === 'w3c') {
    didOptions = [
      'did:polygon:testnet',
      'did:polygon:mainnet',
      'did:key',
      'did:web',
    ]
  } else {
    didOptions = []
  }

  return (
    <PageContainer>
      <div className="bg-background min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <Card className="border-border border shadow-sm">
            <CardHeader className="border-border bg-background border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-foreground text-2xl font-semibold">
                    Wallet type
                  </h1>
                  <p className="text-muted-foreground">
                    Setup wallet for your organization
                  </p>
                </div>

                <div className="text-muted-foreground text-sm">
                  Step {step} of {totalSteps}
                </div>
              </div>

              <Stepper currentStep={step} totalSteps={totalSteps} />

              <CardTitle className="text-foreground text-lg font-semibold">
                Select Protocol
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
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
                        ? 'border-primary bg-secondary shadow-sm'
                        : 'border-border bg-background hover:border-foreground/30 hover:shadow-sm'
                    }`}
                  >
                    {option.id === 'oid' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="bg-background absolute top-3 right-3 cursor-pointer rounded-full p-1 shadow">
                              <Info className="text-muted-foreground h-4 w-4" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-sm">
                            <p>
                              OID4VC is a suite of specifications that
                              standardizes digital credentials using OAuth 2.0 /
                              OpenID Connect.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    <div className="mb-6">{option.icon}</div>

                    <h3 className="text-foreground mb-1 font-semibold">
                      {option.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {option.desc}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedProtocol && (
            <Card className="border-border border shadow-sm">
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

              <CardHeader className="border-border bg-background border-b">
                <CardTitle className="text-foreground text-lg font-semibold">
                  Select Credential Type
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
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
                          ? 'border-primary bg-secondary shadow-sm'
                          : 'border-border bg-background hover:border-foreground/30 hover:shadow-sm'
                      }`}
                    >
                      {selectedOption === option.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="text-primary h-5 w-5" />
                        </div>
                      )}

                      <h3 className="text-foreground mb-1 font-semibold">
                        {option.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {option.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {selectedProtocol === 'didcomm' && selectedOption && (
                  <div className="mt-6">
                    <label className="text-foreground mb-2 block text-sm font-medium">
                      Select DID Method{' '}
                      <span className="text-destructive">*</span>
                    </label>

                    <div className="flex items-center gap-4">
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

                      {selectedDid && (
                        <div className="text-muted-foreground rounded-md px-3 py-2 text-sm whitespace-nowrap">
                          e.g. {didExamples[selectedDid]}
                        </div>
                      )}
                    </div>
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
            <Card className="border-border mt-6 border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground text-lg font-semibold">
                  Polygon Configuration
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  Configure your Polygon DID by setting the private key.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                <SetPrivateKeyValueInput
                  orgId={orgId || ''}
                  privateKeyValue={privateKeyValue}
                  setPrivateKeyValue={setPrivateKeyValue}
                />

                {/* Steps */}
                <div className="space-y-5">
                  <h4 className="text-foreground/80 text-sm font-medium">
                    Steps to get Polygon Testnet Tokens
                  </h4>

                  {/* Step box */}
                  <div className="space-y-4">
                    <div className="border-border bg-secondary rounded-lg border p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-primary text-sm font-semibold">
                          Step 1
                        </span>
                        <div className="text-foreground/80 text-sm">
                          Copy your address and claim test tokens.
                        </div>
                      </div>
                    </div>

                    <div className="border-border bg-secondary rounded-lg border p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-primary text-sm font-semibold">
                          Step 2
                        </span>
                        <div className="text-foreground/80 text-sm">
                          Verify the balance using Polygon Scan.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDid && (
            <div className="mt-6 flex flex-col items-end">
              <Button
                onClick={handleSubmit}
                disabled={isApiInProgress}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-2 font-medium shadow-sm disabled:opacity-50"
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
