'use client';

import * as Yup from 'yup';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { MailIcon, PlusIcon, SendIcon, TrashIcon } from 'lucide-react';
import { RoleI, SendInvitationModalProps } from '../interfaces/invitation-interface';
import { useEffect, useState } from 'react';

import { AlertComponent } from '@/components/AlertComponent';
import { AxiosResponse } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiStatusCodes } from '@/config/CommonConstant';
import { createInvitations } from '@/app/api/Invitation';
import { getOrganizationRoles } from '@/app/api/organization';
import { useAppSelector } from '@/lib/hooks';

interface Invitation {
  email: string;
  role: string;
  roleId: string;
}

// Validation schema using Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Email is invalid')
    .required('Email is required')
    .trim()
});

export default function SendInvitationModal({
  getAllSentInvitations,
  openModal,
  setMessage,
  setOpenModal
}: SendInvitationModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [selfEmail, setSelfEmail] = useState<string>('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [memberRole, setMemberRole] = useState<RoleI | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedOrgId = useAppSelector((state) => state.organization.orgId);
  const userProfileDetails = useAppSelector((state) => state.user.userInfo);

  const getRoles = async () => {
    try {
      const resRoles = await getOrganizationRoles(selectedOrgId);
      const { data } = resRoles as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const roles: Array<RoleI> = data?.data;
        const memberRole = roles.find((role) => role.name === 'member');
        setMemberRole(memberRole as RoleI);
      } else {
        setErrorMsg(resRoles as string);
      }
    } catch (error) {
      setErrorMsg('Failed to fetch roles');
    }
  };

  useEffect(() => {
    const getEmail = async () => {
      const email = userProfileDetails?.email;
      setSelfEmail(email);
    };

    if (openModal) {
      setInvitations([]);
      getRoles();
      getEmail();
    }
  }, [openModal, userProfileDetails?.email]);

  const includeInvitation = async (email: string) => {
    setInvitations([
      ...invitations,
      {
        email: email,
        role: memberRole?.name as string,
        roleId: String(memberRole?.id),
      },
    ]);
  };

  const removeInvitation = (email: string) => {
    const invitationList = invitations.filter((item) => email !== item.email);
    setInvitations(invitationList);
  };

  const sendInvitations = async () => {
    setLoading(true);

    try {
      const invitationPayload = invitations.map((invitation) => ({
        email: invitation.email,
        orgRoleId: [invitation.roleId],
      }));

      const resCreateOrg = await createInvitations(selectedOrgId, invitationPayload);
      const { data } = resCreateOrg as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setMessage(data?.message);
        setOpenModal(false);
        if (getAllSentInvitations) {
          getAllSentInvitations();
        }
      } else {
        setErrorMsg(resCreateOrg as string);
      }
    } catch (error) {
      setErrorMsg('Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const validateAndAddEmail = (values, { resetForm, setFieldError }) => {
    if (values.email.trim() === selfEmail.trim()) {
      setFieldError('email', "You can't send invitation to yourself");
      return;
    }
    
    if (invitations.some(inv => inv.email === values.email)) {
      setFieldError('email', "This email has already been added");
      return;
    }

    includeInvitation(values.email);
    resetForm();
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="sm:max-w-2xl">
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
          onSubmit={validateAndAddEmail}
        >
          {({ errors, touched }) => (
            <Form className="space-y-2">
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as={Input}
                      id="email"
                      name="email"
                      placeholder="example@email.com"
                      className={`bg-background focus-visible:ring-1 focus-visible:ring-primary ${
                        errors.email && touched.email ? 'border-red-500' : ''
                      }`}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add
                </Button>
              </div>
            </Form>
          )}
        </Formik>

        {invitations.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="border rounded-lg divide-y">
              {invitations.map((invitation) => (
                <div key={invitation.email} className="p-3 flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center">
                      <MailIcon className="h-9 w-9 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground">Role: Member</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeInvitation(invitation.email)}
                  >
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={sendInvitations}
            disabled={loading ?? invitations.length === 0}
            className="flex items-center gap-2"
          >
            <SendIcon className="h-5 w-5" />
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}