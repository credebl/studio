'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InfoText, apiStatusCodes } from '@/config/CommonConstant'
import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  didExamples,
  didOptionsMap,
  protocolOptions,
  subOptionsMap,
} from '@/config/didOptions'
import { useRouter, useSearchParams } from 'next/navigation'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DidMethod } from '@/common/enums'
import PageContainer from '@/components/layout/page-container'
import SetDomainValueInput from './SetDomainValueInput'
import SetPrivateKeyValueInput from './SetPrivateKeyValue'
import Stepper from '@/components/StepperComponent'
import TooltipInfo from '@/components/TooltipInfo'
import { createDid } from '@/app/api/Agent'
import { nanoid } from 'nanoid'

const CreateDid = (): React.JSX.Element => {
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(
    null,
  )
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isApiInProgress, setIsApiInProgress] = useState<boolean>(false)
  const [selectedDid, setSelectedDid] = useState<string | null>(null)
  const [seeds, setSeeds] = useState<string>('')
  const [privateKeyValue, setPrivateKeyValue] = useState<string>('')
  const [alert, setAlert] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [domainValue, setDomainValue] = useState<string>('')
  const [domainError, setDomainError] = useState<string | null>(null)
  type Protocol = 'didcomm' | 'oid4vc'
  const [step, setStep] = useState(3)

  const totalSteps = 4
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId')
  const router = useRouter()
  const redirectTo = searchParams.get('redirectTo')
  const clientAlias = searchParams.get('clientAlias')

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
        setSuccess(data?.message)
        setAlert(null)

        const params = new URLSearchParams({
          protocol: selectedProtocol || '',
          credentialType: selectedOption || '',
          didMethod: selectedDid || '',
          generatedDid,
          orgId: orgId || '',
        })
        if (redirectTo && clientAlias) {
          router.push(redirectTo)
        } else {
          router.push(`/did-details?${params.toString()}`)
        }
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

  const subOptions = subOptionsMap[selectedProtocol!] ?? []

  const didOptions = selectedOption ? (didOptionsMap[selectedOption] ?? []) : []

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
              <div className="">
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
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                {protocolOptions.map((option) => {
                  const isDisabled = option.id === 'oid4vc'
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (isDisabled) {
                          return
                        }
                        setSelectedProtocol(option.id as Protocol)
                        setSelectedOption(null)
                        setSelectedDid(null)
                        setDomainError(null)
                      }}
                      disabled={isDisabled}
                      className={`relative rounded-xl border-2 p-6 text-left transition-all ${selectedProtocol === option.id ? 'border-primary bg-secondary shadow-sm' : 'border-border bg-background hover:shadow-sm'} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''} `}
                    >
                      {option.id === 'didcomm' && (
                        <TooltipInfo text={InfoText.DIDCommInfoText} />
                      )}
                      {option.id === 'oid4vc' && (
                        <TooltipInfo text={InfoText.OID4VCInfoText} />
                      )}

                      <div className="mb-6">{option.icon}</div>

                      <h3 className="text-foreground mb-1 font-semibold">
                        {option.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {option.desc}
                      </p>
                    </button>
                  )
                })}
              </div>

              {selectedProtocol && (
                <div className="border-border -mx-6 mt-6 border-t px-6 pt-6">
                  <p className="text-foreground mb-2 font-medium">
                    Select Credential Type for {selectedProtocol.toUpperCase()}
                  </p>

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
                        <TooltipInfo
                          text={
                            option.id === 'anoncreds'
                              ? InfoText.AnonCredsInfoText
                              : option.id === 'w3c'
                                ? InfoText.W3CInfoText
                                : option.id === 'mdoc'
                                  ? InfoText.MDOCInfoText
                                  : InfoText.SDJWTInfoText
                          }
                        />

                        <h3 className="text-foreground mb-1 font-semibold">
                          {option.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {option.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                      <div className="rounded-md px-3 py-2 font-mono text-sm font-semibold whitespace-nowrap">
                        <span className="text-muted-foreground font-normal">
                          e.g.
                        </span>
                        <span className="ml-1">{didExamples[selectedDid]}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DID:web Domain Input */}
              {selectedDid === 'did:web' && (
                <SetDomainValueInput
                  domainValue={domainValue}
                  setDomainValue={handleDomainChange}
                  domainError={domainError}
                />
              )}
            </CardContent>
          </Card>

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

                <div className="space-y-5">
                  <h4 className="text-foreground/80 text-sm font-medium">
                    Steps to get Polygon Testnet Tokens
                  </h4>

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

export default CreateDid
