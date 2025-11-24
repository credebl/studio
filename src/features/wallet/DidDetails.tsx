'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle,
  Copy,
  FileKey,
  Fingerprint,
  Key,
  Loader2,
  Shield,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import PageContainer from '@/components/layout/page-container'
import Stepper from '@/components/StepperComponent'
import { useState } from 'react'

export default function DidDetails(): React.JSX.Element {
  const searchParams = useSearchParams()
  const router = useRouter()
  const totalSteps = 4
  const protocol = searchParams.get('protocol')
  const credentialType = searchParams.get('credentialType')
  const didMethod = searchParams.get('didMethod')
  const generatedDid = searchParams.get('generatedDid')
  const [copied, setCopied] = useState(false)
  const [activeAction, setActiveAction] = useState<
    'schema' | 'dashboard' | null
  >(null)

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
    setCopied(true)

    setTimeout(() => setCopied(false), 2000)
  }

  const handleSchema = (): void => {
    setActiveAction('schema')
    router.push('/schemas/create')
  }

  const handleDashboard = (): void => {
    setActiveAction('dashboard')
    router.push('/dashboard')
  }

  return (
    <PageContainer>
      <div className="bg-background flex min-h-screen flex-col items-center px-6 py-10">
        <Card className="bg-card mx-auto w-full max-w-4xl rounded-2xl p-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="pb-4">
              <h1 className="text-foreground text-2xl font-semibold">
                DID details
              </h1>
              <p className="text-muted-foreground">
                Your did has been successfully created. Review the details
                below.
              </p>
            </div>

            <div className="text-muted-foreground text-sm">
              Step {4} of {totalSteps}
            </div>
          </div>

          <Stepper currentStep={4} totalSteps={totalSteps} />

          <Card className="border-border mb-10 w-full shadow-sm">
            <CardContent className="pt-6">
              <div className="bg-muted/30 hover:bg-muted/50 space-y-2 rounded-lg p-2 transition-colors">
                <div className="flex items-center gap-2">
                  <Shield className="text-primary h-4 w-4" />
                  <p className="text-foreground block text-sm font-medium tracking-wide">
                    Protocol
                  </p>
                </div>
                <p className="text-foreground bg-background/50 border-border/50 rounded-md border p-3 text-sm break-all">
                  {protocol}
                </p>
              </div>
              <div className="bg-muted/30 hover:bg-muted/50 space-y-2 rounded-lg p-2 transition-colors">
                <div className="flex items-center gap-2">
                  <FileKey className="text-primary h-4 w-4" />
                  <p className="text-foreground block text-sm font-medium tracking-wide">
                    Credential Type
                  </p>
                </div>
                <p className="text-foreground bg-background/50 border-border/50 rounded-md border p-3 text-sm break-all">
                  {credentialType}
                </p>
              </div>

              <div className="bg-muted/30 hover:bg-muted/50 space-y-2 rounded-lg p-2 transition-colors">
                <div className="flex items-center gap-2">
                  <Key className="text-primary h-4 w-4" />
                  <p className="text-foreground block text-sm font-medium tracking-wide">
                    DID Method
                  </p>
                </div>
                <p className="text-foreground bg-background/50 border-border/50 rounded-md border p-3 text-sm break-all">
                  {didMethod}
                </p>
              </div>

              <div className="bg-muted/30 hover:bg-muted/50 space-y-2 rounded-lg p-2 transition-colors">
                <div className="flex items-center gap-2">
                  <Fingerprint className="text-primary h-4 w-4" />
                  <p className="text-foreground block text-sm font-medium tracking-wide">
                    Generated DID
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p className="bg-background/50 border-border/50 flex-1 rounded-md border p-3 font-mono text-sm font-semibold break-all">
                    {generatedDid}
                  </p>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedDid || '')}
                    className="shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex justify-center gap-4">
            <Button
              className="bg-primary text-primary-foreground px-6"
              onClick={handleSchema}
              disabled={activeAction !== null}
            >
              {activeAction === 'schema' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Continue to Schema Creation'
              )}
            </Button>

            <Button
              variant="outline"
              className="border-border text-foreground px-6"
              onClick={handleDashboard}
              disabled={activeAction !== null}
            >
              {activeAction === 'dashboard' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Go to Dashboard'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
