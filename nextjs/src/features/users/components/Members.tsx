'use client';

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

import { AlertComponent } from "@/components/AlertComponent";
import { AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import EditUserRoleModal from "./EditUserRoleModal";
import { EmptyMessage } from "@/components/EmptyMessage";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Roles } from "@/common/enums";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "./users-interface";
import { apiStatusCodes } from "@/config/CommonConstant";
import { getOrganizationUsers } from "@/app/api/organization";
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
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageState, setPageState] = useState(initialPageState);
  const [searchText, setSearchText] = useState('');
  const [usersList, setUsersList] = useState<Array<User> | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('users');
  const [orgUserRole, setOrgUserRole] = useState<string[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: 1,
    previousPage: 0,
    lastPage: 1
  });

  const orgId = useAppSelector((state) => state.organization.orgId);
  const orgInfo = useAppSelector((state) => state.organization.orgInfo)

  const getOrgUserRole = async () => {
		const orgRoles = orgInfo?.roles;

    if (orgRoles) {
      setOrgUserRole(orgRoles);
    }
	};

	useEffect(() => {
		getOrgUserRole();
	},[])

  const getAllUsers = async () => {
    setLoading(true);

    try {
      const response = await getOrganizationUsers(
        orgId,
        pageState.pageNumber,
        pageState.pageSize,
        pageState.search
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
        
        // Set pagination info
        setPaginationInfo({
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
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [pageState.pageNumber, pageState.search, pageState.sortingOrder]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    
    const timer = setTimeout(() => {
      setPageState((prev) => ({
        ...prev,
        search: value,
        pageNumber: 1
      }));
    }, 500);
    
    return () => clearTimeout(timer);
  };

  const onPageChange = (page: number) => {
    setPageState((prev) => ({
      ...prev,
      pageNumber: page
    }));
  };

  const editUserRole = (user: User) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

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
            placeholder="Search members..."
            value={searchText}
            onChange={handleSearchChange}
            className="bg-background pr-4 pl-10 h-10 rounded-lg text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
          />
          <IconSearch className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>
        
        <TabsContent value="users" className="space-y-4 mt-0">
          {loading ? (
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
                    {(orgUserRole?.includes(Roles.OWNER) || orgUserRole?.includes(Roles.ADMIN)) && 
                      !user.roles?.includes(Roles.OWNER) && (
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

          {usersList && usersList.length > 0 && paginationInfo.lastPage > 1 && (
            <div className="mt-6">
              <Pagination className="justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        paginationInfo.hasPreviousPage &&
                        onPageChange(paginationInfo.previousPage)
                      }
                      className={!paginationInfo.hasPreviousPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {Array.from({ length: paginationInfo.lastPage }, (_, index) => {
                    const page = index + 1;
                    const isActive = page === pageState.pageNumber;

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
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        paginationInfo.hasNextPage &&
                        onPageChange(paginationInfo.nextPage)
                      }
                      className={!paginationInfo.hasNextPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="invitations" className="mt-0">
          <EmptyMessage
            title="No Invitations"
            description="You don't have any pending invitations."
            height="250px"
          />
        </TabsContent>
      </Tabs>

      <EditUserRoleModal
        openModal={openModal}
        user={selectedUser as User}
        setMessage={(data) => setMessage(data)}
        setOpenModal={setOpenModal}
      />
    </div>
  );
}