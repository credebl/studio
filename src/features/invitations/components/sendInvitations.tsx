'use client'

import * as Yup from 'yup'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import { MailIcon, PlusIcon, SendIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  RoleI,
  SendInvitationModalProps,
} from '../interfaces/invitation-interface'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { DeleteIcon } from '@/config/svgs/DeleteIcon'
import { Input } from '@/components/ui/input'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createInvitations } from '@/app/api/Invitation'
import { getOrganizationRoles } from '@/app/api/organization'
import { useAppSelector } from '@/lib/hooks'

interface Invitation {
  email: string
  role: string
  roleId: string
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Email is invalid')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Email is invalid',
    )
    .required('Email is required')
    .trim(),
})

export default function SendInvitationModal({
  getAllSentInvitations,
  openModal,
  setMessage,
  setOpenModal,
}: SendInvitationModalProps): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false)
  const [selfEmail, setSelfEmail] = useState<string>('')
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [memberRole, setMemberRole] = useState<RoleI | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const selectedOrgId = useAppSelector((state) => state.organization.orgId)
  const userProfileDetails = useAppSelector((state) => state.user.userInfo)

  const getRoles = async (): Promise<void> => {
    try {
      const resRoles = await getOrganizationRoles(selectedOrgId)
      const { data } = resRoles as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const roles: RoleI[] = data?.data
        const memberRole = roles.find((role) => role.name === 'member')
        setMemberRole(memberRole as RoleI)
      } else {
        setErrorMsg(resRoles as string)
      }
    } catch (error) {
      console.error('Failed to fetch roles ', error)
      setErrorMsg('Failed to fetch roles')
    }
  }

  useEffect(() => {
    const getEmail = async (): Promise<void> => {
      const email = userProfileDetails?.email
      setSelfEmail(email)
    }

    if (openModal) {
      setInvitations([])
      getRoles()
      getEmail()
    }
  }, [openModal, userProfileDetails?.email])

  const includeInvitation = async (email: string): Promise<void> => {
    setInvitations([
      ...invitations,
      {
        email,
        role: memberRole?.name as string,
        roleId: String(memberRole?.id),
      },
    ])
  }

  const removeInvitation = (email: string): void => {
    const invitationList = invitations.filter((item) => email !== item.email)
    setInvitations(invitationList)
  }

  const sendInvitations = async (): Promise<void> => {
    setLoading(true)

    try {
      const invitationPayload = invitations.map((invitation) => ({
        email: invitation.email,
        orgRoleId: [invitation.roleId],
      }))

      const resCreateOrg = await createInvitations(
        selectedOrgId,
        invitationPayload,
      )
      const { data } = resCreateOrg as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setMessage(data?.message)
        setOpenModal(false)
        if (getAllSentInvitations) {
          getAllSentInvitations()
        }
      } else {
        setErrorMsg(resCreateOrg as string)
      }
    } catch (error) {
      console.error('Failed to send invitations', error)
      setErrorMsg('Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  const validateAndAddEmail = (values: { email: string }): void => {
    if (values.email.trim() === selfEmail.trim()) {
      setErrorMsg('You can not send invitation to yourself')
      return
    }

    if (invitations.some((inv) => inv.email === values.email)) {
      setErrorMsg('This email has already been added')
      return
    }

    includeInvitation(values.email)
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent
        className="sm:max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Send Invitation(s)</DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <AlertComponent
            message={errorMsg}
            type="failure"
            onAlertClose={() => setErrorMsg(null)}
          />
        )}

        <Formik
          initialValues={{ email: '' }}
          validationSchema={validationSchema}
          validateOnMount={false}
          onSubmit={(values, formikHandlers) => {
            formikHandlers.resetForm()
            validateAndAddEmail(values)
          }}
        >
          {({ errors, touched }) => (
            <Form className="space-y-2">
              <div className="flex items-end gap-4">
                <div className="flex flex-1 items-end gap-4">
                  <div className="grow">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      autoFocus={false}
                      placeholder="example@email.com"
                      className={`bg-background placeholder:text-muted-foreground/50 focus-visible:ring-1 ${
                        errors.email && touched.email
                          ? 'border-destructive'
                          : ''
                      }`}
                    />
                  </div>
                  <Button type="submit" className="flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Add
                  </Button>
                </div>
              </div>
              <ErrorMessage
                name="email"
                component="div"
                className="text-destructive mt-1 text-sm"
              />
              <div className="flex justify-end">
                <Button
                  onClick={sendInvitations}
                  disabled={loading || !(invitations.length > 0)}
                  className="flex items-center gap-2"
                >
                  <SendIcon className="h-5 w-5" />
                  Send
                </Button>
              </div>
            </Form>
          )}
        </Formik>
        {invitations.length > 0 && (
          <div className="mt-4 max-h-[200px] overflow-y-auto rounded-lg border p-2">
            <div className="space-y-2">
              <div className="divide-y rounded-lg border">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.email}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center">
                        <MailIcon className="text-muted-foreground h-9 w-9" />
                      </div>
                      <div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-medium">
                                {invitation.email.slice(0, 30)}
                                {invitation.email.length > 30 && ' . . .'}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {invitation.email}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <p className="text-muted-foreground text-sm">
                          Role: Member
                        </p>
                      </div>
                    </div>
                    <Button
                      className="bg-transparent hover:bg-transparent"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInvitation(invitation.email)}
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
