'use client'

import {
  IOrgAgent,
  IOrganisation,
} from '@/features/organization/components/interfaces/organization'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getUserEcosystemInvitations,
  getUserInvitations,
} from '@/app/api/Invitation'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { CreateWalletIcon } from '@/components/iconsSvg'
import Loader from '@/components/Loader'
import { OrganizationDashboard } from '@/features/organization/components/OrganizationDashboard'
import OrganizationDetails from '@/features/organization/components/OrganizationDetails'
import PageContainer from '@/components/layout/page-container'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { setLedgerId } from '@/lib/orgSlice'
import { useRouter } from 'next/navigation'

const initialPageState = {
  pageNumber: 1,
  pageSize: 10,
  total: 0,
}

export default function Dashboard(): React.JSX.Element {
  const [walletData, setWalletData] = useState<IOrgAgent[]>([])
  const [walletLoading, setWalletLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(initialPageState)
  const [informativeMessage, setInformativeMessage] = useState<string | null>(
    '',
  )
  const [viewButton, setViewButton] = useState<boolean>(false)
  const [ecoMessage, setEcoMessage] = useState<string | null>('')
  const [activeTab, setActiveTab] = useState('Overview')
  const [orgData, setOrgData] = useState<IOrganisation | null>(null)
  const [isWalletSetupLoading, setIsWalletSetupLoading] =
    useState<boolean>(false)
  const orgId = useAppSelector((state) => state?.organization.orgId)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const firstName = useAppSelector((state) => state.profile.firstName)

  const getAllInvitations = async (): Promise<void> => {
    try {
      const response = await getUserInvitations(
        currentPage.pageNumber,
        currentPage.pageSize,
        '',
      )
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const totalPages = data?.data?.totalPages
        const invitationList = data?.data?.invitations
        if (invitationList.length > 0) {
          setInformativeMessage(
            'You have received invitations to join organization',
          )
          setViewButton(true)
        }
        setCurrentPage({ ...currentPage, total: totalPages })
      }
    } catch (err) {
      console.error('An unexpected error occurred', err)
    }
  }

  const getAllEcosystemInvitations = async (): Promise<void> => {
    try {
      const response = await getUserEcosystemInvitations(
        currentPage.pageNumber,
        currentPage.pageSize,
        '',
        orgId,
      )
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const pendingInvitations = data?.data?.invitations?.filter(
          (invitation: { status: string }) => invitation.status === 'pending',
        )

        if (pendingInvitations?.length > 0) {
          setEcoMessage('You have received invitation to join ecosystem ')
          setViewButton(true)
        }

        const totalPages = data?.data?.totalPages
        setCurrentPage({ ...currentPage, total: totalPages })
      }
    } catch (err) {
      console.error('An unexpected error occurred.', err)
    }
  }

  useEffect(() => {
    getAllInvitations()
    getAllEcosystemInvitations()
  }, [])

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
      return
    }
    try {
      setWalletLoading(true)
      const response = await getOrganizationById(orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const orgAgentsList = data?.data?.org_agents || []

        const firstLedgerId = orgAgentsList[0]?.ledgers?.id
        if (firstLedgerId) {
          dispatch(setLedgerId(firstLedgerId))
        }

        setWalletData(orgAgentsList)
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    } finally {
      setWalletLoading(false)
    }
  }

  useEffect(() => {
    if (orgId) {
      fetchOrganizationDetails()
    }
  }, [orgId])

  const handleCreateWallet = (): void => {
    setIsWalletSetupLoading(true)
    router.push(`wallet-setup?orgId=${orgId}`)
  }

  const [currentWallet] = walletData || []

  let walletSection: React.ReactNode = null

  if (walletLoading) {
    walletSection = (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    )
  } else if (walletData.length === 0) {
    walletSection = (
      <div className="relative mb-6 flex min-h-[150px] flex-col justify-center overflow-hidden rounded-md bg-[url('/images/bg-lightwallet.png')] bg-cover bg-center bg-no-repeat p-6 shadow-sm dark:bg-[url('/images/bg-darkwallet.png')] dark:bg-cover">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col items-start">
            <h3 className="text-xl font-semibold">
              Wallet lets you create schemas and credential definitions
            </h3>
            <p className="mt-2 text-sm">
              Please create a wallet for your organization to issue and verify
              credentials.
            </p>
          </div>
          <Button
            disabled={isWalletSetupLoading}
            onClick={handleCreateWallet}
            className="min-w-[180px]"
          >
            {isWalletSetupLoading && <Loader />}
            Setup Your Wallet
            <CreateWalletIcon />
          </Button>
        </div>
      </div>
    )
  } else if (currentWallet?.orgDid) {
    walletSection = (
      <div className="relative mb-6 flex min-h-[150px] flex-col justify-center overflow-hidden rounded-md bg-[url('/images/bg-lightwallet.png')] bg-cover bg-center bg-no-repeat p-6 shadow-sm dark:bg-[url('/images/bg-darkwallet.png')] dark:bg-cover">
        <div className="flex flex-col items-start">
          <h3 className="text-xl font-semibold">Wallet Details</h3>
          <p className="mt-2 text-sm text-gray-700">
            DID is already created for your organization.
          </p>
        </div>
      </div>
    )
  } else {
    walletSection = (
      <div className="relative mb-6 flex min-h-[150px] flex-col justify-center overflow-hidden rounded-md bg-[url('/images/bg-lightwallet.png')] bg-cover bg-center bg-no-repeat p-6 shadow-sm dark:bg-[url('/images/bg-darkwallet.png')] dark:bg-cover">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-col items-start">
            <h3 className="text-xl font-semibold">Setup your DID</h3>
            <p className="mt-2 text-sm">
              Your wallet is ready! Now set up a DID for issuing and verifying
              credentials.
            </p>
          </div>
          <Button
            onClick={() => router.push(`create-did?orgId=${orgId}`)}
            className="min-w-[180px]"
          >
            Setup Your DID
            <CreateWalletIcon />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-1 flex-col">
        {(informativeMessage || ecoMessage) && (
          <div className="mb-4 flex flex-col space-y-4">
            {informativeMessage && (
              <AlertComponent
                message={informativeMessage}
                type="warning"
                viewButton={viewButton}
                path={pathRoutes.users.orgInvitations}
                onAlertClose={() => setInformativeMessage('')}
              />
            )}
            {ecoMessage && (
              <AlertComponent
                message={ecoMessage}
                type="warning"
                viewButton={viewButton}
                path={`${process.env.NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL}${pathRoutes.users.dashboard}`}
                onAlertClose={() => setEcoMessage('')}
              />
            )}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, Welcome {firstName} 👋
          </h2>
        </div>
        {walletSection}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="Overview" className="relative">
              Overview
            </TabsTrigger>
            <TabsTrigger value="Wallet" disabled={walletData.length === 0}>
              Wallet
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="Overview"
            className="mt-2 space-y-4 rounded-md border"
          >
            <OrganizationDashboard
              orgId={orgId}
              setOrgDataForDetails={setOrgData}
            />
          </TabsContent>
          <TabsContent
            value="Wallet"
            className="mt-2 space-y-4 rounded-md border p-4"
          >
            <OrganizationDetails
              orgData={orgData}
              setActiveTab={setActiveTab}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  )
}
