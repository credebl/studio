/* eslint-disable max-lines */
'use client'

import { AgentType, DidMethod, WalletSpinupStatus } from '../common/enum'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
  const [showLedgerConfig, setShowLedgerConfig] = useState<boolean>(false)
  const [, setWalletStatus] = useState<boolean>(false)
  const [spinupStatus, setSpinupStatus] = useState<WalletSpinupStatus>(
    WalletSpinupStatus.NOT_STARTED,
  )
  const [isResumed, setIsResumed] = useState<boolean>(false)
  const [showWalletSteps, setShowWalletSteps] = useState<boolean>(false)
  const [socketListenersSetup, setSocketListenersSetup] =
    useState<boolean>(false)
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false)
  const [showMainCard, setShowMainCard] = useState<boolean>(true)

  const [isApiInProgress, setIsApiInProgress] = useState<boolean>(false)

  const walletCompletionHandled = useRef<boolean>(false)
  const redirectionTimeout = useRef<NodeJS.Timeout | null>(null)
  const pollingInterval = useRef<NodeJS.Timeout | null>(null)
  const animationInterval = useRef<NodeJS.Timeout | null>(null)

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
    }
  }, [orgId])

  // Clear all timeouts and intervals
  const clearAllTimers = useCallback((): void => {
    if (redirectionTimeout.current) {
      clearTimeout(redirectionTimeout.current)
      redirectionTimeout.current = null
    }
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
    }
    if (animationInterval.current) {
      clearInterval(animationInterval.current)
      animationInterval.current = null
    }
  }, [])

  const maskSeeds = (seed: string): string => {
    const visiblePart = seed.slice(0, -10)
    const maskedPart = seed.slice(-10).replace(/./g, '*')
    return visiblePart + maskedPart
  }

  // Single wallet completion handler to prevent duplicates
  const handleWalletCompletion = useCallback(
    (isSuccess: boolean, message?: string): void => {
      if (walletCompletionHandled.current || isRedirecting) {
        return
      }

      walletCompletionHandled.current = true
      clearAllTimers()
      setIsApiInProgress(false)

      if (isSuccess) {
        setWalletSpinStep(6)
        setSpinupStatus(WalletSpinupStatus.INVITATION_CREATION_SUCCESS)
        setSuccess('Wallet created successfully')
        setFailure(null)
        setShowMainCard(false)

        clearSpinupStatus()

        redirectionTimeout.current = setTimeout(() => {
          setIsRedirecting(true)
          const redirectPath =
            redirectTo && clientAlias ? redirectTo : '/dashboard'
          router.replace(redirectPath)
        }, 3000)
      } else {
        // On failure, reset to show the main card again
        setSpinupStatus(WalletSpinupStatus.FAILED)
        setFailure(message || 'Wallet creation failed')
        setSuccess(null)
        setLoading(false)
        setShowWalletSteps(false)
        setShowMainCard(true)
        setAgentSpinupCall(false)
        setWalletSpinStep(0)
        setShowLedgerConfig(false)

        clearSpinupStatus()
      }
    },
    [
      clearAllTimers,
      clearSpinupStatus,
      router,
      redirectTo,
      clientAlias,
      isRedirecting,
    ],
  )

  // Function to animate through wallet steps for already created wallets
  const animateWalletSteps = useCallback((): void => {
    if (walletCompletionHandled.current || isRedirecting) {
      return
    }

    setShowWalletSteps(true)
    setAgentSpinupCall(true)
    setShowMainCard(false)
    let currentStep = 0
    animationInterval.current = setInterval(() => {
      setWalletSpinStep(currentStep + 1)
      currentStep++

      if (currentStep >= 6) {
        if (animationInterval.current) {
          clearInterval(animationInterval.current)
          animationInterval.current = null
        }
        handleWalletCompletion(true)
      }
    }, 800)
  }, [handleWalletCompletion, isRedirecting])

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
        animateWalletSteps()
        setIsPageReady(true)
        return
      }

      // Handle resuming from stored state for incomplete wallet creation
      const stored = sessionStorage.getItem(`wallet_spinup_${orgId}`)
      if (stored) {
        try {
          const spinupData = JSON.parse(stored)
          if (
            Date.now() - spinupData.timestamp < 3600000 &&
            spinupData.status !== WalletSpinupStatus.FAILED
          ) {
            setWalletSpinStep(spinupData.step || 0)
            setAgentSpinupCall(
              spinupData.status !== WalletSpinupStatus.NOT_STARTED,
            )
            setShowWalletSteps(
              spinupData.status !== WalletSpinupStatus.NOT_STARTED,
            )
            setAgentType(spinupData.agentType || AgentType.DEDICATED)
            setSpinupStatus(spinupData.status)
            setIsResumed(true)
            if (spinupData.status !== WalletSpinupStatus.NOT_STARTED) {
              setShowMainCard(false)
            }
          } else {
            clearSpinupStatus()
          }
        } catch (error) {
          console.error('Error parsing spinup status:', error)
          clearSpinupStatus()
        }
      }

      const isDedicatedAgent =
        firstAgent?.org_agent_type?.agent?.toLowerCase() === AgentType.DEDICATED

      if (isDedicatedAgent) {
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
  }, [orgId, dispatch, clearSpinupStatus, animateWalletSteps])

  // Initial data fetch on mount
  useEffect(() => {
    fetchOrganizationDetails()
    const generatedSeeds = nanoid(32)
    const masked = maskSeeds(generatedSeeds)
    setSeeds(generatedSeeds)
    setMaskedSeeds(masked)
  }, [fetchOrganizationDetails])

  const configureDedicatedWallet = (): void => {
    setShowLedgerConfig(true)
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

    // Reset completion handler and clear any existing messages
    walletCompletionHandled.current = false
    setSuccess(null)
    setFailure(null)

    setIsApiInProgress(true)
    setShowMainCard(false)

    const agentPayload = {
      walletName: agentConfig.walletName,
      apiKey: agentConfig.apiKey,
      agentEndpoint: agentConfig.agentEndpoint,
    }

    try {
      const spinupRes = await setAgentConfigDetails(agentPayload, orgId)
      const { data: agentData } = spinupRes as AxiosResponse

      if (agentData?.statusCode !== apiStatusCodes.API_STATUS_CREATED) {
        setIsApiInProgress(false)
        handleWalletCompletion(false, 'Failed to configure dedicated agent')
        return
      }
      setIsApiInProgress(false)
      setAgentSpinupCall(true)
      setShowWalletSteps(true)
      setWalletSpinStep(1)
      setSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED)
      saveSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED, 1)
    } catch (err) {
      console.error(err)
      setIsApiInProgress(false)
      handleWalletCompletion(false, 'Error configuring dedicated agent')
      return
    }

    const method = values.method.split(':')[1] || ''
    let network = ''
    if (values.method === DidMethod.INDY) {
      network = values?.network || ''
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

      if (data?.statusCode !== apiStatusCodes.API_STATUS_CREATED) {
        handleWalletCompletion(false, 'Failed to create DID')
      }
    } catch (error) {
      handleWalletCompletion(false, 'Error creating DID')
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

    walletCompletionHandled.current = false
    setSuccess(null)
    setFailure(null)

    setIsApiInProgress(true)
    setShowMainCard(false)
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
        if (data?.data['agentSpinupStatus'] !== 1) {
          // API failed - stop loading and show error
          setIsApiInProgress(false)
          handleWalletCompletion(false, 'Failed to initiate wallet creation')
        } else {
          setIsApiInProgress(false)
          setAgentSpinupCall(true)
          setShowWalletSteps(true)
          setWalletSpinStep(1)
          setSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED)
          saveSpinupStatus(WalletSpinupStatus.AGENT_SPINUP_INITIATED, 1)
        }
      } else {
        setIsApiInProgress(false)
        handleWalletCompletion(false, 'Failed to create shared agent')
      }
    } catch (error) {
      console.error('Error creating shared agent:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      setIsApiInProgress(false)
      handleWalletCompletion(
        false,
        `Error creating shared agent: ${errorMessage}`,
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (socketListenersSetup) {
      return
    }

    const setupSocketListeners = (): void => {
      SOCKET.off('agent-spinup-process-initiated')
      SOCKET.off('agent-spinup-process-completed')
      SOCKET.off('did-publish-process-initiated')
      SOCKET.off('did-publish-process-completed')
      SOCKET.off('invitation-url-creation-started')
      SOCKET.off('invitation-url-creation-success')
      SOCKET.off('error-in-wallet-creation-process')

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
        console.log('invitation-url-creation-started', JSON.stringify(data))
        setTimeout(() => {
          setWalletSpinStep(5)
          setSpinupStatus(WalletSpinupStatus.INVITATION_CREATION_STARTED)
          saveSpinupStatus(WalletSpinupStatus.INVITATION_CREATION_STARTED, 5)
        }, 1000)
      })

      SOCKET.on('invitation-url-creation-success', (data) => {
        // eslint-disable-next-line no-console
        console.log('invitation-url-creation-success', JSON.stringify(data))
        handleWalletCompletion(true)
      })

      SOCKET.on('error-in-wallet-creation-process', (data) => {
        // eslint-disable-next-line no-console
        console.log('error-in-wallet-creation-process', JSON.stringify(data))
        handleWalletCompletion(false, 'Wallet Creation Failed')
      })

      setSocketListenersSetup(true)
    }

    setupSocketListeners()
  }, [saveSpinupStatus, handleWalletCompletion, socketListenersSetup])

  // Polling effect for checking wallet creation completion
  useEffect(() => {
    if (
      agentSpinupCall &&
      showWalletSteps &&
      spinupStatus !== WalletSpinupStatus.INVITATION_CREATION_SUCCESS &&
      spinupStatus !== WalletSpinupStatus.FAILED &&
      !isResumed &&
      !walletCompletionHandled.current
    ) {
      pollingInterval.current = setInterval(async () => {
        try {
          const response = await getOrganizationById(orgId || '')
          const { data } = response as AxiosResponse

          if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            const orgData = data?.data
            const firstAgent = orgData?.org_agents?.[0]

            if (firstAgent?.orgDid && !walletCompletionHandled.current) {
              if (pollingInterval.current) {
                clearInterval(pollingInterval.current)
                pollingInterval.current = null
              }

              dispatch(setOrgId(orgData?.id))
              dispatch(
                setTenantData({
                  id: orgData?.id,
                  name: orgData?.name,
                  logoUrl: orgData?.logoUrl,
                }),
              )
              setWalletStatus(true)
              handleWalletCompletion(true)
            }
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, 3000)

      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current)
          pollingInterval.current = null
        }
      }
    }
  }, [
    agentSpinupCall,
    showWalletSteps,
    spinupStatus,
    orgId,
    dispatch,
    handleWalletCompletion,
    isResumed,
  ])

  // Effect for resuming wallet steps animation - only for valid resumed states
  useEffect(() => {
    if (
      agentSpinupCall &&
      isResumed &&
      showWalletSteps &&
      walletSpinStep > 0 &&
      !walletCompletionHandled.current
    ) {
      const resumeTimeout = setTimeout(() => {
        let currentStep = walletSpinStep
        animationInterval.current = setInterval(() => {
          currentStep++
          setWalletSpinStep(currentStep)

          if (currentStep >= 6) {
            if (animationInterval.current) {
              clearInterval(animationInterval.current)
              animationInterval.current = null
            }
            handleWalletCompletion(true)
          } else {
            saveSpinupStatus(spinupStatus, currentStep)
          }
        }, 1500)
      }, 500)

      return () => {
        clearTimeout(resumeTimeout)
        if (animationInterval.current) {
          clearInterval(animationInterval.current)
          animationInterval.current = null
        }
      }
    }
  }, [
    agentSpinupCall,
    isResumed,
    saveSpinupStatus,
    spinupStatus,
    showWalletSteps,
    walletSpinStep,
    handleWalletCompletion,
  ])

  // Cleanup on unmount
  useEffect(
    () => () => {
      clearAllTimers()
    },
    [clearAllTimers],
  )

  const renderContent = (): React.JSX.Element | null => {
    if (isApiInProgress) {
      return (
        <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <Loader />
            <p className="text-muted-foreground">
              {agentType === AgentType.DEDICATED
                ? 'Configuring dedicated agent...'
                : 'Setting up shared agent...'}
            </p>
          </div>
        </div>
      )
    }

    if (
      showWalletSteps &&
      !isRedirecting &&
      spinupStatus !== WalletSpinupStatus.FAILED
    ) {
      return (
        <div className="mx-auto mt-4">
          <Card>
            <CardContent className="mr-18 ml-18 p-6">
              {success && (
                <div className="mb-4 w-full" role="alert">
                  <AlertComponent
                    message={success}
                    type={'success'}
                    onAlertClose={() => setSuccess(null)}
                  />
                </div>
              )}
              <div className="space-y-4">
                <Stepper
                  currentStep={walletSpinStep >= 6 ? 4 : 3}
                  totalSteps={4}
                />
                <WalletStepsComponent steps={walletSpinStep} />
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    if (
      showMainCard &&
      !isRedirecting &&
      (spinupStatus === WalletSpinupStatus.NOT_STARTED ||
        spinupStatus === WalletSpinupStatus.FAILED)
    ) {
      let formComponent: React.JSX.Element = <></>

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

      return (
        <div className="mx-auto mt-4">
          <Card>
            <CardContent className="mr-18 ml-18 p-6">
              <div className="space-y-4">
                {success && (
                  <div className="mb-4 w-full" role="alert">
                    <AlertComponent
                      message={success}
                      type={'success'}
                      onAlertClose={() => setSuccess(null)}
                    />
                  </div>
                )}
                {failure && (
                  <div className="mb-4 w-full" role="alert">
                    <AlertComponent
                      message={failure}
                      type={'failure'}
                      onAlertClose={() => setFailure(null)}
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
                      <div className="text-muted-foreground ml-auto text-sm">
                        Step 2 of 4
                      </div>
                    </div>
                    <Stepper currentStep={2} totalSteps={4} />
                  </>
                )}

                <div className="max-w-6xl">
                  {!showLedgerConfig && (
                    <div className="mb-6">
                      <h3 className="mb-2 text-lg font-medium">Agent Type</h3>

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
                            onClick={() => onRadioSelect(AgentType.DEDICATED)}
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
                      </RadioGroup>
                    </div>
                  )}

                  {formComponent}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return null
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
          {renderContent()}
        </div>
      )}
    </PageContainer>
  )
}

export default WalletSpinup
