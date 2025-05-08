'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { PlusIcon, XCircleIcon } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { apiStatusCodes, confirmationMessages } from "@/config/CommonConstant";
import { deleteOrganizationInvitation, getOrganizationUsers } from "@/app/api/organization";
import { useCallback, useEffect, useState } from "react";

import { AlertComponent } from "@/components/AlertComponent";
import { AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/confirmation-modal";
import DateTooltip from "@/components/DateTooltip";
import EditUserRoleModal from "./EditUserRoleModal";
import { EmptyMessage } from "@/components/EmptyMessage";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Invitation } from "@/features/invitations/interfaces/invitation-interface";
import { Roles } from "@/common/enums";
import SendInvitationModal from "@/features/invitations/components/sendInvitations";
import { Skeleton } from "@/components/ui/skeleton";
import { TextTitlecase } from "@/utils/TextTransform";
import { User } from "./users-interface";
import { dateConversion } from "@/utils/DateConversion";
import { getOrganizationInvitations } from "@/app/api/Invitation";
import { useAppSelector } from "@/lib/hooks";

const initialPageState = {
  pageNumber: 1,
  pageSize: 10,
  search: '',
  sortBy: 'createdAt',
  sortingOrder: 'desc',
  total: 0,
};

const initialPaginationInfo = {
  totalItems: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  nextPage: 1,
  previousPage: 0,
  lastPage: 1
};

