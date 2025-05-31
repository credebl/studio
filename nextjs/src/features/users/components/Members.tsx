/* eslint-disable max-lines */
'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import React, { useCallback, useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiStatusCodes, confirmationMessages } from '@/config/CommonConstant'
import {
  deleteOrganizationInvitation,
  getOrganizationUsers,
} from '@/app/api/organization'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import ConfirmationModal from '@/components/confirmation-modal'
import DateTooltip from '@/components/DateTooltip'
import EditUserRoleModal from './EditUserRoleModal'
import { EmptyMessage } from '@/components/EmptyMessage'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Invitation } from '@/features/invitations/interfaces/invitation-interface'
import { InviteEmailIcon } from '@/components/iconsSvg'
import PageContainer from '@/components/layout/page-container'
import { Roles } from '@/common/enums'
import SendInvitationModal from '@/features/invitations/components/sendInvitations'
import { Skeleton } from '@/components/ui/skeleton'
import { TextTitlecase } from '@/utils/TextTransform'
import { User } from './users-interface'
import { dateConversion } from '@/utils/DateConversion'
import delSvg from '@/../public/svgs/del.svg'
import { getOrganizationInvitations } from '@/app/api/Invitation'
import { useAppSelector } from '@/lib/hooks'

const initialPageState = {
  pageNumber: 1,
  pageSize: 10,
  search: '',
  sortBy: 'createdAt',
  sortingOrder: 'desc',
  total: 0,
}

const initialPaginationInfo = {
  totalItems: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: 1,
  previousPage: 0,
  lastPage: 1,
}

