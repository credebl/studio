'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, BookmarkIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'
import { RoleNames, apiStatusCodes } from '@/config/CommonConstant'
import {
  editOrganizationUserRole,
  getOrganizationRoles,
} from '@/app/api/organization'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TextTitlecase } from '@/utils/TextTransform'
import { User } from './users-interface'
import { useAppSelector } from '@/lib/hooks'

interface RoleI {
  id: string
  name: string
  checked: boolean
  disabled: boolean
}

interface EditUserRoleModalProps {
  openModal: boolean
  user: User
  setMessage: (message: string) => void
  setOpenModal: (flag: boolean) => void
  getAllUsersFun: () => void
}

const EditUserRoleModal = ({
  openModal,
  user,
  setMessage,
  setOpenModal,
  getAllUsersFun,
}: EditUserRoleModalProps): React.JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false)
  const [roles, setRoles] = useState<RoleI[] | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const orgId = useAppSelector((state) => state.organization.orgId)
  const getRoles = async (): Promise<void> => {
    try {
      const response = await getOrganizationRoles(orgId)

      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const fetchedRoles: RoleI[] = data.data
        const filteredRoles = fetchedRoles
          .filter(
            (role) =>
              !([RoleNames.OWNER, RoleNames.HOLDER] as string[]).includes(
                role.name,
              ),
          )
          .map((role) => {
            if (
              user?.roles.includes(role.name) &&
              role.name !== RoleNames.MEMBER
            ) {
              return { ...role, checked: true, disabled: false }
            } else if (role.name === RoleNames.MEMBER) {
              return { ...role, checked: true, disabled: true }
            } else {
              return { ...role, checked: false, disabled: false }
            }
          })

        setRoles(filteredRoles)
      } else {
        setErrorMsg(response as unknown as string)
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      setErrorMsg('Failed to fetch roles')
    }
  }

  useEffect(() => {
    if (openModal) {
      getRoles()
    }
  }, [openModal, user])

  const handleSave = async (): Promise<void> => {
    setLoading(true)

    try {
      const roleIds = roles
        ?.filter((role) => role.checked)
        .map((role) => role.id)
      const response = (await editOrganizationUserRole(
        user.id,
        roleIds as string[],
        orgId,
      )) as AxiosResponse

      if (response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setMessage(response.data.message)
        getAllUsersFun()
        setOpenModal(false)
      } else {
        setErrorMsg(response as unknown as string)
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      setErrorMsg('Failed to update user role')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (checked: boolean, role: RoleI): void => {
    if (
      (role.name === 'issuer' && checked === true) ||
      (role.name === 'verifier' && checked === true)
    ) {
      const updatedRoles = roles?.map((r) => {
        if (r.id === role.id) {
          return { ...r, checked }
        } else if (
          (r.name === 'verifier' && r.checked) ||
          (r.name === 'issuer' && r.checked) ||
          (r.name === 'member' && r.checked)
        ) {
          return { ...r, checked: true }
        } else {
          return { ...r, checked: false }
        }
      })
      setRoles(updatedRoles ?? null)
    } else if (role.name === 'admin' && checked === true) {
      const updatedRoles = roles?.map((r) => {
        if (r.id === role.id) {
          return { ...r, checked }
        } else if (r.name === 'member' && r.checked) {
          return { ...r, checked: true }
        } else {
          return { ...r, checked: false }
        }
      })
      setRoles(updatedRoles ?? null)
    } else {
      const updatedRoles = roles?.map((r) => {
        if (r.id === role.id) {
          return { ...r, checked }
        }
        return r
      })
      setRoles(updatedRoles ?? null)
    }
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="max-w-2xl! rounded-xl shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-muted-foreground flex items-center text-xl font-medium">
            Manage User Role
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="rounded-lg border p-5 shadow-sm">
            <div className="space-y-4">
              <div className="mb-2 flex items-center pb-4">
                <div className="flex-grow">
                  <p className="truncate text-base font-semibold">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>

              <div className="w-full">
                <div className="mb-3 flex items-center text-sm font-medium">
                  <span className="mr-1">Roles</span>
                  <span className="text-destructive">*</span>
                </div>

                {roles && (
                  <div className="grid grid-cols-2 space-y-3">
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center rounded-md p-3 transition-all"
                        onClick={() =>
                          !role.disabled &&
                          handleRoleChange(!role.checked, role)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleRoleChange(!role.checked, role)
                          }
                        }}
                      >
                        <Checkbox
                          id={`checkbox-${role.id}`}
                          checked={role.checked}
                          disabled={role.disabled}
                          onCheckedChange={(checked) =>
                            handleRoleChange(checked as boolean, role)
                          }
                          className={`h-5 w-5 rounded border ${
                            role.checked
                              ? 'border'
                              : role.disabled
                                ? 'text-muted'
                                : ''
                          } mr-3`}
                        />
                        <div className="flex flex-grow items-center justify-between">
                          <Label
                            htmlFor={`checkbox-${role.id}`}
                            className={`${role.disabled ? 'text-muted-foreground/60' : 'font-light'} cursor-pointer`}
                          >
                            {TextTitlecase(role.name)}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {errorMsg && (
            <Alert variant="destructive" className="text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center"
            >
              {loading ? (
                <svg
                  className="mr-2 -ml-1 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <BookmarkIcon className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditUserRoleModal
