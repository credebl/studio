/* eslint-disable max-lines */
'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

export interface UserOrgRole {
  id: string
  userId: string
  orgRoleId: string
  orgId: string
  orgRole: OrgRole
}

export interface OrgRole {
  id: string
  name: string
  description: string
  createDateTime?: string
  createdBy?: string
  lastChangedDateTime?: string
  lastChangedBy?: string
  deletedAt?: Date | null
}

export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  isEmailVerified: boolean
  clientId: string
  clientSecret: string
  keycloakUserId: string
  userOrgRoles: UserOrgRole[]
  roles: string[]
}

// interface OrganizationCardListProps {
//   userOrg?: UserOrgRole
//   // walletData?: any[]
// }

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
    <Card className="border-border relative h-full w-full overflow-hidden rounded-xl border py-4 shadow-xl transition-transform duration-300">
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
          className="text-primary-foreground bg-primary"
        >
          <Plus className="mr-2 h-4 w-4" /> New Organization
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
                    className="flex items-center gap-3 hover:cursor-pointer"
                    onClick={() =>
                      route.push(`/organizations/dashboard/${org.id}`)
                    }
                  >
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M19 23L17.5 21.5V16.85C16.7667 16.6333 16.1667 16.2208 15.7 15.6125C15.2333 15.0042 15 14.3 15 13.5C15 12.5333 15.3417 11.7083 16.025 11.025C16.7083 10.3417 17.5333 10 18.5 10C19.4667 10 20.2917 10.3417 20.975 11.025C21.6583 11.7083 22 12.5333 22 13.5C22 14.25 21.7875 14.9167 21.3625 15.5C20.9375 16.0833 20.4 16.5 19.75 16.75L21 18L19.5 19.5L21 21L19 23ZM18.5 14C18.7833 14 19.0208 13.9042 19.2125 13.7125C19.4042 13.5208 19.5 13.2833 19.5 13C19.5 12.7167 19.4042 12.4792 19.2125 12.2875C19.0208 12.0958 18.7833 12 18.5 12C18.2167 12 17.9792 12.0958 17.7875 12.2875C17.5958 12.4792 17.5 12.7167 17.5 13C17.5 13.2833 17.5958 13.5208 17.7875 13.7125C17.9792 13.9042 18.2167 14 18.5 14Z"
                                fill="#1F4EAD"
                              />
                              <path
                                d="M3.9 19.1V17.2C3.9 16.7967 4.0013 16.4393 4.20445 16.1084C4.41153 15.7712 4.67665 15.5247 5.00841 15.352C5.98228 14.8656 6.96654 14.5033 7.96184 14.2622C8.95899 14.0207 9.9712 13.9 11 13.9C11.3108 13.9 11.6217 13.9117 11.9327 13.935C11.988 13.9391 12.0434 13.9437 12.0987 13.9485C12.1495 14.7586 12.355 15.5381 12.7154 16.2805C13.1307 17.1362 13.7117 17.8619 14.45 18.4523V19.1H3.9ZM11 11.1C10.1406 11.1 9.42729 10.8045 8.8114 10.1886C8.1955 9.57271 7.9 8.85941 7.9 8C7.9 7.14059 8.1955 6.42729 8.8114 5.8114C9.42729 5.1955 10.1406 4.9 11 4.9C11.8594 4.9 12.5727 5.1955 13.1886 5.8114C13.8045 6.42729 14.1 7.14059 14.1 8C14.1 8.85941 13.8045 9.57271 13.1886 10.1886C12.5727 10.8045 11.8594 11.1 11 11.1Z"
                                stroke="#1F4EAD"
                                strokeWidth="1.8"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span title={OrganizationRoles.organizationMember}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                id="Vector"
                                d="M-0.00195312 18V14.85C-0.00195312 14.2125 0.162109 13.6266 0.490234 13.0922C0.818359 12.5578 1.2543 12.15 1.79805 11.8688C2.96055 11.2875 4.1418 10.8516 5.3418 10.5609C6.5418 10.2703 7.76055 10.125 8.99805 10.125C10.2355 10.125 11.4543 10.2703 12.6543 10.5609C13.8543 10.8516 15.0355 11.2875 16.198 11.8688C16.7418 12.15 17.1777 12.5578 17.5059 13.0922C17.834 13.6266 17.998 14.2125 17.998 14.85V18H-0.00195312ZM8.99805 9C7.76055 9 6.70117 8.55938 5.81992 7.67813C4.93867 6.79688 4.49805 5.7375 4.49805 4.5C4.49805 3.2625 4.93867 2.20312 5.81992 1.32188C6.70117 0.440625 7.76055 0 8.99805 0C10.2355 0 11.2949 0.440625 12.1762 1.32188C13.0574 2.20312 13.498 3.2625 13.498 4.5C13.498 5.7375 13.0574 6.79688 12.1762 7.67813C11.2949 8.55938 10.2355 9 8.99805 9ZM2.24805 15.75H15.748V14.85C15.748 14.6438 15.6965 14.4563 15.5934 14.2875C15.4902 14.1187 15.3543 13.9875 15.1855 13.8938C14.173 13.3875 13.1512 13.0078 12.1199 12.7547C11.0887 12.5016 10.048 12.375 8.99805 12.375C7.94805 12.375 6.90742 12.5016 5.87617 12.7547C4.84492 13.0078 3.82305 13.3875 2.81055 13.8938C2.6418 13.9875 2.50586 14.1187 2.40273 14.2875C2.29961 14.4563 2.24805 14.6438 2.24805 14.85V15.75ZM8.99805 6.75C9.6168 6.75 10.1465 6.52969 10.5871 6.08906C11.0277 5.64844 11.248 5.11875 11.248 4.5C11.248 3.88125 11.0277 3.35156 10.5871 2.91094C10.1465 2.47031 9.6168 2.25 8.99805 2.25C8.3793 2.25 7.84961 2.47031 7.40898 2.91094C6.96836 3.35156 6.74805 3.88125 6.74805 4.5C6.74805 5.11875 6.96836 5.64844 7.40898 6.08906C7.84961 6.52969 8.3793 6.75 8.99805 6.75Z"
                                fill="#1F4EAD"
                              />
                            </svg>
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M7 9H18.75M7 12H18.75M7 15H13M4.5 19.5H19.5C20.0967 19.5 20.669 19.2629 21.091 18.841C21.5129 18.419 21.75 17.8467 21.75 17.25V6.75C21.75 6.15326 21.5129 5.58097 21.091 5.15901C20.669 4.73705 20.0967 4.5 19.5 4.5H4.5C3.90326 4.5 3.33097 4.73705 2.90901 5.15901C2.48705 5.58097 2.25 6.15326 2.25 6.75V17.25C2.25 17.8467 2.48705 18.419 2.90901 18.841C3.33097 19.2629 3.90326 19.5 4.5 19.5Z"
                                stroke="#6B7280"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M15 9H18.75M15 12H18.75M15 15H18.75M4.5 19.5H19.5C20.0967 19.5 20.669 19.2629 21.091 18.841C21.5129 18.419 21.75 17.8467 21.75 17.25V6.75C21.75 6.15326 21.5129 5.58097 21.091 5.15901C20.669 4.73705 20.0967 4.5 19.5 4.5H4.5C3.90326 4.5 3.33097 4.73705 2.90901 5.15901C2.48705 5.58097 2.25 6.15326 2.25 6.75V17.25C2.25 17.8467 2.48705 18.419 2.90901 18.841C3.33097 19.2629 3.90326 19.5 4.5 19.5ZM10.5 9.375C10.5 9.62123 10.4515 9.86505 10.3573 10.0925C10.263 10.32 10.1249 10.5267 9.95083 10.7008C9.77672 10.8749 9.57002 11.013 9.34253 11.1073C9.11505 11.2015 8.87123 11.25 8.625 11.25C8.37877 11.25 8.13495 11.2015 7.90747 11.1073C7.67998 11.013 7.47328 10.8749 7.29917 10.7008C7.12506 10.5267 6.98695 10.32 6.89273 10.0925C6.7985 9.86505 6.75 9.62123 6.75 9.375C6.75 8.87772 6.94754 8.40081 7.29917 8.04918C7.65081 7.69754 8.12772 7.5 8.625 7.5C9.12228 7.5 9.59919 7.69754 9.95082 8.04918C10.3025 8.40081 10.5 8.87772 10.5 9.375ZM11.794 15.711C10.8183 16.2307 9.72947 16.5017 8.624 16.5C7.5192 16.5014 6.4311 16.2304 5.456 15.711C5.69429 15.0622 6.12594 14.5023 6.69267 14.1067C7.25939 13.7111 7.93387 13.499 8.625 13.499C9.31613 13.499 9.99061 13.7111 10.5573 14.1067C11.1241 14.5023 11.5557 15.0622 11.794 15.711Z"
                                stroke="#6B7280"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="26"
                            height="24"
                            fill="none"
                            viewBox="0 0 26 24"
                          >
                            <path
                              fill="#6B7280"
                              stroke="#6B7280"
                              strokeWidth=".5"
                              d="M23.4 3H10.6A1.6 1.6 0 0 0 9 4.6v8c.002.298.088.59.25.84l-.77.501c-.26.17-.563.26-.874.259H7.29a.797.797 0 0 0-.689-.4H1.8a.8.8 0 0 0-.8.8v4.8a.8.8 0 0 0 .8.8h4.8a.797.797 0 0 0 .689-.4h8.875a2.412 2.412 0 0 0 2.146-1.325l2.137-4.275H23.4a1.6 1.6 0 0 0 1.6-1.6v-8A1.6 1.6 0 0 0 23.4 3ZM1.8 19.4v-4.8h4.8v4.8H1.8Zm15.794-1.28a1.606 1.606 0 0 1-1.43.88H7.4v-4h.206a2.4 2.4 0 0 0 1.31-.389l6.617-4.303a.713.713 0 0 1 .864.095.696.696 0 0 1 .013.97l-3.387 3.76-.003.003-.717.796a.399.399 0 0 0 .029.565.4.4 0 0 0 .565-.029l.602-.668h2.717a1.193 1.193 0 0 0 .935-.448l.924-1.152h1.48l-1.961 3.92ZM14.94 14.2h2.11l-.52.65a.397.397 0 0 1-.314.15h-1.997l.72-.8Zm9.26-1.6a.8.8 0 0 1-.8.8h-7.74l.72-.8h3.42a.4.4 0 1 0 0-.8h-2.714A1.483 1.483 0 0 0 17 9.883V9.8a.4.4 0 0 0-.4-.4.392.392 0 0 0-.234.084 1.509 1.509 0 0 0-1.268.153l-.116.075a.394.394 0 0 0-.665-.195.4.4 0 0 0-.117.283v.42l-4.284 2.787A.79.79 0 0 1 9.8 12.6v-8a.8.8 0 0 1 .8-.8h12.8a.8.8 0 0 1 .8.8v8Z"
                            />
                            <path
                              fill="#6B7280"
                              stroke="#6B7280"
                              strokeWidth=".1"
                              d="M13.05 5.3v-.05h-.85a.45.45 0 0 0-.45.45v.45h1.3V5.3ZM11.8 6.85h-.05v.45a.45.45 0 0 0 .45.45h.85v-.9H11.8Zm1.95.85v.05h.85a.45.45 0 0 0 .45-.45V5.7a.45.45 0 0 0-.45-.45h-.85V7.7ZM12.2 4.55h2.4a1.15 1.15 0 0 1 1.15 1.15v1.6a1.15 1.15 0 0 1-1.15 1.15h-2.4a1.15 1.15 0 0 1-1.15-1.15V5.7a1.15 1.15 0 0 1 1.15-1.15Z"
                            />
                            <path
                              fill="#6B7280"
                              stroke="#6B7280"
                              strokeWidth=".2"
                              d="M11.4 9.297a.4.4 0 0 0-.4.4v.8a.4.4 0 1 0 .8 0v-.8a.4.4 0 0 0-.4-.4Zm1.602 0a.4.4 0 0 0-.4.4v.4a.4.4 0 1 0 .8 0v-.4a.4.4 0 0 0-.4-.4Zm5.198 0a.4.4 0 0 0-.4.4v.8a.4.4 0 1 0 .8 0v-.8a.4.4 0 0 0-.4-.4Zm1.598 0a.4.4 0 0 0-.4.4v.8a.4.4 0 0 0 .8 0v-.8a.4.4 0 0 0-.4-.4Z"
                            />
                          </svg>
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
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3.44444 21C2.77222 21 2.19676 20.7745 1.71806 20.3235C1.23935 19.8725 1 19.3303 1 18.697V6.60606C1 5.97273 1.23935 5.43056 1.71806 4.97955C2.19676 4.52854 2.77222 4.30303 3.44444 4.30303H8.57778C8.84259 3.61212 9.28565 3.05556 9.90694 2.63333C10.5282 2.21111 11.2259 2 12 2C12.7741 2 13.4718 2.21111 14.0931 2.63333C14.7144 3.05556 15.1574 3.61212 15.4222 4.30303H20.5556C21.2278 4.30303 21.8032 4.52854 22.2819 4.97955C22.7606 5.43056 23 5.97273 23 6.60606V18.697C23 19.3303 22.7606 19.8725 22.2819 20.3235C21.8032 20.7745 21.2278 21 20.5556 21H3.44444ZM3.17284 18.8889H20.8323V6.22222H3.17284V18.8889ZM12 5.74242C12.2648 5.74242 12.4838 5.66086 12.6569 5.49773C12.8301 5.3346 12.9167 5.12828 12.9167 4.87879C12.9167 4.62929 12.8301 4.42298 12.6569 4.25985C12.4838 4.09672 12.2648 4.01515 12 4.01515C11.7352 4.01515 11.5162 4.09672 11.3431 4.25985C11.1699 4.42298 11.0833 4.62929 11.0833 4.87879C11.0833 5.12828 11.1699 5.3346 11.3431 5.49773C11.5162 5.66086 11.7352 5.74242 12 5.74242Z"
                              fill="#6B7280"
                            />
                            <path
                              d="M10.0312 17.5469L9.14062 16.0469L7.45312 15.6719L7.61719 13.9375L6.46875 12.625L7.61719 11.3125L7.45312 9.57812L9.14062 9.20312L10.0312 7.70312L11.625 8.38281L13.2187 7.70312L14.1094 9.20312L15.7969 9.57812L15.6328 11.3125L16.7812 12.625L15.6328 13.9375L15.7969 15.6719L14.1094 16.0469L13.2187 17.5469L11.625 16.8672L10.0312 17.5469ZM10.4297 16.3516L11.625 15.8359L12.8437 16.3516L13.5 15.2266L14.7891 14.9219L14.6719 13.6094L15.5391 12.625L14.6719 11.6172L14.7891 10.3047L13.5 10.0234L12.8203 8.89844L11.625 9.41406L10.4062 8.89844L9.75 10.0234L8.46094 10.3047L8.57812 11.6172L7.71094 12.625L8.57812 13.6094L8.46094 14.9453L9.75 15.2266L10.4297 16.3516ZM11.1328 14.2891L13.7812 11.6406L13.125 10.9609L11.1328 12.9531L10.125 11.9688L9.46875 12.625L11.1328 14.2891Z"
                              fill="#6B7280"
                            />
                          </svg>
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