export default function Members() {
  const [activeTab, setActiveTab] = useState('users');
  
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); 
  const [searchText, setSearchText] = useState('');
  
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [usersList, setUsersList] = useState<Array<User> | null>(null);
  const [usersPageState, setUsersPageState] = useState(initialPageState);
  const [usersPaginationInfo, setUsersPaginationInfo] = useState(initialPaginationInfo);
  const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [invitationsLoading, setInvitationsLoading] = useState<boolean>(true);
  const [invitationsList, setInvitationsList] = useState<Array<Invitation> | null>(null);
  const [invitationsPageState, setInvitationsPageState] = useState(initialPageState);
  const [invitationsPaginationInfo, setInvitationsPaginationInfo] = useState(initialPaginationInfo);
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [selectedInvitation, setSelectedInvitation] = useState<string>('');
  const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
  
  const [orgUserRole, setOrgUserRole] = useState<string[]>([]);
  
  const orgId = useAppSelector((state) => state.organization.orgId);
  const orgInfo = useAppSelector((state) => state.organization.orgInfo);

  const getOrgUserRole = useCallback(() => {
    if (orgInfo?.roles) {
      setOrgUserRole(orgInfo.roles);
    }
  }, [orgInfo?.roles]);

  const getAllUsers = useCallback(async () => {
    if (!orgId) return;
    
    setUsersLoading(true);
    
    try {
      const response = await getOrganizationUsers(
        orgId,
        usersPageState.pageNumber,
        usersPageState.pageSize,
        usersPageState.search
      );
      
      const { data } = response as AxiosResponse;
      
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const users = data?.data?.users.map((userOrg: User) => {
          const roles: string[] = userOrg.userOrgRoles.map(
            (role) => role.orgRole.name
          );
          return { ...userOrg, roles };
        });
        
        setUsersList(users);
        setUsersPaginationInfo({
          totalItems: data?.data?.totalItems ?? 0,
          hasNextPage: data?.data?.hasNextPage ?? false,
          hasPreviousPage: data?.data?.hasPreviousPage ?? false,
          nextPage: data?.data?.nextPage ?? 1,
          previousPage: data?.data?.previousPage ?? 0,
          lastPage: data?.data?.totalPages ?? 1
        });
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, [orgId, usersPageState.pageNumber, usersPageState.pageSize, usersPageState.search]);

  const getAllInvitations = useCallback(async () => {
    if (!orgId) return;
    
    setInvitationsLoading(true);
    
    try {
      
      const response = await getOrganizationInvitations(
        orgId,
        invitationsPageState.pageNumber,
        invitationsPageState.pageSize,
        invitationsPageState.search
      );
      
      const { data } = response as AxiosResponse;
      
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setInvitationsList(data?.data?.invitations);
        setInvitationsPaginationInfo({
          totalItems: data?.data?.totalItems ?? 0,
          hasNextPage: data?.data?.hasNextPage ?? false,
          hasPreviousPage: data?.data?.hasPreviousPage ?? false,
          nextPage: data?.data?.nextPage ?? 1,
          previousPage: data?.data?.previousPage ?? 0,
          lastPage: data?.data?.totalPages ?? 1
        });
      }
    } catch (err) {
      setError("Failed to fetch invitations");
      console.error(err);
    } finally {
      setInvitationsLoading(false);
    }
  }, [orgId, orgInfo?.roles, invitationsPageState.pageNumber, invitationsPageState.pageSize, invitationsPageState.search]);

  const handleUsersPageChange = useCallback((page: number) => {
    setUsersPageState(prev => ({ ...prev, pageNumber: page }));
  }, []);

  const handleInvitationsPageChange = useCallback((page: number) => {
    setInvitationsPageState(prev => ({ ...prev, pageNumber: page }));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    const timer = setTimeout(() => {
      if (activeTab === 'users') {
        setUsersPageState(prev => ({
          ...prev,
          search: value,
          pageNumber: 1
        }));
      } else {
        setInvitationsPageState(prev => ({
          ...prev,
          search: value,
          pageNumber: 1
        }));
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  const editUserRole = useCallback((user: User) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  }, []);

  const deleteInvitation = useCallback(async () => {
    if (!orgId || !selectedInvitation) return;
    
    setDeleteLoading(true);
    
    try {
      const response = await deleteOrganizationInvitation(orgId, selectedInvitation);
      const { data } = response as AxiosResponse;
      
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        await getAllInvitations();
        setMessage(data?.message ?? 'Invitation deleted successfully');
        setShowDeletePopup(false);
      } else {
        setError(response as string);
      }
    } catch (err) {
      setError("Failed to delete invitation");
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  }, [orgId, selectedInvitation, getAllInvitations]);

  const getStatusClass = useCallback((status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  }, []);

  useEffect(() => {
    getOrgUserRole();
  }, [getOrgUserRole]);

  useEffect(() => {
    if (activeTab === 'users') {
      getAllUsers();
    } else {
      getAllInvitations();
    }
  }, [activeTab, getAllUsers, getAllInvitations]);

  useEffect(() => {
    if (activeTab === 'users') {
      getAllUsers();
    }
  }, [usersPageState.pageNumber, usersPageState.search, usersPageState.sortingOrder, activeTab, getAllUsers]);

  useEffect(() => {
    if (activeTab === 'invitations') {
      getAllInvitations();
    }
  }, [invitationsPageState.pageNumber, invitationsPageState.search, inviteModalOpen, activeTab, getAllInvitations]);

  useEffect(() => {
    setSearchText('');
  }, [activeTab]);

  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="p-4 border rounded-lg shadow-sm bg-background animate-pulse">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
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
  );

  const renderPagination = (
    currentPage: number, 
    totalPages: number, 
    hasPrevPage: boolean,
    hasNextPage: boolean,
    prevPage: number,
    nextPage: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="mt-6">
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => hasPrevPage && onPageChange(prevPage)}
                className={!hasPrevPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              const isActive = page === currentPage;

              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    className={isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => hasNextPage && onPageChange(nextPage)}
                className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  const hasAdminRights = orgUserRole?.includes(Roles.ADMIN) ?? orgUserRole?.includes(Roles.OWNER);

  return (
    <div className="p-5">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Organization Members</h1>
        </div>
        
        {(message ?? error) && (
          <AlertComponent
            message={message ?? error}
            type={message ? 'success' : 'failure'}
            onAlertClose={() => {
              setMessage(null);
              setError(null);
            }}
          />
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mb-6 h-12">
          <TabsTrigger 
            value="users" 
            className="flex-1 h-full text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-l-md"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="invitations" 
            className="flex-1 h-full text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-r-md"
          >
            Invitations
          </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center justify-between mb-6 w-full">
          <div className="relative flex-grow max-w-xs">
            <Input
              type="text"
              placeholder={activeTab === 'users' ? "Search members..." : "Search invitations..."}
              value={searchText}
              onChange={handleSearchChange}
              className="w-full bg-background pr-4 pl-10 h-10 rounded-lg text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
            <IconSearch className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>

          {activeTab === 'invitations' && hasAdminRights && (
            <Button 
              onClick={() => setInviteModalOpen(true)}
              className="ml-auto flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg bg-primary text-primary-foreground"
            >
              <PlusIcon className="h-4 w-4" />
              Invite
            </Button>
          )}
        </div>

        <TabsContent value="users" className="space-y-4 mt-0">
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
                className="p-4 border border-gray-200 rounded-lg shadow-sm bg-background"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-shrink-0 w-1/3">
                    <h3 className="text-base font-semibold">
                      {user.firstName} {user.lastName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <span className="text-sm text-muted-foreground">Role:</span>
                      {user.roles && user.roles.length > 0 && 
                        user.roles.map((role, index) => (
                          <span
                            key={index}
                            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                              role === Roles.OWNER 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                                : role === Roles.ADMIN 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </span>
                        ))
                      }
                    </div>
                  </div>

                  <div className="flex-grow text-start">
                    <span className="text-sm text-primary font-medium truncate max-w-xs">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex-shrink-0 mr-24">
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
            handleUsersPageChange
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
              onClick={hasAdminRights ? () => setInviteModalOpen(true) : undefined}
              height="250px"
            />
          ) : (
            <div className="space-y-4">
              {invitationsList.map((invitation) => (
                <div 
                  key={invitation.id} 
                  className="p-4 border border-gray-200 rounded-lg shadow-sm bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col w-1/3">
                      <h3 className="text-base font-medium truncate">
                        {invitation.email}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Role:
                        </span>
                        <div className="flex gap-1">
                          {invitation.orgRoles &&
                            invitation.orgRoles.length > 0 &&
                            invitation.orgRoles.map((role, index) => (
                              <span
                                key={index}
                                className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800"
                              >
                                {TextTitlecase(role.name)}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center items-center w-1/3">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${getStatusClass(invitation.status)}`}>
                        {TextTitlecase(invitation.status)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-end w-1/3 mr-16">
                      {invitation.status === 'pending' && hasAdminRights && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvitation(invitation.id);
                            setShowDeletePopup(true);
                            setError(null);
                            setMessage(null);
                          }}
                          className="border border-blue-400 bg-gray-50 hover:bg-blue-50 rounded-md px-3 py-1 text-sm mb-2"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Delete Invitation
                        </Button>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        <DateTooltip date={invitation.createDateTime}>
                          <span>Invited on {dateConversion(invitation.createDateTime)}</span>
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
            handleInvitationsPageChange
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
        buttonTitles={[confirmationMessages.cancelConfirmation, confirmationMessages.sureConfirmation]}
        isProcessing={deleteLoading}
        setFailure={setError}
        setSuccess={setMessage}
      />
    </div>
  );
}