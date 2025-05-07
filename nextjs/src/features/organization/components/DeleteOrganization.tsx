'use client';

import { useEffect, useState } from 'react';
import { apiStatusCodes } from '@/config/CommonConstant';
import type { AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { pathRoutes } from '@/config/pathRoutes';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { DeleteOrganizationCard } from './DeleteOrganizationCard';
import {
  deleteIssuanceRecords,
  deleteOrganization,
  deleteOrganizationWallet,
  deleteVerificationRecords,
  getOrganizationById,
  getOrganizationReferences
} from '@/app/api/organization';
import { deleteConnectionRecords } from '@/app/api/connection';

interface IOrgCount {
  verificationRecordsCount?: number;
  issuanceRecordsCount?: number;
  connectionRecordsCount?: number;
}

interface IEcosystemOrganizations {
  ecosystemRole?: {
    name: string;
  };
}

export default function DeleteOrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [organizationData, setOrganizationData] = useState<IOrgCount | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [isWalletPresent, setIsWalletPresent] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [deleteAction, setDeleteAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState<
  string | React.ReactNode
  >('');
  const [description, setDescription] = useState<string>('');
  const [orgName, setOrgName] = useState<string>('');

  const fetchOrganizationDetails = async () => {
    if (!orgId) {
      router.push(pathRoutes.organizations.root);
      return;
    }
    
    try {
      setLoading(true);
      const response = await getOrganizationById(orgId);
      const { data } = response as AxiosResponse;
      
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const organizationData = data?.data;
        setOrgData(organizationData);
        const walletName = organizationData?.org_agents?.[0]?.walletName;
        const name = organizationData?.name;
        
        if (name) {
          setOrgName(name);
        }
        
        if (walletName) {
          setIsWalletPresent(true);
        } else {
          setIsWalletPresent(false);
        }
      }
    } catch (error) {
      setError('Failed to fetch organization details');
    } finally {
      setLoading(false);
    }
  };
  
  
  const fetchOrganizationReferences = async () => {
    if (!orgId) return;

    setLoading(true);
    try {
      const response = await getOrganizationReferences(orgId);
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const orgData = data?.data;
        setOrganizationData(orgData);
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizationDetails();
    fetchOrganizationReferences();
  }, [orgId]);

  const deleteHandler = async (deleteFunc: () => Promise<void>) => {
    setDeleteLoading(true);
    try {
      await deleteFunc();
      await fetchOrganizationReferences();
      setShowPopup(false);
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setDeleteLoading(false);
  };

  const deleteVerifications = async () => {
    setDeleteLoading(true);
    try {
      const response = await deleteVerificationRecords(orgId as string);
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message);
        await fetchOrganizationReferences();
        setShowPopup(false);
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setDeleteLoading(false);
  };

  const deleteIssuance = async () => {
    setDeleteLoading(true);
    try {
      const response = await deleteIssuanceRecords(orgId as string);
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message);
        await fetchOrganizationReferences();
        setShowPopup(false);
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setDeleteLoading(false);
  };

  const deleteConnection = async () => {
    setDeleteLoading(true);
    try {
      const response = await deleteConnectionRecords(orgId as string);
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message);
        await fetchOrganizationReferences();
        setShowPopup(false);
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setDeleteLoading(false);
  };

  const deleteOrgWallet = async () => {
    try {
      // Assuming deleteOrganizationWallet needs orgId
      const response = await deleteOrganizationWallet(orgId as string);
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message);
        setIsWalletPresent(false);
        await fetchOrganizationReferences();
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        setShowPopup(false);
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
  };

  const deleteOrganizations = async () => {
    try {
      // Assuming deleteOrganization needs orgId
      const response = await deleteOrganization(orgId as string);
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message);
        await fetchOrganizationReferences();
        setShowPopup(false);

        setTimeout(() => {
          window.location.href = pathRoutes.organizations.root;
        }, 3000);
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
  };

  const deleteFunctions = {
    deleteVerifications,
    deleteIssuance,
    deleteConnection,
    deleteOrgWallet,
    deleteOrganizations
  };

  if (loading && !orgData) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <p className='ml-2'>Loading organization data...</p>
      </div>
    );
  }

  if (!orgData && !loading) {
    return (
      <div className='p-4'>
        <Alert variant='destructive'>
          <AlertDescription>
            Organization not found or you don`t have permission to access it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const deleteCardData = [
    {
      title: 'Verifications',
      description: 'Verifications is the list of verification records',
      count: organizationData?.verificationRecordsCount ?? 0,
      deleteFunc: deleteFunctions.deleteVerifications,
      confirmMessage: 'Are you sure you want to delete verification records?',
      isDisabled: false
    },
    {
      title: 'Issuance',
      description: 'Issuance is the list of credential records',
      count: organizationData?.issuanceRecordsCount ?? 0,
      deleteFunc: deleteFunctions.deleteIssuance,
      confirmMessage: 'Are you sure you want to delete credential records?',
      isDisabled: (organizationData?.verificationRecordsCount ?? 0) > 0
    },
    {
      title: 'Connections',
      description: 'Connections is the list of connection records',
      count: organizationData?.connectionRecordsCount ?? 0,
      deleteFunc: deleteFunctions.deleteConnection,
      confirmMessage: 'Are you sure you want to delete connection records?',
      isDisabled:
        (organizationData?.issuanceRecordsCount ?? 0) > 0 ||
        (organizationData?.verificationRecordsCount ?? 0) > 0
    },
    {
      title: 'Organization wallet',
      description: 'Organization Wallet is the data of your created DIDs.',
      count: isWalletPresent ? 1 : 0,
      deleteFunc: deleteFunctions.deleteOrgWallet,
      confirmMessage: 'Are you sure you want to delete organization wallet?',
      isDisabled:
        (organizationData?.connectionRecordsCount ?? 0) > 0 ||
        (organizationData?.issuanceRecordsCount ?? 0) > 0 ||
        (organizationData?.verificationRecordsCount ?? 0) > 0
    },
    {
      title: 'Organization',
      description:
        'Organization is the collection of your users, schemas, cred-defs, connections and wallet.',
      deleteFunc: deleteFunctions.deleteOrganizations,
      confirmMessage: (
        <>
          Are you sure you want to delete organization{' '}
          <span className='font-bold'>{orgData?.name}</span>?
        </>
      ),
      isDisabled: isWalletPresent
    }
  ];

  return (
    <div className='px-4 pt-2'>
      <h1 className='mt-2 mr-auto mb-4 ml-1 text-xl font-semibold sm:text-2xl'>
        Delete Organization
      </h1>

      {error && (
        <Alert variant='destructive' className='mb-4'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {organizationData && (
        <div className='space-y-4'>
          {deleteCardData.map((card) => (
            <DeleteOrganizationCard
              key={card.title}
              title={card.title}
              description={card.description}
              count={card.count}
              isDisabled={card.isDisabled}
              onDeleteClick={() => {
                setShowPopup(true);
                setDeleteAction(() => card.deleteFunc);
                setConfirmMessage(card.confirmMessage);
                setDescription(card.description);
              }}
            />
          ))}

<AlertDialog open={showPopup} onOpenChange={setShowPopup}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmation</AlertDialogTitle>
      <AlertDialogDescription asChild>
        <div className="space-y-2">
          {confirmMessage}
          {description && (
            <div className=''>
              {description}
            </div>
          )}
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={deleteLoading}>
        No, cancel
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={() =>
          deleteHandler(deleteAction as () => Promise<void>)
        }
        disabled={deleteLoading}
        className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
      >
        {deleteLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            <span>Processing...</span>
          </>
        ) : (
          'Yes, delete'
        )}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
        </div>
      )}
    </div>
  );
}