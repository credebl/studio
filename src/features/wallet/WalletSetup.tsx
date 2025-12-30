'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AlertComponent } from '@/components/AlertComponent'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DedicatedAgentForm from './DedicatedAgentForm'
import { Label } from '@/components/ui/label'
import { Loader } from 'lucide-react'
import SharedAgentForm from './SharedAgentForm'
import Stepper from '@/components/StepperComponent'
import { apiStatusCodes } from '@/config/CommonConstant'

export enum AgentType {
  SHARED = 'shared',
  DEDICATED = 'dedicated',
}

export interface WalletData {
  id: string
  orgId: string
  agentSpinUpStatus: number
  agentEndPoint: string
  tenantId: string | null
  walletName: string
}

export interface WalletResponse {
  statusCode: number
  message: string
  data: WalletData
}

const WalletSetup = (): React.JSX.Element => {
  const [agentType, setAgentType] = useState<AgentType>(AgentType.SHARED)
  const [alert, setAlert] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const totalSteps = 4
  const [sharedWalletResponse, setSharedWalletResponse] =
    useState<WalletResponse | null>()
  const [dedicatedWalletResponse, setDedicatedWalletResponse] =
    useState<WalletResponse | null>(null)
  const [activeButton, setActiveButton] = useState<'skip' | 'continue' | null>(
    null,
  )
  const router = useRouter()
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId') ?? ''
  const clientAlias = searchParams.get('clientAlias')
  const isVerifierClient = clientAlias?.trim().toUpperCase() === 'VERIFIER'
  const redirectTo = searchParams.get('redirectTo')

  const handleSharedWalletCreated = (response?: WalletResponse): void => {
    setSharedWalletResponse(response ?? null)
    if (response?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setIsDialogOpen(true)
    } else {
      setAlert(response?.message || 'Failed to create shared wallet')
    }
  }

  const handleDedicatedWalletCreated = (response?: WalletResponse): void => {
    setDedicatedWalletResponse(response ?? null)
    if (response?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setIsDialogOpen(true)
    } else {
      setAlert(response?.message || 'Failed to create dedicated wallet')
    }
  }

  const handleContinue = (): void => {
    const redirectUrl =
      redirectTo && clientAlias
        ? `/create-did?orgId=${orgId}&redirectTo=${encodeURIComponent(
            redirectTo,
          )}&clientAlias=${clientAlias}`
        : `/create-did?orgId=${orgId}`

    router.push(redirectUrl)
  }

  const isAnyWalletCreated = Boolean(
    sharedWalletResponse || dedicatedWalletResponse,
  )

  const getLabelClasses = (): string => {
    if (isVerifierClient) {
      return 'cursor-not-allowed opacity-50'
    }

    if (agentType === AgentType.DEDICATED) {
      return 'border-blue-500 bg-blue-50 shadow-md'
    }
    return 'border-gray-200 hover:border-blue-300'
  }
  const labelClasses = getLabelClasses()

  return (
    <div className="mx-auto mt-10 max-w-5xl">
      {alert && (
        <div className="mx-auto mt-6 w-full max-w-5xl" role="alert">
          <AlertComponent
            message={alert}
            type="failure"
            onAlertClose={() => setAlert(null)}
          />
        </div>
      )}

      <Card className="p-6">
        <div
          className={`${
            isAnyWalletCreated
              ? 'pointer-events-none opacity-60 select-none'
              : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Wallet type</h1>
              <p className="">Setup wallet for your organization</p>
            </div>

            <div className="text-muted-foreground text-sm">
              Step 2 of {totalSteps}
            </div>
          </div>
          <Stepper currentStep={2} totalSteps={totalSteps} />

          <RadioGroup
            value={agentType}
            onValueChange={(value) => {
              if (!isAnyWalletCreated) {
                setAgentType(value as AgentType)
              }
            }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
          >
            <Label
              htmlFor="dedicated"
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${labelClasses}`}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem
                  id="dedicated"
                  className="border"
                  value={AgentType.DEDICATED}
                  disabled={isVerifierClient}
                />

                <div>
                  <h3 className="mb-1 font-semibold text-gray-800">
                    Dedicated Agent
                  </h3>
                  <p className="text-sm text-gray-600">
                    Private agent instance exclusively for your organization
                  </p>
                  <ul className="mt-2 ml-5 list-disc space-y-1 text-sm text-gray-600">
                    <li>Higher performance and reliability</li>
                    <li>Enhanced privacy and security</li>
                    <li>Full control over the agent infrastructure</li>
                  </ul>
                </div>
              </div>
            </Label>

            <Label
              htmlFor="shared"
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                agentType === AgentType.SHARED
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem
                  id="shared"
                  className="border"
                  value={AgentType.SHARED}
                />
                <div>
                  <h3 className="mb-1 font-semibold text-gray-800">
                    Shared Agent
                  </h3>
                  <p className="text-sm text-gray-600">
                    Use our cloud-hosted shared agent infrastructure
                  </p>
                  <ul className="mt-2 ml-5 list-disc space-y-1 text-sm text-gray-600">
                    <li>Cost-effective solution</li>
                    <li>Managed infrastructure</li>
                    <li>Quick setup with no maintenance</li>
                  </ul>
                </div>
              </div>
            </Label>
          </RadioGroup>

          <div className="mt-10">
            {agentType === AgentType.DEDICATED ? (
              <DedicatedAgentForm
                orgId={orgId}
                onSuccess={handleDedicatedWalletCreated}
              />
            ) : (
              <SharedAgentForm
                orgId={orgId}
                onSuccess={handleSharedWalletCreated}
              />
            )}
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent
          className="max-w-md rounded-2xl p-8 text-center [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-9 w-9 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            Wallet created successfully!
          </h2>

          <p className="text-gray-600">
            {redirectTo || clientAlias
              ? 'Proceed to DID creation to continue your setup.'
              : 'Would you like to continue with DID creation or skip it for now?'}
          </p>

          <div className="flex justify-center gap-4 pt-4">
            {!redirectTo && !clientAlias && (
              <Button
                variant="outline"
                onClick={() => {
                  setActiveButton('skip')
                  router.push('/dashboard')
                }}
                className="px-6"
                disabled={activeButton !== null}
              >
                {activeButton === 'skip' ? <Loader /> : 'Skip'}
              </Button>
            )}

            <Button
              onClick={() => {
                setActiveButton('continue')
                handleContinue()
              }}
              className="bg-blue-600 px-6 text-white hover:bg-blue-700"
              disabled={activeButton !== null}
            >
              {activeButton === 'continue' ? <Loader /> : 'Continue'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WalletSetup
