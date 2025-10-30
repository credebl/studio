'use client'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AlertComponent } from '@/components/AlertComponent'
import { ArrowRight } from 'lucide-react'
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
  const [alert, setAlert] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [sharedWalletResponse, setSharedWalletResponse] = useState<any>(null)
  const [dedicatedWalletResponse, setDedicatedWalletResponse] =
    useState<any>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId') ?? ''

  

  const handleSharedWalletCreated = (response?: any): void => {
    setSharedWalletResponse(response)
    if (response?.statusCode === 201) {
      setSuccess(response.message)
      setIsDialogOpen(true)
    } else {
      setAlert(response?.message || 'Failed to create shared wallet')
    }
  }

  const handleDedicatedWalletCreated = (response?: any): void => {
    setDedicatedWalletResponse(response)
    if (response?.statusCode === 201) {
      setSuccess(response.message)
      setIsDialogOpen(true)
    } else {
      setAlert(response?.message || 'Failed to create dedicated wallet')
    }
  }

  const handleContinue = (): void => router.push('/template-creation')
  const handleSkip = (): void => router.push('/dashboard')

  const isAnyWalletCreated = !!(sharedWalletResponse || dedicatedWalletResponse)

  return (
    <div className="mx-auto mt-10 max-w-5xl">
      {/* 🔴 Error alert */}
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
        {/* Disable form if wallet already created */}
        <div
          className={`${
            isAnyWalletCreated
              ? 'pointer-events-none select-none opacity-60'
              : ''
          }`}
        >
          <h2 className="mb-6 text-xl font-semibold">Wallet Type</h2>

          <RadioGroup
            value={agentType}
            onValueChange={(value) => {
              if (!isAnyWalletCreated) setAgentType(value as AgentType)
            }}
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
                <RadioGroupItem
                  id="dedicated"
                  className="border"
                  value={AgentType.DEDICATED}
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

          {/* Render Form Based on Agent Type */}
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

      {/* ✅ Dialog (no cross icon) */}
      <Dialog open={isDialogOpen}>
        <DialogContent
          className="max-w-md rounded-2xl text-center"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">
              Organization Wallet Setup
            </DialogTitle>
          </DialogHeader>

          {success && (
            <div className="my-4">
              <AlertComponent
                type="success"
                message={success}
                onAlertClose={() => setSuccess(null)}
              />
            </div>
          )}

          <p className="text-md mb-6 text-center text-gray-600">
            Would you like to continue with template creation or skip setup for
            now?
          </p>

          <DialogFooter className="mt-6 flex justify-center gap-4">
            <Button
              onClick={handleContinue}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleSkip}>
              Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WalletSetup
