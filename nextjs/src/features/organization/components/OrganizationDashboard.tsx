'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Edit, Trash2 } from 'lucide-react'
import { IOrgDashboard, IOrganisation } from './interfaces/organization'
import React, { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getOrgDashboard, getOrganizationById } from '@/app/api/organization'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import OrganizationDetails from './OrganizationDetails'
import PageContainer from '@/components/layout/page-container'
import { apiStatusCodes } from '@/config/CommonConstant'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

type OrganizationDashboardProps = {
  orgId: string
  // orgData?: IOrganisation;
}

export const OrganizationDashboard = ({
  orgId,
}: OrganizationDashboardProps): React.JSX.Element => {
  const router = useRouter()
  const [orgData, setOrgData] = useState<IOrganisation | null>(null)
  const [orgDashboard, setOrgDashboard] = useState<IOrgDashboard | null>(null)
  const [, setLoading] = useState(true)
  const [walletStatus, setWalletStatus] = useState<boolean>(false)
  const [, setError] = useState<string | null>(null)

  const selecteDropdownOrgId = useAppSelector(
    (state) => state.organization.orgId,
  )
  const activeOrgId = selecteDropdownOrgId ?? orgId
  const orgIdOfDashboard = orgId

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
      return
    }

    setLoading(true)
    const response = await getOrganizationById(orgIdOfDashboard as string)
    const { data } = response as AxiosResponse

    setLoading(false)
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      if (
        data?.data?.org_agents?.length > 0 &&
        data?.data?.org_agents[0]?.orgDid
      ) {
        setWalletStatus(true)
      }
      setOrgData(data?.data)
    } else {
      setError(response as string)
    }
    setLoading(false)
  }

  const fetchOrganizationDashboardDetails = async (): Promise<void> => {
    setLoading(true)
    if (orgId) {
      const response = await getOrgDashboard(orgIdOfDashboard as string)
      const { data } = response as AxiosResponse
      setLoading(false)

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setOrgDashboard(data?.data)
      } else {
        setError(response as string)
      }
    }
    setLoading(false)
  }

  const handleEditOrg = (): void => {
    router.push(`/organizations/create-organization?orgId=${orgId}`)
  }

  const handleDeleteOrg = (): void => {
    router.push(`/organizations/delete-organization?orgId=${orgId}`)
  }

  useEffect(() => {
    fetchOrganizationDetails()
    fetchOrganizationDashboardDetails()
  }, [activeOrgId])

  return (
    <PageContainer>
      <div className="container mx-auto space-y-6 px-4 py-6">
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 rounded-md">
                  {orgData?.logoUrl ? (
                    <AvatarImage src={orgData?.logoUrl} alt={orgData?.name} />
                  ) : (
                    <AvatarFallback className="text-2xl font-bold">
                      {orgData?.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 space-y-1">
                  <h2 className="text-2xl font-bold break-all">
                    {orgData?.name}
                  </h2>
                  <div className="text-muted-foreground break-all">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p>
                            {typeof orgData?.description === 'string' &&
                            orgData?.description?.length > 150
                              ? `${orgData?.description.substring(0, 150)}...`
                              : orgData?.description}{' '}
                          </p>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          sideOffset={4}
                          className="max-w-3xl"
                        >
                          <div>{orgData?.description}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="mt-2 text-sm">
                    Profile view:{' '}
                    <span className="font-semibold">
                      {orgData?.publicProfile ? 'public' : 'private'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="icon" onClick={handleEditOrg}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDeleteOrg}>
                  <Trash2
                    className="h-4 w-4"
                    style={{ color: 'var(--destructive)' }}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card
            className="shadow transition-all hover:scale-102"
            onClick={() => router.push('/users')}
          >
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="font-medium">Users</p>
                <h3 className="mt-2 text-4xl font-bold">
                  {orgDashboard?.usersCount ?? 0}
                </h3>
              </div>
              <div className="opacity-30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card
            className="shadow transition-all hover:scale-102"
            onClick={() => router.push('/organizations/schemas')}
          >
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="font-medium">Schemas</p>
                <h3 className="mt-2 text-4xl font-bold">
                  {orgDashboard?.schemasCount ?? 0}
                </h3>
              </div>
              <div className="opacity-30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow transition-all hover:scale-102">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="font-medium">Credentials</p>
                <h3 className="mt-2 text-4xl font-bold">
                  {orgDashboard?.credentialsCount ?? 0}
                </h3>
              </div>
              <div className="opacity-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                  <circle cx="9" cy="12" r="2"></circle>
                  <path d="M13 12h6"></path>
                  <path d="M13 8h6"></path>
                  <path d="M13 16h6"></path>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
        {walletStatus === true ? (
          <OrganizationDetails orgData={orgData} />
        ) : (
          <Button
            onClick={() =>
              router.push(
                `/organizations/agent-config?orgId=${orgIdOfDashboard}`,
              )
            }
          >
            Setup Your Wallet
          </Button>
        )}
      </div>
    </PageContainer>
  )
}
