import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import React, { JSX, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DateTooltip from '@/components/DateTooltip'
import { EmptyMessage } from '@/components/EmptyMessage'
import { IconSearch } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'
import { InviteEmailIcon } from '@/components/iconsSvg'
import { Roles } from '@/common/enums'
import { TabDataProps } from './type/type'
import { TextTitlecase } from '@/utils/TextTransform'
import { dateConversion } from '@/utils/DateConversion'
import delSvg from '@/../public/svgs/del.svg'
import { getStatuses } from './UtilFunctions'
import renderPagination from './RenderPagination'
import renderSkeletons from './RenderSkeletons'

function TabData({
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
}: Readonly<TabDataProps>): JSX.Element {
  const getStatusClass = useCallback(getStatuses, [])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="users" className="relative">
          Users
        </TabsTrigger>
        <TabsTrigger value="invitations">Invitations</TabsTrigger>
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
            onClick={(): void => setInviteModalOpen(true)}
            className="bg-primary text-primary-foreground ml-10 flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
          >
            <InviteEmailIcon />
            Invite
          </Button>
        )}
      </div>

      {/* USERS TAB */}
      <TabsContent value="users" className="mt-0 space-y-4 rounded-md border">
        {((): JSX.Element | JSX.Element[] => {
          if (usersLoading) {
            return renderSkeletons()
          }

          if (!usersList || usersList.length === 0) {
            return (
              <EmptyMessage
                title="No Members"
                description="You don't have any members yet."
                height="250px"
              />
            )
          }

          return usersList.map((user) => (
            <Card key={user.id} className="m-5 rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-3 items-center">
                {/* USER INFO */}
                <div className="flex items-center justify-start gap-5">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user?.email?.[0]?.toUpperCase() ?? ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-base font-semibold">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium break-all">
                              {`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.slice(
                                0,
                                20,
                              )}
                              {`${user?.firstName ?? ''} ${user?.lastName ?? ''}`
                                .length > 20 && ' . . .'}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            {`${user.firstName} ${user.lastName}`}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h3>
                    <div className="flex-grow text-start">
                      <span className="text-muted-foreground max-w-xs truncate text-sm font-medium">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-medium break-all">
                                {user.email.slice(0, 20)}
                                {user.email.length > 20 && ' . . .'}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {user.email}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                    </div>
                  </div>
                </div>

                {/* ROLES */}
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  <span className="text-muted-foreground text-sm">Role:</span>
                  {user.roles?.map((role) => (
                    <span
                      key={role}
                      className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-0.5 text-xs font-medium"
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="mr-10 flex justify-end">
                  {hasAdminRights && !user.roles?.includes(Roles.OWNER) && (
                    <Button onClick={(): void => editUserRole(user)}>
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
        })()}

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

      {/* INVITATIONS TAB */}
      <TabsContent value="invitations" className="mt-0 space-y-4">
        {((): JSX.Element | JSX.Element[] => {
          if (invitationsLoading) {
            return renderSkeletons()
          }

          if (!invitationsList || invitationsList.length === 0) {
            return (
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
            )
          }

          return (
            <div className="rounded-lg border">
              {invitationsList.map((invitation) => (
                <Card
                  key={invitation.id}
                  className="m-5 rounded-lg p-4 shadow-sm"
                >
                  <div className="grid grid-cols-3 items-center">
                    {/* EMAIL + DATE */}
                    <div className="flex items-center justify-start gap-5">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {invitation?.email?.[0]?.toUpperCase() ?? ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-base font-semibold">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="font-medium">
                                  {invitation.email.slice(0, 30)}
                                  {invitation.email.length > 29 && ' . . .'}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {invitation.email}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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

                    {/* ROLES */}
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-muted-foreground text-sm">
                        Role:
                      </span>
                      {invitation.orgRoles?.map((role) => (
                        <span
                          key={role.id}
                          className="bg-secondary text-secondary-foreground rounded-md px-2.5 py-0.5 text-xs font-medium"
                        >
                          {TextTitlecase(role.name)}
                        </span>
                      ))}
                    </div>

                    {/* STATUS + DELETE */}
                    <div className="flex items-center justify-end">
                      <div className="text-muted-foreground flex text-sm">
                        <span
                          className={`rounded-md px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                            invitation.status,
                          )}`}
                        >
                          {TextTitlecase(invitation.status)}
                        </span>
                      </div>
                      <div className="flex w-24 items-center justify-center">
                        {invitation.status === 'pending' && hasAdminRights && (
                          <Button
                            className="hover:bg-transparent"
                            variant="ghost"
                            data-testid="deleteBtn"
                            color="danger"
                            type="button"
                            size="sm"
                            onClick={(): void => {
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
          )
        })()}

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
  )
}

export default TabData
