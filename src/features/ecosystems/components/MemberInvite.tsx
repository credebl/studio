'use client'

import {
  Building2,
  CalendarDays,
  Check,
  Globe,
  MailWarning,
  RefreshCw,
  X,
} from 'lucide-react'
import {
  EcosystemMemberInvitation,
  EcosystemRoles,
} from '@/features/common/enum'
import { JSX, useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ILeadsInvitationTable } from '../Interface/ecosystemInterface'
import SearchInput from '@/components/SearchInput'
import { acceptRejectMemberInvitation } from '@/app/api/ecosystem'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'
import { fetchInvitationsSentForMembers } from '../utils/commonFunctions'
import { generateSessionToken } from '@/app/api/users'
import { useAppSelector } from '@/lib/hooks'

const MemberInvite = (): JSX.Element => {
  const [invitations, setInvitations] = useState<ILeadsInvitationTable[] | []>(
    [],
  )

  const orgId = useAppSelector((state) => state.organization.orgId)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const ecosystemId = useAppSelector((state) => state.ecosystem.id)
  const [pagination, setPagination] = useState({
    pageSize: 100,
    pageNumber: 0,
    totalPages: 0,
    searchTerm: '',
    sortBy: 'createDateTime',
    sortOrder: 'desc',
  })

  const fetchInvitations = async (): Promise<void> => {
    setLoading(true)

    const result = await fetchInvitationsSentForMembers(
      orgId,
      ecosystemId,
      pagination,
      EcosystemRoles.ECOSYSTEM_MEMBER,
    )

    if (result.success) {
      setInvitations(result.tableData)
      setPagination((prev) => ({ ...prev, totalPages: result.totalPages }))
    } else {
      console.error('Error fetching data:', error)
    }

    setLoading(false)
  }

  const handleResponse = async (
    orgId: string,
    status: EcosystemMemberInvitation,
    ecosystemId: string,
  ): Promise<void> => {
    const payload = {
      orgId,
      ecosystemId,
    }
    try {
      const response = await acceptRejectMemberInvitation(status, payload)
      const { data } = response as AxiosResponse
      if (data && data.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setSuccess(data.message)
        await generateSessionToken()
        fetchInvitations()
      }
    } catch (err) {
      setError('Failed to update the invitation status')
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = Array.isArray(invitations)
    ? invitations.filter((i) => i.status === 'pending').length
    : 0

  useEffect(() => {
    setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 3000)
  }, [success, error])

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined
    timer = setTimeout(() => {
      fetchInvitations()
    }, 500)
    return () => clearTimeout(timer)
  }, [pagination.searchTerm])

  const handleSearch = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    setPagination((prev) => ({ ...prev, searchTerm: e.target.value }))
  }

  return (
    <div className="bg-background flex min-h-screen">
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="mb-2 flex items-center gap-3">
            <h1 className="text-foreground text-xl font-semibold sm:text-2xl">
              Member Invitations
            </h1>
            {pendingCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-warning/15 text-warning border-warning/20 border text-xs font-medium"
              >
                {pendingCount} pending
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Review and manage invitations from ecosystem organizations.
          </p>
        </div>

        {(Boolean(error) || Boolean(success)) && (
          <AlertComponent
            message={success ?? error}
            type={success ? 'success' : 'failure'}
            onAlertClose={() => {
              setError(null)
              setSuccess(null)
            }}
          />
        )}

        <Card className="px-4 py-6">
          <div className="mb-4 flex justify-between">
            <SearchInput
              value={pagination.searchTerm}
              onInputChange={handleSearch}
            />
            <Button
              onClick={() => fetchInvitations()}
              disabled={loading}
              variant={'ghost'}
              className="rounded-lg border"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
          <div className="space-y-3">
            {Array.isArray(invitations) &&
              invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className={
                    'group bg-card cursor-default rounded-xl border transition-all duration-200'
                  }
                >
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
                    <div className="flex items-center justify-between gap-3 sm:min-w-[180px] sm:justify-start">
                      <div className="flex items-center gap-3">
                        <div className="bg-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <Building2 className="text-muted-foreground h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs leading-none">
                            Organization
                          </p>
                          <p className="text-foreground text-sm leading-none font-semibold">
                            {invitation.organisation.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:flex-nowrap">
                      <div className="flex min-w-[140px] items-center gap-3">
                        <Globe className="text-muted-foreground h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs leading-none">
                            Invited by
                          </p>
                          <p className="text-foreground text-sm leading-none font-medium">
                            {invitation.ecosystem.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-[110px] items-center gap-3">
                        <CalendarDays className="text-muted-foreground h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-muted-foreground mb-1 text-xs leading-none">
                            Received
                          </p>
                          <p className="text-foreground text-sm leading-none">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
                                  {dateConversion(invitation.createDateTime)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="center"
                                sideOffset={5}
                              >
                                <span>
                                  {new Date(
                                    invitation.createDateTime,
                                  ).toLocaleString()}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:ml-auto">
                      <div className="flex w-full items-center gap-2 sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className=""
                          onClick={(e) => {
                            e.stopPropagation()
                            handleResponse(
                              invitation.invitedOrg,
                              EcosystemMemberInvitation.REJECTED,
                              invitation.ecosystem.id,
                            )
                          }}
                        >
                          <X className="mr-1.5 h-3.5 w-3.5" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className=""
                          onClick={(e) => {
                            e.stopPropagation()
                            handleResponse(
                              invitation.invitedOrg,
                              EcosystemMemberInvitation.ACCEPTED,
                              invitation.ecosystem.id,
                            )
                          }}
                        >
                          <Check className="mr-1.5 h-3.5 w-3.5" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {Array.isArray(invitations) && invitations.length === 0 && (
            <div className="text-muted-foreground py-16 text-center">
              <MailWarning className="mx-auto mb-4 h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">No invitations yet</p>
              <p className="mt-1 text-sm">
                Invitations from ecosystem organizations will appear here.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default MemberInvite
