/* eslint-disable max-lines */
'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { PlusIcon, XCircleIcon } from 'lucide-react'
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
import ConfirmationModal from '@/components/confirmation-modal'
import DateTooltip from '@/components/DateTooltip'
import EditUserRoleModal from './EditUserRoleModal'
import { EmptyMessage } from '@/components/EmptyMessage'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { Invitation } from '@/features/invitations/interfaces/invitation-interface'
import { Roles } from '@/common/enums'
import SendInvitationModal from '@/features/invitations/components/sendInvitations'
import { Skeleton } from '@/components/ui/skeleton'
import { TextTitlecase } from '@/utils/TextTransform'
import { User } from './users-interface'
import { dateConversion } from '@/utils/DateConversion'
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
        return 'bg-orange-100 text-orange-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }, [])

  useEffect(() => {
    getOrgUserRole()
  }, [getOrgUserRole])

  useEffect(() => {
    if (activeTab === 'users') {
      getAllUsers()
    } else {
      getAllInvitations()
    }
  }, [activeTab, getAllUsers, getAllInvitations])

  useEffect(() => {
    if (activeTab === 'users') {
      getAllUsers()
    }
  }, [
    usersPageState.pageNumber,
    usersPageState.search,
    usersPageState.sortingOrder,
    activeTab,
    getAllUsers,
  ])

  useEffect(() => {
    if (activeTab === 'invitations') {
      getAllInvitations()
    }
  }, [
    invitationsPageState.pageNumber,
    invitationsPageState.search,
    inviteModalOpen,
    activeTab,
    getAllInvitations,
  ])

  useEffect(() => {
    setSearchText('')
  }, [activeTab])

  const renderSkeletons = (): React.JSX.Element[] =>
    Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="bg-background animate-pulse rounded-lg border p-4 shadow-sm"
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

  const hasAdminRights =
    orgUserRole?.includes(Roles.ADMIN) ?? orgUserRole?.includes(Roles.OWNER)


  return (
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
        <TabsList className="mb-6 h-12 w-full max-w-md">
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full flex-1 rounded-l-md text-sm font-medium"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="invitations"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full flex-1 rounded-r-md text-sm font-medium"
          >
            Invitations
          </TabsTrigger>
        </TabsList>

        <div className="mb-6 flex w-full items-center justify-between">
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
              className="bg-background focus-visible:ring-primary h-10 w-full rounded-lg pr-4 pl-10 text-sm shadow-sm focus-visible:ring-1"
            />
            <IconSearch className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          </div>

          {activeTab === 'invitations' && hasAdminRights && (
            <Button
              onClick={() => setInviteModalOpen(true)}
              className="bg-primary text-primary-foreground ml-auto flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
            >
              <PlusIcon className="h-4 w-4" />
              Invite
            </Button>
          )}
        </div>

        <TabsContent value="users" className="mt-0 space-y-4">
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
              <div
                key={user.id}
                className="bg-background rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="w-1/3 flex-shrink-0">
                    <h3 className="text-base font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        Role:
                      </span>
                      {user.roles &&
                        user.roles.length > 0 &&
                        user.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              role === Roles.OWNER
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : role === Roles.ADMIN
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex-grow text-start">
                    <span className="text-primary max-w-xs truncate text-sm font-medium">
                      {user.email}
                    </span>
                  </div>

                  <div className="mr-24 flex-shrink-0">
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
              </div>
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
            <div className="space-y-4">
              {invitationsList.map((invitation) => (
                <div
                  key={invitation.id}
                  className="bg-background hover:bg-muted/50 rounded-lg border border-gray-200 p-4 shadow-sm transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex w-1/3 flex-col">
                      <h3 className="truncate text-base font-medium">
                        {invitation.email}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          Role:
                        </span>
                        <div className="flex gap-1">
                          {invitation.orgRoles &&
                            invitation.orgRoles.length > 0 &&
                            invitation.orgRoles.map((role, index) => (
                              <span
                                key={index}
                                className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
                              >
                                {TextTitlecase(role.name)}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex w-1/3 items-center justify-center">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${getStatusClass(invitation.status)}`}
                      >
                        {TextTitlecase(invitation.status)}
                      </span>
                    </div>

                    <div className="mr-16 flex w-1/3 flex-col items-end">
                      {invitation.status === 'pending' && hasAdminRights && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvitation(invitation.id)
                            setShowDeletePopup(true)
                            setError(null)
                            setMessage(null)
                          }}
                          className="mb-2 rounded-md border border-blue-400 bg-gray-50 px-3 py-1 text-sm hover:bg-blue-50"
                        >
                          <XCircleIcon className="mr-1 h-4 w-4" />
                          Delete Invitation
                        </Button>
                      )}

                      <div className="text-muted-foreground text-sm">
                        <DateTooltip date={invitation.createDateTime}>
                          <span>
                            Invited on{' '}
                            {dateConversion(invitation.createDateTime)}
                          </span>
                        </DateTooltip>
                      </div>
                    </div>
                  </div>
                </div>
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
  )
}
