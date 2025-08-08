/* eslint-disable max-lines */
'use client'

import { AgentType, DidMethod, WalletSpinupStatus } from '../common/enum'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { useCallback, useEffect, useState } from 'react'
import {
  createDid,
  setAgentConfigDetails,
  spinupSharedAgent,
} from '@/app/api/Agent'
import { setOrgId, setTenantData } from '@/lib/orgSlice'
import { useRouter, useSearchParams } from 'next/navigation'

import { AlertComponent } from '@/components/AlertComponent'
import type { AxiosResponse } from 'axios'
import DedicatedAgentForm from './DedicatedAgentForm'
import { IValuesShared } from '../organization/components/interfaces/organization'
import Loader from '@/components/Loader'
import { Organisation } from '../dashboard/type/organization'
import PageContainer from '@/components/layout/page-container'
import SOCKET from '@/config/SocketConfig'
import SharedAgentForm from './SharedAgentForm'
import Stepper from '@/components/StepperComponent'
import WalletStepsComponent from './WalletSteps'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { nanoid } from 'nanoid'
import { useAppDispatch } from '@/lib/hooks'

const WalletSpinup = (): React.JSX.Element => {
  const [agentType, setAgentType] = useState<string>(AgentType.DEDICATED)
  const [loading, setLoading] = useState<boolean>(false)
  const [isPageReady, setIsPageReady] = useState<boolean>(false)
  const [walletSpinStep, setWalletSpinStep] = useState<number>(0)
  const [success, setSuccess] = useState<string | null>(null)
  const [agentSpinupCall, setAgentSpinupCall] = useState<boolean>(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [seeds, setSeeds] = useState<string>('')
  const [maskedSeeds, setMaskedSeeds] = useState<string>('')
  const [orgData, setOrgData] = useState<Organisation | null>(null)
  const [, setShowProgressUI] = useState(false)
  // const [, setCurrentOrgId] = useState<string>('')
  const [, setIsShared] = useState<boolean>(false)
  const [, setIsConfiguredDedicated] = useState<boolean>(false)
  const [showLedgerConfig, setShowLedgerConfig] = useState<boolean>(false)
  const [, setWalletStatus] = useState<boolean>(false)
  const [, setSpinupStatus] = useState<WalletSpinupStatus>(
    WalletSpinupStatus.NOT_STARTED,
  )

  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const orgId = searchParams.get('orgId')
  const redirectTo = searchParams.get('redirectTo')
  const clientAlias = searchParams.get('clientAlias')

  const [agentConfig, setAgentConfig] = useState({
    walletName: '',
    agentEndpoint: '',
    apiKey: '',
  })

  // Save spinup status to sessionStorage
  const saveSpinupStatus = useCallback(
    (status: WalletSpinupStatus, step: number): void => {
      if (typeof window !== 'undefined' && orgId) {
        const spinupData = {
          status,
          step,
          timestamp: Date.now(),
          orgId,
          agentType,
        }
        sessionStorage.setItem(
          `wallet_spinup_${orgId}`,
          JSON.stringify(spinupData),
        )
      }
    },
    [agentType, orgId],
  )

  // Clear spinup status from sessionStorage
  const clearSpinupStatus = useCallback((): void => {
    if (typeof window !== 'undefined' && orgId) {
      sessionStorage.removeItem(`wallet_spinup_${orgId}`)
      setAgentSpinupCall(false)
      setWalletSpinStep(0)
      setSpinupStatus(WalletSpinupStatus.NOT_STARTED)
    }
  }, [orgId])

  const maskSeeds = (seed: string): string => {
    const visiblePart = seed.slice(0, -10)
    const maskedPart = seed.slice(-10).replace(/./g, '*')
    return visiblePart + maskedPart
  }

  const fetchOrganizationDetails = useCallback(async (): Promise<void> => {
    if (!orgId) {
      setFailure('Organization ID is missing')
      setIsPageReady(true)
      return
    }

    try {
      const response = await getOrganizationById(orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
        setFailure('Failed to fetch organization details')
        setIsPageReady(true)
        return
      }

      const orgData = data?.data
      const agentData = orgData?.org_agents ?? []

      const [firstAgent] = agentData

      if (firstAgent?.orgDid) {
        dispatch(setOrgId(data?.data?.id))
        dispatch(
          setTenantData({
            id: data?.data?.id,
            name: data?.data?.name,
            logoUrl: data?.data?.logoUrl,
          }),
        )
        setWalletStatus(true)
        clearSpinupStatus()
        router.replace('/dashboard')
        return
      }

      const stored = sessionStorage.getItem(`wallet_spinup_${orgId}`)
      if (stored) {
        try {
          const spinupData = JSON.parse(stored)
          if (Date.now() - spinupData.timestamp < 3600000) {
            setWalletSpinStep(spinupData.step || 0)
            setAgentSpinupCall(
              spinupData.status !== WalletSpinupStatus.NOT_STARTED &&
                spinupData.status !== WalletSpinupStatus.FAILED,
            )
            setAgentType(spinupData.agentType || AgentType.DEDICATED)
            if (spinupData.status === WalletSpinupStatus.FAILED) {
              setWalletSpinStep(0)
              setAgentSpinupCall(false)
            }
            setSpinupStatus(spinupData.status)
          } else {
            clearSpinupStatus()
          }
        } catch (error) {
          console.error('Error parsing spinup status:', error)
          clearSpinupStatus()
        }
      }

      if (!firstAgent?.orgDid && agentData.length === 0) {
        clearSpinupStatus()
      }

      const isDedicatedAgent =
        firstAgent?.org_agent_type?.agent?.toLowerCase() === AgentType.DEDICATED

      if (isDedicatedAgent) {
        setIsConfiguredDedicated(true)
        setAgentType(AgentType.DEDICATED)
      }

      if (agentData.length > 0 && orgData?.orgDid) {
        setOrgData(orgData)
      }
      setIsPageReady(true)
    } catch (error) {
      console.error('Error fetching organization details:', error)
      setFailure('Failed to fetch organization details')
      setIsPageReady(true)
    }
  }, [orgId, dispatch, clearSpinupStatus, router])

  // Initial data fetch on mount
  useEffect(() => {
    fetchOrganizationDetails()
    const generatedSeeds = nanoid(32)
    const masked = maskSeeds(generatedSeeds)
    setSeeds(generatedSeeds)
    setMaskedSeeds(masked)
  }, [fetchOrganizationDetails])

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
  const setWalletSpinupStatus = useCallback((): void => {
    setSuccess('Wallet created successfully')
    clearSpinupStatus()
    fetchOrganizationDetails()
  }, [clearSpinupStatus, fetchOrganizationDetails])

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
    setSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED)
    saveSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED, 1)

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
        setAgentSpinupCall(false)
        setSpinupStatus(WalletSpinupStatus.FAILED)
        saveSpinupStatus(WalletSpinupStatus.FAILED, 0)
        return
      }
    } catch (err) {
      setFailure('Error configuring dedicated agent')
      setLoading(false)
      setAgentSpinupCall(false)
      setSpinupStatus(WalletSpinupStatus.FAILED)
      saveSpinupStatus(WalletSpinupStatus.FAILED, 0)
      console.error(err)
      return
    }
    const method = values.method.split(':')[1] || ''
    let network = ''
    if (values.method === DidMethod.INDY) {
      network = values?.network
    } else if (values.method === DidMethod.POLYGON) {
      network = `${method}:${values.network}`
    }
    const didData = {
      seed: values.method === DidMethod.POLYGON ? '' : seeds,
      keyType: values.keyType || 'ed25519',
      method,
      network,
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
          window.location.href = redirectUrl ? redirectUrl : '/dashboard'
        }, 1000)
      } else {
        setShowProgressUI(false)
        setLoading(false)
        setFailure(spinupRes as string)
        setAgentSpinupCall(false)
        setSpinupStatus(WalletSpinupStatus.FAILED)
        saveSpinupStatus(WalletSpinupStatus.FAILED, 0)
      }
    } catch (error) {
      setShowProgressUI(false)
      setLoading(false)
      setFailure('Error creating DID')
      setAgentSpinupCall(false)
      setSpinupStatus(WalletSpinupStatus.FAILED)
      saveSpinupStatus(WalletSpinupStatus.FAILED, 0)
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
    setAgentSpinupCall(true)
    setWalletSpinStep(1)
    setSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED)
    saveSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED, 1)

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
          setAgentSpinupCall(false)
          setSpinupStatus(WalletSpinupStatus.FAILED)
          saveSpinupStatus(WalletSpinupStatus.FAILED, 0)
        }
      } else {
        setLoading(false)
        setFailure(spinupRes as string)
        setAgentSpinupCall(false)
        setSpinupStatus(WalletSpinupStatus.FAILED)
        saveSpinupStatus(WalletSpinupStatus.FAILED, 0)
      }
    } catch (error) {
      console.error('Error creating shared agent:', error)
      setLoading(false)
      setAgentSpinupCall(false)
      setSpinupStatus(WalletSpinupStatus.FAILED)
      saveSpinupStatus(WalletSpinupStatus.FAILED, 0)
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
        setSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED)
        saveSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED, 1)
      })

      SOCKET.on('agent-spinup-process-completed', (data) => {
        // eslint-disable-next-line no-console
        console.log('agent-spinup-process-completed', JSON.stringify(data))
        setWalletSpinStep(2)
        setSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_COMPLETED)
        saveSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_COMPLETED, 2)
      })

      SOCKET.on('did-publish-process-initiated', (data) => {
        // eslint-disable-next-line no-console
        console.log('did-publish-process-initiated', JSON.stringify(data))
        setWalletSpinStep(3)
        setSpinupStatus(WalletSpinupStatus.DID_PUBLISH_INITIATED)
        saveSpinupStatus(WalletSpinupStatus.DID_PUBLISH_INITIATED, 3)
      })

      SOCKET.on('did-publish-process-completed', (data) => {
        // eslint-disable-next-line no-console
        console.log('did-publish-process-completed', JSON.stringify(data))
        setWalletSpinStep(4)
        setSpinupStatus(WalletSpinupStatus.DID_PUBLISH_COMPLETED)
        saveSpinupStatus(WalletSpinupStatus.DID_PUBLISH_COMPLETED, 4)
      })

      SOCKET.on('invitation-url-creation-started', (data) => {
        // eslint-disable-next-line no-console
        console.log(' invitation-url-creation-started', JSON.stringify(data))
        setTimeout(() => {
          setWalletSpinStep(5)
          setSpinupStatus(WalletSpinupStatus.INVITATION_CREATION_STARTED)
          saveSpinupStatus(WalletSpinupStatus.INVITATION_CREATION_STARTED, 5)
        }, 1000)
      })

      SOCKET.on('invitation-url-creation-success', (data) => {
        setLoading(false)
        setTimeout(() => {
          setWalletSpinStep(6)
          setSpinupStatus(WalletSpinupStatus.INVITATION_CREATION_SUCCESS)
          setWalletSpinupStatus()
        }, 1000)

        const redirectUrl =
          redirectTo && clientAlias ? redirectTo : '/dashboard'

        router.replace(redirectUrl)
        // eslint-disable-next-line no-console
        console.log('invitation-url-creation-success', JSON.stringify(data))
      })

      SOCKET.on('error-in-wallet-creation-process', (data) => {
        setLoading(false)
        setAgentSpinupCall(false)
        setSpinupStatus(WalletSpinupStatus.FAILED)
        saveSpinupStatus(WalletSpinupStatus.FAILED, 0)
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

  let formComponent: React.JSX.Element = <></>

  if (agentSpinupCall || walletSpinStep > 0) {
    formComponent = (
      <>
        <Stepper currentStep={4} totalSteps={4} />
        <WalletStepsComponent steps={walletSpinStep} />
      </>
    )
  } else if (!agentSpinupCall && walletSpinStep === 0) {
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
          orgId={orgId || ''}
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
  }

  return (
    <PageContainer>
      {!isPageReady ? (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <Loader />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen items-start justify-center p-6">
          <div className="mx-auto mt-4">
            <Card>
              <CardContent className="mr-18 ml-18 p-6">
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

                  {!showLedgerConfig &&
                    !agentSpinupCall &&
                    walletSpinStep === 0 && (
                      <>
                        <div className="mb-6 flex items-center justify-between">
                          <div>
                            <h1 className="text-2xl font-semibold">
                              Agent Setup
                            </h1>
                            <p className="text-muted-foreground">
                              Configure your digital agent
                            </p>
                          </div>
                          <div className="text-muted-foreground ml-auto text-sm">
                            Step 2 of 4
                          </div>
                        </div>
                        <Stepper currentStep={2} totalSteps={4} />
                      </>
                    )}

                  <div className="max-w-6xl">
                    {!showLedgerConfig &&
                      !agentSpinupCall &&
                      walletSpinStep === 0 && (
                        <div className="mb-6">
                          <h3 className="mb-2 text-lg font-medium">
                            Agent Type
                          </h3>

                          <RadioGroup
                            value={agentType}
                            defaultValue={agentType}
                            onValueChange={(value) => onRadioSelect(value)}
                            className=""
                          >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {/* Dedicated Agent Card */}

                              <Card
                                className="p-4 shadow transition-all hover:scale-102"
                                onClick={() =>
                                  onRadioSelect(AgentType.DEDICATED)
                                }
                              >
                                <div className="mb-4 flex items-start">
                                  <RadioGroupItem
                                    className="border"
                                    value={AgentType.DEDICATED}
                                    id="dedicated-agent-radio"
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
                                  <RadioGroupItem
                                    className="border"
                                    value={AgentType.SHARED}
                                    id="shared-agent-radio"
                                  />
                                </div>
                                <label
                                  htmlFor="shared-agent-radio"
                                  className="text-lg font-bold"
                                >
                                  Shared Agent
                                </label>
                                <p className="my-2 ml-7 text-sm">
                                  Use our cloud-hosted shared agent
                                  infrastructure
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
                          </RadioGroup>
                        </div>
                      )}

                    {formComponent}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default WalletSpinup
