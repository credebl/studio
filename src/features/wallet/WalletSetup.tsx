'use client'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DedicatedAgentForm from './DedicatedAgentForm'
import { Label } from '@/components/ui/label'
import SharedAgentForm from './SharedAgentForm'

export enum AgentType {
  SHARED = 'shared',
  DEDICATED = 'dedicated',
}

const WalletSetup = (): React.JSX.Element => {
  const [agentType, setAgentType] = useState<AgentType>(AgentType.SHARED)
  const [sharedWalletCreated, setSharedWalletCreated] = useState<boolean>(false)
  const [dedicatedWalletCreated, setDedicatedWalletCreated] =
    useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId') ?? ''

  // When shared wallet creation succeeds
  const handleSharedWalletCreated = (): void => {
    setSharedWalletCreated(true)
  }

  // When shared wallet creation succeeds
  const handleDedicatedWalletCreated = (): void => {
    setDedicatedWalletCreated(true)
  }

  // Navigation handlers
  const handleContinue = (): void => {
    router.push('/template-creation')
  }

  const handleSkip = (): void => {
    router.push('/dashboard')
  }

  return (
    <div className="mx-auto mt-10 max-w-5xl">
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold">Agent Type</h2>

        {/* If neither wallet is created, show radio + forms */}
        {!sharedWalletCreated && !dedicatedWalletCreated ? (
          <>
            <RadioGroup
              value={agentType}
              onValueChange={(value) => setAgentType(value as AgentType)}
              className="grid grid-cols-1 gap-6 md:grid-cols-2"
            >
              {/* Dedicated Agent */}
              <Label
                htmlFor="dedicated"
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  agentType === AgentType.DEDICATED
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem id="dedicated" value={AgentType.DEDICATED} />
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

              {/* Shared Agent */}
              <Label
                htmlFor="shared"
                className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                  agentType === AgentType.SHARED
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <RadioGroupItem id="shared" value={AgentType.SHARED} />
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

            {/* Conditionally Render Forms */}
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
          </>
        ) : (
          // ✅ Success Screen (for either wallet type)
          <div className="mt-10 flex flex-col items-center justify-center">
            <div className="mb-4 text-lg font-semibold text-green-600">
              {sharedWalletCreated
                ? '✅ Shared Agent Wallet Created Successfully!'
                : '✅ Dedicated Agent Wallet Created Successfully!'}
            </div>
            <p className="mb-6 text-center text-sm text-gray-600">
              Would you like to continue with template creation or skip setup
              for now?
            </p>
            <div className="flex gap-4">
              <Button onClick={handleContinue}>Continue</Button>
              <Button variant="outline" onClick={handleSkip}>
                Skip
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default WalletSetup
