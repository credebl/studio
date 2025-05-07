'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ChangeEvent, useEffect, useState } from "react";
import { CheckIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { acceptRejectInvitations, getUserInvitations } from '@/app/api/Invitation';

import { AlertComponent } from"@/components/AlertComponent";
import { AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import { EmptyMessage } from "@/components/EmptyMessage";
import { IconSearch } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Invitation } from "../interfaces/invitation-interface";
import Loader from "@/components/Loader";
import { OrgRole } from "@/features/users/components/users-interface";
import { apiStatusCodes } from "@/config/CommonConstant";
import { pathRoutes } from "@/config/pathRoutes";

const initialPageState = {
  pageNumber: 1,
  pageSize: 10,
  total: 0,
};

export default function ReceivedInvitations() {
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPageState);
  const [searchText, setSearchText] = useState('');
  const [invitationsList, setInvitationsList] = useState<Array<Invitation> | null>(null);

  const getAllInvitations = async () => {
    setLoading(true);
    try {
      const response = await getUserInvitations(
        currentPage.pageNumber,
        currentPage.pageSize,
        searchText,
      );
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const totalPages = data?.data?.totalPages;
        const invitationList = data?.data?.invitations;

        setInvitationsList(invitationList);
        setCurrentPage({
          ...currentPage,
          total: totalPages,
        });
      } else {
        setError(response as string);
      }
    } catch (err) {
      setError('Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  const checkSearchMatch = (list: Array<Invitation> | null, query: string): boolean => {
    if (!list || list.length === 0 || !query) return true;
    const searchQuery = query.toLowerCase().trim();
    return list.some(invitation => 
      invitation.organisation.name.toLowerCase().includes(searchQuery)
    );
  };

  useEffect(() => {
    let getData: NodeJS.Timeout;

    if (searchText.length >= 1) {
      getData = setTimeout(() => {
        setCurrentPage(prev => ({
          ...prev,
          pageNumber: 1
        }));
        getAllInvitations();
      }, 500); 
      return () => clearTimeout(getData);
    } else {
      getAllInvitations();
    }

    return () => clearTimeout(getData);
  }, [searchText, currentPage.pageNumber]);

  // onChange of Search input text
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle page change
  const onPageChange = (page: number) => {
    setCurrentPage({
      ...currentPage,
      pageNumber: page,
    });
  };

  const handleRefresh = () => {
    getAllInvitations();
  };

  const respondToInvitations = async (invite: Invitation, status: string) => {
    setLoading(true);
    try {
      const response = await acceptRejectInvitations(
        invite.id,
        invite.orgId,
        status,
      );
      const { data } = response as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setMessage(data?.message);
        setLoading(false);
        window.location.href = pathRoutes.organizations.root;
      } else {
        setError(response as string);
      }
    } catch (err) {
      setError('Failed to respond to invitation');
    } finally {
      setLoading(false);
    }
  };

  const renderPagination = () => {
    if (currentPage.total <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      currentPage.pageNumber - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(currentPage.total, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => onPageChange(i)}
            isActive={currentPage.pageNumber === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage.pageNumber - 1))}
              className={currentPage.pageNumber === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {pages}
          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(Math.min(currentPage.total, currentPage.pageNumber + 1))}
              className={currentPage.pageNumber === currentPage.total ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
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
                className="bg-background text-muted-foreground focus-visible:ring-primary h-10 rounded-lg pr-4 pl-10 text-sm shadow-sm focus-visible:ring-1"
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
              type={message ? 'success' : 'destructive'}
              onAlertClose={() => {
                setMessage(null);
                setError(null);
              }}
            />
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : invitationsList && invitationsList?.length > 0 ? (
            searchText && !checkSearchMatch(invitationsList, searchText) ? (
              <EmptyMessage
                title="No Organization Invitation Found"
                description="No organization invitations match your search criteria."
                height="250px"
              />
            ) : (
              <div className="space-y-4">
                {invitationsList.map((invitation, index) => (
                  <Card key={invitation.id ?? index} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
                                  {invitation.organisation.logoUrl}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {invitation.organisation.name}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="text-sm text-muted-foreground">Roles:</span>
                              {invitation.orgRoles &&
                                invitation.orgRoles.length > 0 &&
                                invitation.orgRoles.map((role: OrgRole, index: number) => (
                                  <span
                                    key={index}
                                    className="bg-primary-50 text-primary-700 px-2 py-1 rounded-md text-xs font-medium"
                                  >
                                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button
                            onClick={() => respondToInvitations(invitation, 'rejected')}
                            variant="outline"
                            className="md:w-auto text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-md font-medium px-5 py-3 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                          >
                            <XIcon className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => respondToInvitations(invitation, 'accepted')}
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
            )
          ) : (
            <EmptyMessage
              title="No Invitations"
              description="You don't have any invitation"
              height="250px"
            />
          )}

          {renderPagination()}
        </CardContent>
      </Card>
    </div>
  );
}