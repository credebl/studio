'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  CreateSchemaIcon,
  CredentialDefinitionIcon,
  IssueCredentialIcon,
  OrganizationAdminIcon,
  OrganizationMemberIcon,
  VerifyCredentialIcon,
} from '@/components/iconsSvg'
import React, { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Organisation } from '../type/organization'
import { OrganizationRoles } from '@/common/enums'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ToolTipDataForOrganization } from './TooltipData'
import { getOrganizations } from '@/app/api/organization'
import { useRouter } from 'next/navigation'

const OrganizationCardList = (): React.JSX.Element => {
  const [orgList, setOrgList] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)

  const route = useRouter()

  const [currentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm] = useState('')

  const fetchOrganizations = async (): Promise<void> => {
    try {
      const response = await getOrganizations(
        currentPage,
        pageSize,
        searchTerm,
        '',
      )
      if (typeof response !== 'string' && response?.data?.data?.organizations) {
        setOrgList(response.data.data.organizations)
      } else {
        setOrgList([])
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [currentPage, pageSize, searchTerm])

  return (
    <Card className="relative h-full w-full overflow-hidden rounded-xl border py-4 shadow-xl transition-transform duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle>Organizations</CardTitle>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  <ToolTipDataForOrganization />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge>{orgList.length}</Badge>
          </div>
          <CardDescription>Manage your organizations</CardDescription>
        </div>
        <Button
          onClick={() => route.push('/organizations/create-organization')}
          // className="text-primary-foreground bg-primary"
        >
          <Plus className="h-4 w-4" /> New Organization
        </Button>
      </CardHeader>

      <CardContent className="pb-2">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : orgList.length === 0 ? (
          <div className="text-muted-foreground px-6 py-4">
            No organizations found.
          </div>
        ) : (
          <div className="space-y-4">
            {orgList.slice(0, 3).map((org) => {
              const roles: string[] = org.userOrgRoles.map(
                (role) => role.orgRole.name,
              )
              org.roles = roles

              const hasWallet = org.org_agents && org.org_agents.length > 0
              const isAdmin =
                roles.includes(OrganizationRoles.organizationOwner) ||
                roles.includes(OrganizationRoles.organizationAdmin)

              return (
                <div
                  key={org.id}
                  className="hover:bg-muted/50 border-border/50 relative flex h-full w-full items-center justify-between overflow-hidden rounded-xl border p-3 shadow-xl transition-transform duration-300 hover:shadow-lg"
                >
                  <button
                    className="flex min-w-0 items-center gap-3 hover:cursor-pointer"
                    onClick={() =>
                      route.push(`/organizations/dashboard/${org.id}`)
                    }
                  >
                    <div className="flex-shrink-0">
                      {org.logoUrl ? (
                        <div className="border-border relative h-10 w-10 overflow-hidden rounded-full border">
                          <Image
                            src={org.logoUrl}
                            alt="Org Logo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="border-border bg-muted text-foreground flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold">
                          {org.name
                            ?.split(' ')
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || 'O'}
                        </div>
                      )}
                    </div>
                    <span className="ml-3 flex items-center space-x-2 truncate">
                      <span className="truncate">{org?.name}</span>
                      <span>
                        {org.roles.includes(
                          OrganizationRoles.organizationOwner,
                        ) ? (
                          <span title={org.roles.join(', ')}>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10 12C8.9 12 7.95833 11.6083 7.175 10.825C6.39167 10.0417 6 9.1 6 8C6 6.9 6.39167 5.95833 7.175 5.175C7.95833 4.39167 8.9 4 10 4C11.1 4 12.0417 4.39167 12.825 5.175C13.6083 5.95833 14 6.9 14 8C14 9.1 13.6083 10.0417 12.825 10.825C12.0417 11.6083 11.1 12 10 12ZM2 20V17.2C2 16.65 2.14167 16.1333 2.425 15.65C2.70833 15.1667 3.1 14.8 3.6 14.55C4.45 14.1167 5.40833 13.75 6.475 13.45C7.54167 13.15 8.71667 13 10 13H10.35C10.45 13 10.55 13.0167 10.65 13.05C10.5167 13.35 10.4042 13.6625 10.3125 13.9875C10.2208 14.3125 10.15 14.65 10.1 15H10C8.81667 15 7.75417 15.15 6.8125 15.45C5.87083 15.75 5.1 16.05 4.5 16.35C4.35 16.4333 4.22917 16.55 4.1375 16.7C4.04583 16.85 4 17.0167 4 17.2V18H10.3C10.4 18.35 10.5333 18.6958 10.7 19.0375C10.8667 19.3792 11.05 19.7 11.25 20H2ZM16 21L15.7 19.5C15.5 19.4167 15.3125 19.3292 15.1375 19.2375C14.9625 19.1458 14.7833 19.0333 14.6 18.9L13.15 19.35L12.15 17.65L13.3 16.65C13.2667 16.4167 13.25 16.2 13.25 16C13.25 15.8 13.2667 15.5833 13.3 15.35L12.15 14.35L13.15 12.65L14.6 13.1C14.7833 12.9667 14.9625 12.8542 15.1375 12.7625C15.3125 12.6708 15.5 12.5833 15.7 12.5L16 11H18L18.3 12.5C18.5 12.5833 18.6875 12.675 18.8625 12.775C19.0375 12.875 19.2167 13 19.4 13.15L20.85 12.65L21.85 14.4L20.7 15.4C20.7333 15.6 20.75 15.8083 20.75 16.025C20.75 16.2417 20.7333 16.45 20.7 16.65L21.85 17.65L20.85 19.35L19.4 18.9C19.2167 19.0333 19.0375 19.1458 18.8625 19.2375C18.6875 19.3292 18.5 19.4167 18.3 19.5L18 21H16ZM17 18C17.55 18 18.0208 17.8042 18.4125 17.4125C18.8042 17.0208 19 16.55 19 16C19 15.45 18.8042 14.9792 18.4125 14.5875C18.0208 14.1958 17.55 14 17 14C16.45 14 15.9792 14.1958 15.5875 14.5875C15.1958 14.9792 15 15.45 15 16C15 16.55 15.1958 17.0208 15.5875 17.4125C15.9792 17.8042 16.45 18 17 18ZM10 10C10.55 10 11.0208 9.80417 11.4125 9.4125C11.8042 9.02083 12 8.55 12 8C12 7.45 11.8042 6.97917 11.4125 6.5875C11.0208 6.19583 10.55 6 10 6C9.45 6 8.97917 6.19583 8.5875 6.5875C8.19583 6.97917 8 7.45 8 8C8 8.55 8.19583 9.02083 8.5875 9.4125C8.97917 9.80417 9.45 10 10 10Z"
                                fill="#1F4EAD"
                              />
                            </svg>
                          </span>
                        ) : org.roles.includes(
                            OrganizationRoles.organizationVerifier,
                          ) ||
                          org.roles.includes(
                            OrganizationRoles.organizationIssuer,
                          ) ? (
                          <span
                            title={org.roles
                              .slice(0, org.roles.length - 1)
                              .join(', ')}
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M17.55 12L14 8.45L15.425 7.05L17.55 9.175L21.8 4.925L23.2 6.35L17.55 12ZM9 12C7.9 12 6.95833 11.6083 6.175 10.825C5.39167 10.0417 5 9.1 5 8C5 6.9 5.39167 5.95833 6.175 5.175C6.95833 4.39167 7.9 4 9 4C10.1 4 11.0417 4.39167 11.825 5.175C12.6083 5.95833 13 6.9 13 8C13 9.1 12.6083 10.0417 11.825 10.825C11.0417 11.6083 10.1 12 9 12ZM1 20V17.2C1 16.6333 1.14583 16.1125 1.4375 15.6375C1.72917 15.1625 2.11667 14.8 2.6 14.55C3.63333 14.0333 4.68333 13.6458 5.75 13.3875C6.81667 13.1292 7.9 13 9 13C10.1 13 11.1833 13.1292 12.25 13.3875C13.3167 13.6458 14.3667 14.0333 15.4 14.55C15.8833 14.8 16.2708 15.1625 16.5625 15.6375C16.8542 16.1125 17 16.6333 17 17.2V20H1ZM3 18H15V17.2C15 17.0167 14.9542 16.85 14.8625 16.7C14.7708 16.55 14.65 16.4333 14.5 16.35C13.6 15.9 12.6917 15.5625 11.775 15.3375C10.8583 15.1125 9.93333 15 9 15C8.06667 15 7.14167 15.1125 6.225 15.3375C5.30833 15.5625 4.4 15.9 3.5 16.35C3.35 16.4333 3.22917 16.55 3.1375 16.7C3.04583 16.85 3 17.0167 3 17.2V18ZM9 10C9.55 10 10.0208 9.80417 10.4125 9.4125C10.8042 9.02083 11 8.55 11 8C11 7.45 10.8042 6.97917 10.4125 6.5875C10.0208 6.19583 9.55 6 9 6C8.45 6 7.97917 6.19583 7.5875 6.5875C7.19583 6.97917 7 7.45 7 8C7 8.55 7.19583 9.02083 7.5875 9.4125C7.97917 9.80417 8.45 10 9 10Z"
                                fill="#1F4EAD"
                              />
                            </svg>
                          </span>
                        ) : org.roles.includes(
                            OrganizationRoles.organizationAdmin,
                          ) ? (
                          <span title={OrganizationRoles.organizationAdmin}>
                            <OrganizationAdminIcon />
                          </span>
                        ) : (
                          <span title={OrganizationRoles.organizationMember}>
                            <OrganizationMemberIcon />
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded-md p-1 ${
                            !(
                              org.userOrgRoles[0].orgRole.name ===
                                OrganizationRoles.organizationOwner ||
                              org.userOrgRoles[0].orgRole.name ===
                                OrganizationRoles.organizationAdmin
                            )
                              ? 'cursor-not-allowed opacity-95'
                              : ''
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              if (!isAdmin) {
                                e.stopPropagation()
                                return
                              }
                              hasWallet
                                ? route.push('/organizations/schemas/create')
                                : route.push(
                                    `/organizations/dashboard/${org.id}`,
                                  )
                            }}
                            disabled={!isAdmin}
                            className="rounded-md p-1"
                          >
                            <CreateSchemaIcon />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="items-center text-center">
                        {hasWallet
                          ? 'Create Schema'
                          : 'Wallet is not created, first create a wallet, then create schema'}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="rounded-md p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (hasWallet) {
                                route.push('/organizations/schemas')
                              } else {
                                route.push(`/organization/dashboard/${org.id}`)
                              }
                            }}
                            className="rounded-md p-1"
                          >
                            <CredentialDefinitionIcon />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="items-center text-center">
                        Create Cred-def
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (hasWallet) {
                              route.push('/organizations/credentials')
                            } else {
                              route.push(`/organization/dashboard/${org.id}`)
                            }
                          }}
                        >
                          <IssueCredentialIcon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="items-center text-center">
                        Issue Credentials
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (hasWallet) {
                              route.push('/organizations/verification')
                            } else {
                              route.push(`/organization/dashboard/${org.id}`)
                            }
                          }}
                        >
                          <VerifyCredentialIcon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="items-center text-center">
                        Verify Credentialss
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto justify-end pt-2">
        <Link href="/organizations">View all</Link>
      </CardFooter>
    </Card>
  )
}

export default OrganizationCardList
