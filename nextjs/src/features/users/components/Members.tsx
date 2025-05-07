'use client';

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteOrganizationInvitation, getOrganizationUsers } from "@/app/api/organization";
import { useEffect, useState } from "react";

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
import { XCircleIcon } from "lucide-react";
import { apiStatusCodes } from "@/config/CommonConstant";
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

export default function Members() {
  // Common state
  const [activeTab, setActiveTab] = useState('users');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  
  // Users tab state
  const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [usersPageState, setUsersPageState] = useState(initialPageState);
  const [usersList, setUsersList] = useState<Array<User> | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [orgRoles, setOrgRoles] = useState<string[]>([]);
  const [usersPaginationInfo, setUsersPaginationInfo] = useState({
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: 1,
    previousPage: 0,
    lastPage: 1
  });

  // Invitations tab state
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [invitationsLoading, setInvitationsLoading] = useState<boolean>(true);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [selectedInvitation, setSelectedInvitation] = useState<string>('');
  const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
  const [invitationsPageState, setInvitationsPageState] = useState(initialPageState);
  const [invitationsList, setInvitationsList] = useState<Array<Invitation> | null>(null);
  const [invitationsPaginationInfo, setInvitationsPaginationInfo] = useState({
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: 1,
    previousPage: 0,
    lastPage: 1
  });

  const orgId = useAppSelector((state) => state.organization.orgId);
  const orgInfo = useAppSelector((state) => state.organization.orgInfo);

  // Users tab functions
  const getAllUsers = async () => {
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

        const uniqueRoles = users.flatMap(item => item.roles);
        setOrgRoles(uniqueRoles);
        
        // Set pagination info
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
  };

  const handleUsersPageChange = (page: number) => {
    setUsersPageState((prev) => ({
      ...prev,
      pageNumber: page
    }));
  };

  const editUserRole = (user: User) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  // Invitations tab functions
  const getAllInvitations = async () => {
    try {
      const roles = orgInfo?.roles;
      setOrgRoles(roles || []);
      setInvitationsLoading(true);
      
      const response = await getOrganizationInvitations(
        orgId, 
        invitationsPageState.pageNumber, 
        invitationsPageState.pageSize, 
        invitationsPageState.search
      );
      
      if (response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const invitationList = response.data?.data?.invitations;
        setInvitationsList(invitationList);
        
        // Set pagination info
        setInvitationsPaginationInfo({
          totalItems: response.data?.data?.totalItems ?? 0,
          hasNextPage: response.data?.data?.hasNextPage ?? false,
          hasPreviousPage: response.data?.data?.hasPreviousPage ?? false,
          nextPage: response.data?.data?.nextPage ?? 1,
          previousPage: response.data?.data?.previousPage ?? 0,
          lastPage: response.data?.data?.totalPages ?? 1
        });
      }
    } catch (err) {
      setError("Failed to fetch invitations");
      console.error(err);
    } finally {
      setInvitationsLoading(false);
    }
  };

  const handleInvitationsPageChange = (page: number) => {
    setInvitationsPageState((prev) => ({
      ...prev,
      pageNumber: page
    }));
  };

  const createInvitationsModel = () => {
    setInviteModalOpen(true);
  };

  const deleteInvitation = async () => {
    try {
      setDeleteLoading(true);
      const invitationId = selectedInvitation;
      
      const response = await deleteOrganizationInvitation(orgId, invitationId);
      
      if (response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        await getAllInvitations();
        setMessage(response.data?.message || 'Invitation deleted successfully');
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
  };

  // Common functions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    const timer = setTimeout(() => {
      if (activeTab === 'users') {
        setUsersPageState((prev) => ({
          ...prev,
          search: value,
          pageNumber: 1
        }));
      } else {
        setInvitationsPageState((prev) => ({
          ...prev,
          search: value,
          pageNumber: 1
        }));
      }
    }, 500);
    
    return () => clearTimeout(timer);
  };

  const handleRefresh = () => {
    if (activeTab === 'users') {
      getAllUsers();
    } else {
      getAllInvitations();
    }
  };

  // Effects
  useEffect(() => {
    if (activeTab === 'users') {
      getAllUsers();
    } else {
      getAllInvitations();
    }
  }, [activeTab]);

  useEffect(() => {
    getAllUsers();
  }, [usersPageState.pageNumber, usersPageState.search, usersPageState.sortingOrder]);

  useEffect(() => {
    getAllInvitations();
  }, [invitationsPageState.pageNumber, invitationsPageState.search, inviteModalOpen]);


  const getStatusClass = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };
  
  function setShowPopup(arg0: boolean) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="p-5">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Organization Members</h1>
        </div>
        
        <AlertComponent
          message={message ?? error}
          type={message ? 'success' : 'failure'}
          onAlertClose={() => {
            setMessage(null);
            setError(null);
          }}
        />
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
        
        <div className="relative w-full max-w-sm mb-6">
          <Input
            type="text"
            placeholder={activeTab === 'users' ? "Search members..." : "Search invitations..."}
            value={searchText}
            onChange={handleSearchChange}
            className="bg-background pr-4 pl-10 h-10 rounded-lg text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
          />
          <IconSearch className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>
        
        {/* Users Tab Content */}
        <TabsContent value="users" className="space-y-4 mt-0">
          {usersLoading ? (
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
                className="p-4 border rounded-lg shadow-sm bg-background hover:bg-muted/50 transition-colors"
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
                    {(orgRoles?.includes(Roles.OWNER) || orgRoles?.includes(Roles.ADMIN)) &&
                      user.roles?.includes(Roles.MEMBER) && (
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

          {usersList && usersList.length > 0 && usersPaginationInfo.lastPage > 1 && (
            <div className="mt-6">
              <Pagination className="justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        usersPaginationInfo.hasPreviousPage &&
                        handleUsersPageChange(usersPaginationInfo.previousPage)
                      }
                      className={!usersPaginationInfo.hasPreviousPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: usersPaginationInfo.lastPage }, (_, index) => {
                    const page = index + 1;
                    const isActive = page === usersPageState.pageNumber;

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handleUsersPageChange(page)}
                          className={
                            isActive
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : ''
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        usersPaginationInfo.hasNextPage &&
                        handleUsersPageChange(usersPaginationInfo.nextPage)
                      }
                      className={!usersPaginationInfo.hasNextPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>
        
        {/* Invitations Tab Content */}
        <TabsContent value="invitations" className="mt-0 space-y-4">
          {invitationsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="p-4 border rounded-lg shadow-sm bg-background animate-pulse mb-4">
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
          ) : !invitationsList || invitationsList?.length === 0 ? (
            <EmptyMessage
              title="No Invitations"
              description="Get started by inviting a user"
              buttonContent="Invite"
              onClick={(orgRoles?.includes(Roles.ADMIN) || orgRoles?.includes(Roles.OWNER)) ? createInvitationsModel : undefined}
              height="250px"
            />
          ) : (
            <div className="space-y-4">
             
        {invitationsList.map((invitation) => (
            <div 
              key={invitation.id} 
              className="p-4 border border-gray-200 rounded-lg shadow-sm bg-background hover:bg-muted/50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <h3 className="text-base font-medium">
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
                
                <div className="flex items-center">
                  <div className="flex justify-center items-center flex-col items-end mr-32">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusClass(invitation.status)}`}>
                      {TextTitlecase(invitation.status)}
                    </span>
                    <div className="text-xs text-muted-foreground mt-1">
                    <DateTooltip date={invitation.createDateTime}>
                            <span>Invited on {dateConversion(invitation.createDateTime)}</span>
                          </DateTooltip>
                    </div>
                  </div>
                  
                  {invitation.status === 'pending' && (orgRoles?.includes(Roles.ADMIN) || orgRoles?.includes(Roles.OWNER)) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInvitation(invitation.id);
                        setShowPopup(true);
                        setError(null);
                        setMessage(null);
                      }}
                      className="border border-yellow-400 hover:bg-yellow-50 rounded-md px-3 py-1"
                    >
                      <XCircleIcon className="h-4 w-4 mr-1" />
                      Delete Invitation
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
            </div>
          )}

          {invitationsList && invitationsList.length > 0 && invitationsPaginationInfo.lastPage > 1 && (
            <div className="mt-6">
              <Pagination className="justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        invitationsPaginationInfo.hasPreviousPage &&
                        handleInvitationsPageChange(invitationsPaginationInfo.previousPage)
                      }
                      className={!invitationsPaginationInfo.hasPreviousPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: invitationsPaginationInfo.lastPage }, (_, index) => {
                    const page = index + 1;
                    const isActive = page === invitationsPageState.pageNumber;

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handleInvitationsPageChange(page)}
                          className={
                            isActive
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : ''
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        invitationsPaginationInfo.hasNextPage &&
                        handleInvitationsPageChange(invitationsPaginationInfo.nextPage)
                      }
                      className={!invitationsPaginationInfo.hasNextPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EditUserRoleModal
        openModal={userModalOpen}
        user={selectedUser as User}
        setMessage={(data) => setMessage(data)}
        setOpenModal={setUserModalOpen}
      />

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
        onSuccess={() => deleteInvitation()}
        message={'Would you like to proceed? Keep in mind that this action cannot be undone.'}
        buttonTitles={["No, cancel", "Yes, I'm sure"]}
        isProcessing={deleteLoading}
        setFailure={setError}
        setSuccess={setMessage}
      />
    </div>
  );
}
