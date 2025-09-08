'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { CheckIcon, RotateCcwIcon, XIcon } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import React, { ChangeEvent, useEffect, useState } from 'react'
import {
  acceptRejectInvitations,
  getUserInvitations,
} from '@/app/api/Invitation'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { EmptyMessage } from '@/components/EmptyMessage'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Invitation } from '../interfaces/invitation-interface'
import Loader from '@/components/Loader'
import { OrgRole } from '@/features/users/components/users-interface'
import { apiStatusCodes } from '@/config/CommonConstant'
import { pathRoutes } from '@/config/pathRoutes'

const initialPageState = {
  pageNumber: 1,
  pageSize: 10,
  total: 0,
}

export default function ReceivedInvitations(): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPageState)
  const [searchText, setSearchText] = useState('')
  const [invitationsList, setInvitationsList] = useState<Invitation[] | null>(
    null,
  )

  const getAllInvitations = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await getUserInvitations(
        currentPage.pageNumber,
        currentPage.pageSize,
        searchText,
      )
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const totalPages = data?.data?.totalPages
        const invitationList = data?.data?.invitations

        setInvitationsList(invitationList)
        setCurrentPage({
          ...currentPage,
          total: totalPages,
        })
      } else {
        setError(response as string)
      }
    } catch (err) {
      console.error('Failed to fetch invitations:', err)
      setError('Failed to fetch invitations')
    } finally {
      setLoading(false)
    }
  }

  const checkSearchMatch = (
    list: Invitation[] | null,
    query: string,
  ): boolean => {
    if (!list || list.length === 0 || !query) {
      return true
    }
    const searchQuery = query.toLowerCase().trim()
    return list.some((invitation) =>
      invitation.organisation.name.toLowerCase().includes(searchQuery),
    )
  }

  useEffect(() => {
    let getData: NodeJS.Timeout | undefined = undefined

    if (searchText.length >= 1) {
      getData = setTimeout(() => {
        setCurrentPage((prev) => ({
          ...prev,
          pageNumber: 1,
        }))
        getAllInvitations()
      }, 500)
      return (): void => clearTimeout(getData)
    } else {
      getAllInvitations()
    }

    return (): void => {
      if (getData) {
        clearTimeout(getData)
      }
    }
  }, [searchText, currentPage.pageNumber])

  // onChange of Search input text
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value)
  }

  // Handle page change
  const onPageChange = (page: number): void => {
    setCurrentPage({
      ...currentPage,
      pageNumber: page,
    })
  }

  const handleRefresh = (): void => {
    getAllInvitations()
  }

  const respondToInvitations = async (
    invite: Invitation,
    status: string,
  ): Promise<void> => {
    setLoading(true)
    try {
      const response = await acceptRejectInvitations(
        invite.id,
        invite.orgId,
        status,
      )
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setMessage(data?.message)
        setLoading(false)
        window.location.href = pathRoutes.users.dashboard
      } else {
        setError(response as string)
      }
    } catch (err) {
      console.error('Failed to respond to invitation', err)
      setError('Failed to respond to invitation')
    } finally {
      setLoading(false)
    }
  }

  const renderPagination = (): React.JSX.Element | null => {
    if (currentPage.total <= 1) {
      return null
    }

    const pages = []
    const maxVisiblePages = 5
    const startPage = Math.max(
      1,
      currentPage.pageNumber - Math.floor(maxVisiblePages / 2),
    )
    const endPage = Math.min(currentPage.total, startPage + maxVisiblePages - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={currentPage.pageNumber === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                onPageChange(Math.max(1, currentPage.pageNumber - 1))
              }
              className={
                currentPage.pageNumber === 1
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            />
          </PaginationItem>
          {pages}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(
                  Math.min(currentPage.total, currentPage.pageNumber + 1),
                )
              }
              className={
                currentPage.pageNumber === currentPage.total
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold">
          Received Invitations
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-sm">
              <Input
                type="text"
                placeholder="Search invitations..."
                value={searchText}
                onChange={handleSearchChange}
                className="border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 pr-4 pl-10 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
              <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RotateCcwIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {(message || error) && (
            <AlertComponent
              message={message ?? error}
              type={message ? 'success' : 'failure'}
              onAlertClose={() => {
                setMessage(null)
                setError(null)
              }}
            />
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          )}

          {searchText && !checkSearchMatch(invitationsList, searchText) ? (
            <EmptyMessage
              title="No Organization Invitation Found"
              description="No organization invitations match your search criteria."
              height="250px"
            />
          ) : (
            <div className="space-y-4">
              {invitationsList?.map((invitation, index) => (
                <Card key={invitation.id ?? index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0">
                          <Avatar className="h-16 w-16 border">
                            {invitation.organisation.logoUrl ? (
                              <AvatarImage
                                src={invitation.organisation.logoUrl}
                                alt={invitation.organisation.name}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback>
                                {invitation.organisation.name
                                  .split(' ')
                                  .map((word) => word.charAt(0))
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {invitation.organisation.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-muted-foreground text-sm">
                              Roles:
                            </span>
                            {invitation.orgRoles?.map((role: OrgRole) => (
                              <span
                                key={role.id ?? role.name}
                                className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-medium"
                              >
                                {role.name.charAt(0).toUpperCase() +
                                  role.name.slice(1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full gap-2 md:w-auto">
                        <Button
                          onClick={() =>
                            respondToInvitations(invitation, 'rejected')
                          }
                          variant="outline"
                          className="text-md rounded-lg border px-5 py-3 font-medium focus:z-10 focus:ring-4 focus:outline-none md:w-auto"
                        >
                          <XIcon className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() =>
                            respondToInvitations(invitation, 'accepted')
                          }
                          className="w-full md:w-auto"
                        >
                          <CheckIcon className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {renderPagination()}
        </CardContent>
      </Card>
    </div>
  )
}
