'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { apiStatusCodes, confirmationMessages } from '@/config/CommonConstant'
import {
  deleteOrganizationInvitation,
  getOrganizationUsers,
} from '@/app/api/organization'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import ConfirmationModal from '@/components/confirmation-modal'
import EditUserRoleModal from './EditUserRoleModal'
import { Invitation } from '@/features/invitations/interfaces/invitation-interface'
import PageContainer from '@/components/layout/page-container'
import { Roles } from '@/common/enums'
import SendInvitationModal from '@/features/invitations/components/sendInvitations'
import TabData from './TabData'
import { User } from './users-interface'
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
        <TabData
          {...{
            activeTab,
            setActiveTab,
            searchText,
            handleSearchChange,
            setInviteModalOpen,
            usersLoading,
            usersList,
            editUserRole,
            usersPageState,
            usersPaginationInfo,
            handleUsersPageChange,
            invitationsLoading,
            invitationsList,
            setSelectedInvitation,
            setShowDeletePopup,
            setError,
            setMessage,
            invitationsPageState,
            invitationsPaginationInfo,
            handleInvitationsPageChange,
            hasAdminRights,
          }}
        />
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
