/* eslint-disable prettier/prettier */
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import React, { useEffect, useState } from 'react'
import { setOrgId, setOrgInfo, setTenantData } from '@/lib/orgSlice'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Loader from '@/components/Loader'
import { Organization } from '@/features/dashboard/type/organization'
import { Plus } from 'lucide-react'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizations } from '@/app/api/organization'
import { useAppDispatch } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

export const OrganizationList = (): React.JSX.Element => {
  const [organizationsList, setOrganizationsList] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [isCreatingOrg, setIsCreatingOrg] = useState(false)

  const [currentPage, setCurrentPage] = useState({
    pageNumber: 1,
    pageSize: 9,
    total: 0,
    totalCount: 0,
  })

  const router = useRouter()
  const dispatch = useAppDispatch()

  const getAllOrganizations = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await getOrganizations(
        currentPage.pageNumber,
        currentPage.pageSize,
        searchText,
      )

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const totalPages = data?.data?.totalPages
        const totalCount = data?.data?.totalCount

        const orgList = data?.data?.organizations.map(
          (userOrg: Organization) => {
            const roles: string[] = userOrg.userOrgRoles.map(
              (role) => role.orgRole.name,
            )
            return {
              ...userOrg,
              roles,
            }
          },
        )

        setOrganizationsList(orgList)
        setCurrentPage((prev) => ({
          ...prev,
          total: totalPages,
          totalCount,
        }))
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number): void => {
    setCurrentPage((prev) => ({ ...prev, pageNumber: newPage }))
  }

  const handleCardClick = (orgId: string): void => {
    if (!orgId) {
      console.error('Invalid organization ID')
      return
    }

    const selectedOrg = organizationsList.find((org) => org.id === orgId)

    if (selectedOrg) {
      dispatch(setOrgId(selectedOrg.id))
      dispatch(
        setTenantData({
          id: selectedOrg.id,
          name: selectedOrg.name,
          logoUrl: selectedOrg.logoUrl,
        }),
      )
      const orgRoles = selectedOrg?.userOrgRoles

      dispatch(
        setOrgInfo({
          id: selectedOrg.id,
          name: selectedOrg.name,
          description: selectedOrg.description,
          logoUrl: selectedOrg.logoUrl,
          roles: orgRoles?.map((item) => item?.orgRole?.name) ?? [],
        }),
      )
    }

    router.push(`/${orgId}`)
  }
  const handleCreateOrg = (): void => {
    setIsCreatingOrg(true)

    setTimeout(() => {
      router.push('/create-organization')
    }, 300)
  }

  useEffect(() => {
    getAllOrganizations()
  }, [currentPage.pageNumber, currentPage.pageSize, searchText])

  return (
    <div className="space-y-6">
      <div className="mx-8 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
          />
          <Button
            disabled={currentPage.totalCount >= 10 || isCreatingOrg}
            onClick={handleCreateOrg}
            className="gap-2"
          >
            {isCreatingOrg ? (
              <Loader />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Organization
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mx-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="col-span-full mb-4 grid min-h-[50vh] w-full place-items-center">
            <Loader />
          </div>
        )}
        {organizationsList.length > 0 ? (
          organizationsList.map((org) => (
            <Card
              key={org.id}
              onClick={() => handleCardClick(org.id)}
              className="border-border relative h-full w-full cursor-pointer overflow-hidden rounded-xl border p-6 py-4 shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 rounded-md">
                  {org.logoUrl ? (
                    <AvatarImage src={org.logoUrl} alt={org.name} />
                  ) : (
                    <AvatarFallback className="text-2xl font-bold">
                      {org.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h3
                    className="text-foreground mb-1 truncate text-base font-semibold"
                    title={org.name}
                  >
                    {org.name}
                  </h3>
                  <p
                    className="text-foreground mb-2 truncate overflow-hidden text-sm"
                    title={org.description}
                  >
                    {org.description}
                  </p>

                  <div className="text-md mt-2 flex flex-wrap items-center gap-1">
                    <span className="mr-1 font-bold">Role(s):</span>
                    {org.userOrgRoles.length > 0 ? (
                      org.userOrgRoles.map((roles, index) => (
                        <span
                          key={`${roles.orgRole.name}-${index}`}
                          className="bg-secondary text-secondary-foreground rounded-md px-3 py-1 text-sm"
                        >
                          {roles.orgRole.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No Roles
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-muted-foreground col-span-full flex min-h-[300px] flex-col items-center justify-center gap-2 text-center">
            <p className="text-lg font-semibold">No organizations found.</p>
            <p className="text-sm">
              Get started by creating a new organization.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between px-8">
        <div className="text-muted-foreground text-sm">
          Showing {(currentPage.pageNumber - 1) * currentPage.pageSize + 1} to{' '}
          {Math.min(
            currentPage.pageNumber * currentPage.pageSize,
            currentPage.totalCount,
          )}{' '}
          of {currentPage.totalCount} entries
        </div>

        {organizationsList && organizationsList.length > 0 && (
          <div>
            <Pagination>
              <PaginationContent className="gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage.pageNumber > 1 &&
                      handlePageChange(currentPage.pageNumber - 1)
                    }
                    className={
                      currentPage.pageNumber === 1
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                  />
                </PaginationItem>

                {Array.from({ length: currentPage.total }, (_, index) => (
                  <PaginationItem key={index}>
                    <Button
                      variant={
                        currentPage.pageNumber === index + 1
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Button>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage.pageNumber < currentPage.total &&
                      handlePageChange(currentPage.pageNumber + 1)
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
          </div>
        )}
      </div>
    </div>
  )
}
