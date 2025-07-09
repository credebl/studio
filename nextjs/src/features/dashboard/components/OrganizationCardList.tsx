'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, Copy } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { currentPageNumber, itemPerPage } from '@/config/CommonConstant'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Organisation } from '../type/organization'
import { Skeleton } from '@/components/ui/skeleton'
import { ToolTipDataForOrganization } from './TooltipData'
import { getOrganizations } from '@/app/api/organization'

// import { useRouter } from 'next/navigation'

const OrganizationCardList = (): React.JSX.Element => {
  const [orgList, setOrgList] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedValue, setCopiedValue] = useState<string>('')

  // const route = useRouter()

  const [currentPage] = useState(currentPageNumber)
  const [pageSize] = useState(itemPerPage)
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
        setOrgList(
          response.data.data.organizations.filter(
            (val: Organisation) => val.org_agents.length > 0,
          ),
        )
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
    <Card className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border py-4 shadow-xl transition-transform duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="cursor-default space-y-1">
          <div className="flex items-center gap-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle>DID List</CardTitle>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  <ToolTipDataForOrganization />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge>{orgList.length}</Badge>
          </div>
          <CardDescription>List of Primary DID&apos;s</CardDescription>
        </div>
        {/* <Button
          onClick={() => route.push('/organizations/create-organization')}
          // className="text-primary-foreground bg-primary"
        >
          <Plus className="h-4 w-4" /> New Organization
        </Button> */}
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
            No Primary DID&apos;s found.
          </div>
        ) : (
          <div className="pb-12">
            {orgList.slice(0, 3).map((org) => {
              const roles: string[] = org.userOrgRoles.map(
                (role) => role.orgRole.name,
              )
              org.roles = roles

              return (
                <div
                  key={org.id}
                  className="relative flex h-full w-full items-center justify-between overflow-hidden rounded-xl border-b p-3 transition-transform duration-300 last:border-b-0"
                >
                  <div
                    className="flex min-w-0 items-center gap-3 hover:cursor-pointer"
                    // onClick={() => route.push(`/organizations/${org.id}`)}
                  >
                    <div className="flex-shrink-0 cursor-default">
                      {org.logoUrl ? (
                        <div className="border-border relative overflow-hidden rounded-full border">
                          <Avatar className="size-10 rounded-md">
                            {org.logoUrl ? (
                              <AvatarImage
                                src={org.logoUrl}
                                alt={org.name}
                                className="size-10"
                              />
                            ) : (
                              <AvatarFallback className="size-8 text-2xl font-bold">
                                {org.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
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
                    <span className="ml-3 cursor-default space-x-2 truncate">
                      <div className="truncate text-left font-semibold">
                        {org?.name}
                      </div>
                      <div className="text-muted-foreground text-left">
                        {org.org_agents[0].orgDid}{' '}
                        <Button
                          variant={'ghost'}
                          className="p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              org.org_agents[0].orgDid,
                            )
                            setCopiedValue(org.org_agents[0].orgDid)
                            setTimeout(() => {
                              setCopiedValue('')
                            }, 2000)
                          }}
                        >
                          {copiedValue &&
                          copiedValue === org.org_agents[0].orgDid ? (
                            <Check />
                          ) : (
                            <Copy />
                          )}
                        </Button>
                      </div>
                    </span>
                  </div>
                  {/* <div className="flex items-center gap-2">
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
                                : route.push(`/organizations/${org.id}`)
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
                                route.push(`/organizations/${org.id}`)
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
                              route.push(`/organizations/${org.id}`)
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
                              route.push(`/organizations/${org.id}`)
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
                  </div> */}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* <CardFooter className="mt-auto justify-end pt-2">
        <Link
          href="/organizations"
          className="url-link transition hover:underline hover:opacity-80"
        >
          View all
        </Link>
      </CardFooter> */}
    </Card>
  )
}

export default OrganizationCardList
