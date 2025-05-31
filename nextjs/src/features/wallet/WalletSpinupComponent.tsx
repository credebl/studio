/* eslint-disable max-lines */
'use client'

import { Card, CardContent } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import {
  createDid,
  setAgentConfigDetails,
  spinupSharedAgent,
} from '@/app/api/Agent'
import { useRouter, useSearchParams } from 'next/navigation'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import DedicatedAgentForm from './DedicatedAgentForm'
import { DidMethod } from '../common/enum'
import { IValuesShared } from '../organization/components/interfaces/organization'
import { Organisation } from '../dashboard/type/organization'
import PageContainer from '@/components/layout/page-container'
import SOCKET from '@/config/SocketConfig'
import SharedAgentForm from './SharedAgentForm'
import Stepper from '@/components/StepperComponent'
import WalletStepsComponent from './WalletSteps'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { nanoid } from 'nanoid'

enum AgentType {
  SHARED = 'shared',
  DEDICATED = 'dedicated',
}

const WalletSpinup = (): React.JSX.Element => {
  const [agentType, setAgentType] = useState<string>(AgentType.DEDICATED)
  const [loading, setLoading] = useState<boolean>(false)
  const [walletSpinStep, setWalletSpinStep] = useState<number>(0)
  const [success, setSuccess] = useState<string | null>(null)
  const [agentSpinupCall, setAgentSpinupCall] = useState<boolean>(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [seeds, setSeeds] = useState<string>('')
  const [maskedSeeds, setMaskedSeeds] = useState('')
  const [orgData, setOrgData] = useState<Organisation | null>(null)
  const [, setShowProgressUI] = useState(false)
  const [, setCurrentOrgId] = useState<string>('')
  const [, setIsShared] = useState<boolean>(false)
  const [, setIsConfiguredDedicated] = useState<boolean>(false)
  const [showLedgerConfig, setShowLedgerConfig] = useState(false)
  const [walletStatus, setWalletStatus] = useState<boolean>(false)

  const router = useRouter()

  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId')
  useEffect(() => {
    if (orgId) {
      setCurrentOrgId(orgId)
    }
  }, [orgId])

  const [agentConfig, setAgentConfig] = useState({
    walletName: '',
    agentEndpoint: '',
    apiKey: '',
  })

  const maskSeeds = (seed: string): string => {
    const visiblePart = seed.slice(0, -10)
    const maskedPart = seed.slice(-10).replace(/./g, '*')
    return visiblePart + maskedPart
  }
  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
      return
    }
    if (walletStatus) {
      router.push(`/organizations/${orgId}`)
    }

    setLoading(true)
    try {
      const response = await getOrganizationById(orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const agentData = data?.data?.org_agents

        if (
          data?.data?.org_agents?.length > 0 &&
          data?.data?.org_agents[0]?.orgDid
        ) {
          setWalletStatus(true)
        }

        if (
          data?.data?.org_agents &&
          data?.data?.org_agents[0]?.org_agent_type?.agent?.toLowerCase() ===
            AgentType.DEDICATED
        ) {
          setIsConfiguredDedicated(true)
          setAgentType(AgentType.DEDICATED)
        }

        if (agentData && agentData.length > 0 && data?.data?.orgDid) {
          setOrgData(data?.data)
        }
      }
    } catch (error) {
      console.error('Error fetching organization details:', error)
      setFailure('Failed to fetch organization details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizationDetails()
    const generatedSeeds = nanoid(32)
    const masked = maskSeeds(generatedSeeds)
    setSeeds(generatedSeeds)
    setMaskedSeeds(masked)
  }, [])

  // Get redirect URL param
  const getRedirectUrl = (): string | null => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.get('redirectTo')
    }
    return null
  }

  const redirectUrl = getRedirectUrl()

  const configureDedicatedWallet = (): void => {
    setIsConfiguredDedicated(true)
    setShowLedgerConfig(true)
  }
  const setWalletSpinupStatus = (): void => {
    setSuccess('Wallet created successfully')
    fetchOrganizationDetails()
  }

  const onRadioSelect = (type: string): void => {
    setAgentType(type)
  }

  const submitDedicatedWallet = async (
    values: IValuesShared,
    privatekey: string,
    domain: string,
  ): Promise<void> => {
    if (!orgId) {
      setFailure('Organization ID is missing')
      return
    }
    setShowProgressUI(true)
    setAgentSpinupCall(true)
    setWalletSpinStep(1)
    const agentPayload = {
      walletName: agentConfig.walletName,
      apiKey: agentConfig.apiKey,
      agentEndpoint: agentConfig.agentEndpoint,
    }

    try {
      const spinupRes = await setAgentConfigDetails(agentPayload, orgId)
      const { data: agentData } = spinupRes as AxiosResponse

      if (agentData?.statusCode !== apiStatusCodes.API_STATUS_CREATED) {
        setFailure('Failed to configure dedicated agent')
        setLoading(false)
        return
      }
    } catch (err) {
      setFailure('Error configuring dedicated agent')
      setLoading(false)
      console.error(err)
      return
    }

    const didData = {
      seed: values.method === DidMethod.POLYGON ? '' : seeds,
      keyType: values.keyType || 'ed25519',
      method: values.method.split(':')[1] || '',
      network:
        values.method === DidMethod.INDY
          ? values.network?.split(':').slice(2).join(':')
          : values.method === DidMethod.POLYGON
            ? values.network?.split(':').slice(1).join(':')
            : '',
      domain: values.method === DidMethod.WEB ? domain : '',
      role: values.method === DidMethod.INDY ? 'endorser' : '',
      privatekey: values.method === DidMethod.POLYGON ? privatekey : '',
      did: values.did || '',
      endorserDid: values?.endorserDid || '',
      isPrimaryDid: true,
      clientSocketId: SOCKET.id,
    }

    try {
      const spinupRes = await createDid(orgId, didData)
      const { data } = spinupRes as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setAgentSpinupCall(true)
        setSuccess(spinupRes as string)
        setWalletSpinStep(1)

        setTimeout(() => {
          window.location.href = redirectUrl ? redirectUrl : '/organizations'
        }, 1000)
      } else {
        setShowProgressUI(false)
        setLoading(false)
        setFailure(spinupRes as string)
      }
    } catch (error) {
      setShowProgressUI(false)
      setLoading(false)
      setFailure('Error creating DID')
      console.error(error)
    }
  }

  const submitSharedWallet = async (
    values: IValuesShared,
    domain: string,
  ): Promise<void> => {
    if (!orgId) {
      setFailure('Organization ID is missing')
      return
    }

    setLoading(true)
    const ledgerName = values?.network?.split(':')[2]
    const network = values?.network?.split(':').slice(2).join(':')
    const polygonNetwork = values?.network?.split(':').slice(1).join(':')

    const payload = {
      keyType: values.keyType || 'ed25519',
      method: values.method.split(':')[1] || '',
      ledger: values.method === DidMethod.INDY ? ledgerName : '',
      label: values.label,
      privatekey: values.method === DidMethod.POLYGON ? values?.privatekey : '',
      seed: values.method === DidMethod.POLYGON ? '' : values?.seed || seeds,
      network: values.method === DidMethod.POLYGON ? polygonNetwork : network,
      domain: values.method === DidMethod.WEB ? domain : '',
      role: values.method === DidMethod.INDY ? values?.role || 'endorser' : '',

      did: values?.did ?? '',
      endorserDid: values?.endorserDid ?? '',
      clientSocketId: SOCKET.id,
    }

    try {
      const spinupRes = await spinupSharedAgent(payload, orgId)
      const { data } = spinupRes as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        if (data?.data['agentSpinupStatus'] === 1) {
          setAgentSpinupCall(true)
          setIsShared(true)
        } else {
          setLoading(false)
          setFailure(spinupRes as string)
        }
      } else {
        setLoading(false)
        setFailure(spinupRes as string)
      }
    } catch (error) {
      console.error('Error creating shared agent:', error)
      setLoading(false)
      if (error instanceof Error) {
        setFailure(`Error creating shared agent: ${error.message}`)
      } else {
        setFailure('Error creating shared agent: Unknown error')
      }
    }
  }

  useEffect(() => {
    const setupSocketListeners = (): void => {
      SOCKET.on('agent-spinup-process-initiated', () => {
        // eslint-disable-next-line no-console
        console.log('agent-spinup-process-initiated')
        setWalletSpinStep(1)
      })

      SOCKET.on('agent-spinup-process-completed', (data) => {
        // eslint-disable-next-line no-console
        console.log('agent-spinup-process-completed', JSON.stringify(data))
        setWalletSpinStep(2)
      })

      SOCKET.on('did-publish-process-initiated', (data) => {
        // eslint-disable-next-line no-console
        console.log('did-publish-process-initiated', JSON.stringify(data))
        setWalletSpinStep(3)
      })

      SOCKET.on('did-publish-process-completed', (data) => {
        // eslint-disable-next-line no-console
        console.log('did-publish-process-completed', JSON.stringify(data))
        setWalletSpinStep(4)
      })

      SOCKET.on('invitation-url-creation-started', (data) => {
        // eslint-disable-next-line no-console
        console.log(' invitation-url-creation-started', JSON.stringify(data))
        setTimeout(() => {
          setWalletSpinStep(5)
        }, 1000)
      })

      SOCKET.on('invitation-url-creation-success', (data) => {
        setLoading(false)
        setTimeout(() => {
          setWalletSpinStep(6)
          setWalletSpinupStatus()
        }, 1000)
        router.push(`/organizations/dashboard/${orgId}`)
        // eslint-disable-next-line no-console
        console.log('invitation-url-creation-success', JSON.stringify(data))
      })

      SOCKET.on('error-in-wallet-creation-process', (data) => {
        setLoading(false)
        setTimeout(() => {
          setFailure('Wallet Creation Failed')
        }, 5000)
        // eslint-disable-next-line no-console
        console.log('error-in-wallet-creation-process', JSON.stringify(data))
      })
    }

    setupSocketListeners()

    // Clean up socket listeners on unmount
    return () => {
      SOCKET.off('agent-spinup-process-initiated')
      SOCKET.off('agent-spinup-process-completed')
      SOCKET.off('did-publish-process-initiated')
      SOCKET.off('did-publish-process-completed')
      SOCKET.off('invitation-url-creation-started')
      SOCKET.off('invitation-url-creation-success')
      SOCKET.off('error-in-wallet-creation-process')
    }
  }, [])

  // const generateAlphaNumeric = organizationName ? organizationName ?.split(' ')
  //       .reduce(
  //         (s, c) =>
  //           s.charAt(0).toUpperCase() +
  //           s.slice(1) +
  //           (c.charAt(0).toUpperCase() + c.slice(1)),
  //         '',
  //       )
  //   : '';

  // const orgName = generateAlphaNumeric.slice(0, 19);

  let formComponent: React.JSX.Element = <></>

  if (!agentSpinupCall) {
    if (agentType === AgentType.SHARED) {
      formComponent = (
        <SharedAgentForm
          ledgerConfig={showLedgerConfig}
          setLedgerConfig={setShowLedgerConfig}
          maskedSeeds={maskedSeeds}
          seeds={seeds}
          orgName={orgData?.name || ''}
          loading={loading}
          submitSharedWallet={submitSharedWallet}
          isCopied={false}
          orgId={orgId || ''}
        />
      )
    } else {
      formComponent = (
        <DedicatedAgentForm
          ledgerConfig={showLedgerConfig}
          setLedgerConfig={setShowLedgerConfig}
          seeds={seeds}
          maskedSeeds={maskedSeeds}
          onConfigureDedicated={configureDedicatedWallet}
          submitDedicatedWallet={submitDedicatedWallet}
          setAgentConfig={setAgentConfig}
        />
      )
    }
  } else {
    formComponent = (
      <>
        <Stepper currentStep={4} totalSteps={4} />
        <WalletStepsComponent steps={walletSpinStep} />
      </>
    )
  }

  return (
    <PageContainer>
      <div className="flex min-h-screen items-start justify-center p-6">
        <div className="mx-auto mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {success && (
                  <div className="w-full" role="alert">
                    <AlertComponent
                      message={success}
                      type={'success'}
                      onAlertClose={() => {
                        setSuccess(null)
                      }}
                    />
                  </div>
                )}
                {failure && (
                  <div className="w-full" role="alert">
                    <AlertComponent
                      message={failure}
                      type={'failure'}
                      onAlertClose={() => {
                        setFailure(null)
                      }}
                    />
                  </div>
                )}

                {!showLedgerConfig && (
                  <>
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-semibold">Agent Setup</h1>
                        <p className="text-muted-foreground">
                          Configure your digital agent
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="w-full">
                  {!showLedgerConfig && !agentSpinupCall && (
                    <div className="mb-6">
                      <h3 className="mb-2 text-lg font-medium">Agent Type</h3>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Dedicated Agent Card */}
                        <Card
                          className="p-4 shadow transition-all hover:scale-102"
                          onClick={() => onRadioSelect(AgentType.DEDICATED)}
                        >
                          <div className="mb-4 flex items-start">
                            <input
                              id="dedicated-agent-radio"
                              type="radio"
                              value={AgentType.DEDICATED}
                              checked={agentType === AgentType.DEDICATED}
                              onChange={() =>
                                onRadioSelect(AgentType.DEDICATED)
                              }
                              name="agent-type"
                              className="mt-1 h-4 w-4"
                            />
                          </div>
                          <label
                            htmlFor="dedicated-agent-radio"
                            className="text-lg font-bold"
                          >
                            Dedicated Agent
                          </label>
                          <p className="my-2 ml-7 text-sm dark:text-white">
                            Private agent instance exclusively for your{' '}
                            <br></br> organization
                          </p>
                          <ul className="ml-7 space-y-1">
                            <li className="text-sm">
                              • Higher performance and reliability
                            </li>
                            <li className="text-sm">
                              • Enhanced privacy and security
                            </li>
                            <li className="text-sm">
                              • Full control over the agent infrastructure
                            </li>
                          </ul>
                        </Card>

                        {/* Shared Agent Card */}
                        <Card
                          className="p-4 shadow transition-all hover:scale-102"
                          onClick={() => onRadioSelect(AgentType.SHARED)}
                        >
                          <div className="mb-4 flex items-start">
                            <input
                              id="shared-agent-radio"
                              type="radio"
                              value={AgentType.SHARED}
                              checked={agentType === AgentType.SHARED}
                              onChange={() => onRadioSelect(AgentType.SHARED)}
                              name="agent-type"
                              className="mt-1 h-4 w-4"
                            />
                          </div>
                          <label
                            htmlFor="shared-agent-radio"
                            className="text-lg font-bold"
                          >
                            Shared Agent
                          </label>
                          <p className="my-2 ml-7 text-sm">
                            Use our cloud-hosted shared agent infrastructure
                          </p>
                          <ul className="ml-7 space-y-1">
                            <li className="text-sm">
                              • Cost-effective solution
                            </li>
                            <li className="text-sm">
                              • Managed infrastructure
                            </li>
                            <li className="text-sm">
                              • Quick setup with no maintenance
                            </li>
                          </ul>
                        </Card>
                      </div>
                    </div>
                  )}

                  {formComponent}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

export default WalletSpinup