export default function Members(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('users')

  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

  const [usersLoading, setUsersLoading] = useState<boolean>(true)
  const [usersList, setUsersList] = useState<User[] | null>(null)
  const [usersPageState, setUsersPageState] = useState(initialPageState)
  const [usersPaginationInfo, setUsersPaginationInfo] = useState(
    initialPaginationInfo,
  )
  const [userModalOpen, setUserModalOpen] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [invitationsLoading, setInvitationsLoading] = useState<boolean>(true)
  const [invitationsList, setInvitationsList] = useState<Invitation[] | null>(
    null,
  )
  const [invitationsPageState, setInvitationsPageState] =
    useState(initialPageState)
  const [invitationsPaginationInfo, setInvitationsPaginationInfo] = useState(
    initialPaginationInfo,
  )
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false)
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
  const [selectedInvitation, setSelectedInvitation] = useState<string>('')
  const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false)

  const [orgUserRole, setOrgUserRole] = useState<string[]>([])

  const orgId = useAppSelector((state) => state.organization.orgId)
  const orgInfo = useAppSelector((state) => state.organization.orgInfo)

  const getOrgUserRole = useCallback(() => {
    if (orgInfo?.roles) {
      setOrgUserRole(orgInfo.roles)
    }
  }, [orgInfo?.roles])

  const getAllUsers = useCallback(async () => {
    if (!orgId) {
      return
    }

    setUsersLoading(true)

    try {
      const response = await getOrganizationUsers(
        orgId,
        usersPageState.pageNumber,
        usersPageState.pageSize,
        usersPageState.search,
      )

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const users = data?.data?.users.map((userOrg: User) => {
          const roles: string[] = userOrg.userOrgRoles.map(
            (role) => role.orgRole.name,
          )
          return { ...userOrg, roles }
        })

        setUsersList(users)
        setUsersPaginationInfo({
          totalItems: data?.data?.totalItems ?? 0,
          hasNextPage: data?.data?.hasNextPage ?? false,
          hasPreviousPage: data?.data?.hasPreviousPage ?? false,
          nextPage: data?.data?.nextPage ?? 1,
          previousPage: data?.data?.previousPage ?? 0,
          lastPage: data?.data?.totalPages ?? 1,
        })
      }
    } catch (err) {
      setError('Failed to fetch users')
      console.error(err)
    } finally {
      setUsersLoading(false)
    }
  }, [
    orgId,
    usersPageState.pageNumber,
    usersPageState.pageSize,
    usersPageState.search,
  ])

  const getAllInvitations = useCallback(async () => {
    if (!orgId) {
      return
    }

    setInvitationsLoading(true)

    try {
      const response = await getOrganizationInvitations(
        orgId,
        invitationsPageState.pageNumber,
        invitationsPageState.pageSize,
        invitationsPageState.search,
      )

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setInvitationsList(data?.data?.invitations)
        setInvitationsPaginationInfo({
          totalItems: data?.data?.totalItems ?? 0,
          hasNextPage: data?.data?.hasNextPage ?? false,
          hasPreviousPage: data?.data?.hasPreviousPage ?? false,
          nextPage: data?.data?.nextPage ?? 1,
          previousPage: data?.data?.previousPage ?? 0,
          lastPage: data?.data?.totalPages ?? 1,
        })
      }
    } catch (err) {
      setError('Failed to fetch invitations')
      console.error(err)
    } finally {
      setInvitationsLoading(false)
    }
  }, [
    orgId,
    orgInfo?.roles,
    invitationsPageState.pageNumber,
    invitationsPageState.pageSize,
    invitationsPageState.search,
  ])

  const handleUsersPageChange = useCallback((page: number) => {
    setUsersPageState((prev) => ({ ...prev, pageNumber: page }))
  }, [])

  const handleInvitationsPageChange = useCallback((page: number) => {
    setInvitationsPageState((prev) => ({ ...prev, pageNumber: page }))
  }, [])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target
      setSearchText(value)

      const timer = setTimeout(() => {
        if (activeTab === 'users') {
          setUsersPageState((prev) => ({
            ...prev,
            search: value,
            pageNumber: 1,
          }))
        } else {
          setInvitationsPageState((prev) => ({
            ...prev,
            search: value,
            pageNumber: 1,
          }))
        }
      }, 500)

      return () => clearTimeout(timer)
    },
    [activeTab],
  )

  const editUserRole = useCallback((user: User) => {
    setSelectedUser(user)
    setUserModalOpen(true)
  }, [])

  const deleteInvitation = useCallback(async () => {
    if (!orgId || !selectedInvitation) {
      return
    }

    setDeleteLoading(true)

    try {
      const response = await deleteOrganizationInvitation(
        orgId,
        selectedInvitation,
      )
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        await getAllInvitations()
        setMessage(data?.message ?? 'Invitation deleted successfully')
        setShowDeletePopup(false)
      } else {
        setError(response as string)
      }
    } catch (err) {
      setError('Failed to delete invitation')
      console.error(err)
    } finally {
      setDeleteLoading(false)
    }
  }, [orgId, selectedInvitation, getAllInvitations])

  const getStatusClass = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending'
      case 'accepted':
        return 'status-accepted'
      default:
        return 'status-rejected'
    }
  }, [])

  useEffect(() => {
    getOrgUserRole()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      getAllUsers()
    } else {
      getAllInvitations()
    }
  }, [activeTab])

  useEffect(() => {
    getAllUsers()
  }, [
    usersPageState.pageNumber,
    usersPageState.search,
    usersPageState.sortingOrder,
  ])

  useEffect(() => {
    getAllInvitations()
  }, [
    invitationsPageState.pageNumber,
    invitationsPageState.search,
    inviteModalOpen,
  ])

  useEffect(() => {
    setSearchText('')
  }, [activeTab])

  const renderSkeletons = (): React.JSX.Element[] =>
    Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="bg-background animate-pulse rounded-lg p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-6 w-40" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    ))

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    hasPrevPage: boolean,
    hasNextPage: boolean,
    prevPage: number,
    nextPage: number,
    onPageChange: (page: number) => void,
  ): React.JSX.Element | null => {
    if (totalPages <= 1) {
      return null
    }

    return (
      <div className="mt-6">
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => hasPrevPage && onPageChange(prevPage)}
                className={!hasPrevPage ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1
              const isActive = page === currentPage

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    className={
                      isActive
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : ''
                    }
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => hasNextPage && onPageChange(nextPage)}
                className={!hasNextPage ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }
  const hasAdminRights = [Roles.ADMIN, Roles.OWNER].some((role) =>
    orgUserRole?.includes(role),
  )

  return (
    <PageContainer>
      <div className="p-5">
        <div className="mb-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Organization Members</h1>
          </div>

          {(message ?? error) && (
            <AlertComponent
              message={message ?? error}
              type={message ? 'success' : 'failure'}
              onAlertClose={() => {
                setMessage(null)
                setError(null)
              }}
            />
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="users" className="relative">
              users
            </TabsTrigger>
            <TabsTrigger value="invitations">invitations</TabsTrigger>
          </TabsList>

          <div className="mb-6 flex w-full items-center justify-end">
            <div className="relative max-w-xs flex-grow">
              <Input
                type="text"
                placeholder={
                  activeTab === 'users'
                    ? 'Search members...'
                    : 'Search invitations...'
                }
                value={searchText}
                onChange={handleSearchChange}
                className="w-full pl-8"
              />
              <IconSearch className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            </div>

            {activeTab === 'invitations' && hasAdminRights && (
              <Button
                onClick={() => setInviteModalOpen(true)}
                className="bg-primary text-primary-foreground ml-10 flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
              >
                <InviteEmailIcon />
                Invite
              </Button>
            )}
          </div>

          <TabsContent
            value="users"
            className="mt-0 space-y-4 rounded-md border"
          >
            {usersLoading ? (
              renderSkeletons()
            ) : !usersList || usersList.length === 0 ? (
              <EmptyMessage
                title="No Members"
                description="You don't have any members yet."
                height="250px"
              />
            ) : (
              usersList.map((user) => (
                <Card key={user.id} className="m-5 rounded-lg p-4 shadow-sm">
                  <div className="grid grid-cols-3 items-center">
                    <div className="flex items-center justify-start gap-5">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {user?.email?.[0]?.toUpperCase() ?? ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <div className="flex-grow text-start">
                          <span className="text-muted-foreground max-w-xs truncate text-sm font-medium">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        Role:
                      </span>
                      {user.roles &&
                        user.roles.length > 0 &&
                        user.roles.map((role, index) => (
                          <span
                            key={index}
                            className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-0.5 text-xs font-medium"
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </span>
                        ))}
                    </div>

                    <div className="mr-10 flex justify-end">
                      {hasAdminRights && !user.roles?.includes(Roles.OWNER) && (
                        <Button onClick={() => editUserRole(user)}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" />
                            <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />
                            <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
                            <line x1="16" y1="5" x2="19" y2="8" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}

            {renderPagination(
              usersPageState.pageNumber,
              usersPaginationInfo.lastPage,
              usersPaginationInfo.hasPreviousPage,
              usersPaginationInfo.hasNextPage,
              usersPaginationInfo.previousPage,
              usersPaginationInfo.nextPage,
              handleUsersPageChange,
            )}
          </TabsContent>

          <TabsContent value="invitations" className="mt-0 space-y-4">
            {invitationsLoading ? (
              renderSkeletons()
            ) : !invitationsList || invitationsList.length === 0 ? (
              <EmptyMessage
                title="No Invitations"
                description="Get started by inviting a user"
                buttonContent="Invite"
                onClick={
                  hasAdminRights
                    ? (): void => setInviteModalOpen(true)
                    : undefined
                }
                height="250px"
              />
            ) : (
              <div className="rounded-lg border">
                {invitationsList.map((invitation) => (
                  <Card
                    key={invitation.id}
                    className="m-5 rounded-lg p-4 shadow-sm"
                  >
                    <div className="grid grid-cols-3 items-center">
                      <div className="flex items-center justify-start gap-5">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {invitation?.email?.[0]?.toUpperCase() ?? ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-base font-semibold">
                            {invitation.email}
                          </h3>
                          <div className="flex-grow text-start">
                            <DateTooltip date={invitation.createDateTime}>
                              <span className="text-sm">
                                Invited on:{' '}
                                {dateConversion(invitation.createDateTime)}
                              </span>
                            </DateTooltip>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-muted-foreground text-sm">
                          Role:
                        </span>
                        {invitation.orgRoles &&
                          invitation.orgRoles.length > 0 &&
                          invitation.orgRoles.map((role, index) => (
                            <span
                              key={index}
                              className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-0.5 text-xs font-medium"
                            >
                              {TextTitlecase(role.name)}
                            </span>
                          ))}
                      </div>
                      <div className="flex items-center justify-end">
                        <div className="text-muted-foreground flex text-sm">
                          <span
                            className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${getStatusClass(invitation.status)}`}
                          >
                            {TextTitlecase(invitation.status)}
                          </span>
                        </div>
                        <div className="flex w-24 items-center justify-center">
                          {invitation.status === 'pending' &&
                            hasAdminRights && (
                              <Button
                                className="hover:bg-transparent"
                                variant={'ghost'}
                                data-testid="deleteBtn"
                                color="danger"
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setSelectedInvitation(invitation.id)
                                  setShowDeletePopup(true)
                                  setError(null)
                                  setMessage(null)
                                }}
                              >
                                <img
                                  src={delSvg.src}
                                  alt="delete"
                                  className="mx-auto h-6 w-6"
                                />
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {renderPagination(
              invitationsPageState.pageNumber,
              invitationsPaginationInfo.lastPage,
              invitationsPaginationInfo.hasPreviousPage,
              invitationsPaginationInfo.hasNextPage,
              invitationsPaginationInfo.previousPage,
              invitationsPaginationInfo.nextPage,
              handleInvitationsPageChange,
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {selectedUser && (
          <EditUserRoleModal
            openModal={userModalOpen}
            user={selectedUser}
            setMessage={(data) => setMessage(data)}
            setOpenModal={setUserModalOpen}
            getAllUsersFun={getAllUsers}
          />
        )}

        <SendInvitationModal
          openModal={inviteModalOpen}
          setMessage={(data) => setMessage(data)}
          setOpenModal={setInviteModalOpen}
        />

        <ConfirmationModal
          loading={deleteLoading}
          success={message}
          failure={error}
          openModal={showDeletePopup}
          closeModal={() => setShowDeletePopup(false)}
          onSuccess={deleteInvitation}
          message={confirmationMessages.deletePendingInvitationConfirmation}
          buttonTitles={[
            confirmationMessages.cancelConfirmation,
            confirmationMessages.sureConfirmation,
          ]}
          isProcessing={deleteLoading}
          setFailure={setError}
          setSuccess={setMessage}
        />
      </div>
    </PageContainer>
  )
}
