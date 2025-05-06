'use client';

import * as z from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MailIcon, PlusIcon, SendIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AlertComponent } from '@/components/AlertComponent';
import { AxiosResponse } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiStatusCodes } from '@/config/CommonConstant';
import { createInvitations } from '@/app/api/Invitation';
import { getOrganizationRoles } from '@/app/api/organization';
import { useAppSelector } from '@/lib/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface SendInvitationModalProps {
  getAllSentInvitations?: () => void;
  flag?: boolean;
  openModal: boolean;
  setMessage: (message: string) => void;
  setOpenModal: (flag: boolean) => void;
}

interface RoleI {
  id: string;
  name: string;
}

interface Invitation {
  email: string;
  role: string;
  roleId: string;
}

// Form schema
const formSchema = z.object({
  email: z.string()
    .email('Email is invalid')
    .refine(email => email.trim() !== '', {
      message: 'Email is required',
    })
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
  const userProfileDetails = useAppSelector((state) => state.user.userInfo)
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Check if email is the user's own email
    if (values.email.trim() === selfEmail.trim()) {
      form.setError('email', { 
        message: "You can't send invitation to yourself"
      });
      return;
    }
    
    // Check if email already exists in invitations
    if (invitations.some(inv => inv.email === values.email)) {
      form.setError('email', { 
        message: "This email has already been added"
      });
      return;
    }

    // Add invitation
    await includeInvitation(values.email);
    form.reset();
  };

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
      form.reset();
      setInvitations([]);
      getRoles();
      getEmail();
    }
  }, [openModal, form]);

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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="example@email.com" 
                          className="bg-background focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add
              </Button>
            </div>
          </form>
        </Form>

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
            disabled={loading || invitations.length === 0}
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