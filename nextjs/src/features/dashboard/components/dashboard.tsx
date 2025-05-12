'use client';

import { getUserEcosystemInvitations, getUserInvitations } from '@/app/api/Invitation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect, useState } from 'react';

import { AlertComponent } from '@/components/AlertComponent';
import { AxiosResponse } from 'axios';
import { Button } from '@/components/ui/button';
import CredentialDefinition from './CredentialDefinition ';
import OrganizationCardList from './OrganizationCardList';
import PageContainer from '@/components/layout/page-container';
import RecentActivity from './RecentActivity';
import SchemasList from './SchemasList';
import { Skeleton } from '@/components/ui/skeleton';
import { apiStatusCodes } from '@/config/CommonConstant';
import { envConfig } from '@/config/envConfig';
import { getOrganizationById } from '@/app/api/organization';
import { pathRoutes } from '@/config/pathRoutes';
import { setLedgerId } from '@/lib/orgSlice';

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

export default function Dashboard() {
  const [walletData, setWalletData] = useState<any[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPageState);
	const [informativeMessage, setInformativeMessage] = useState<string | null>('');
	const [viewButton, setViewButton] = useState<boolean>(false);
	const [ecoMessage, setEcoMessage] = useState<string | null>('');

  const orgId = useAppSelector((state) => state.organization.orgId);
  const [userOrg, setUserOrg] = useState<any>(null);

  const dispatch = useAppDispatch();

  const getAllInvitations = async () => {
		try {
		const response = await getUserInvitations(
			currentPage.pageNumber,
			currentPage.pageSize,
			'',
		);
    
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;
			const invitationList = data?.data?.invitations;
			if (invitationList.length > 0) {
				setInformativeMessage(`You have received invitations to join organization`);
				setViewButton(true);
			}
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} 
    // else {
		// 	console.error(response as string);
		// }
	} catch(err) {
		console.error('An unexpected error occurred', err);
	}
	};
  

  useEffect(() => {
		getAllInvitations();
    getAllEcosystemInvitations()
	}, []);
  
  
  const fetchOrganizationDetails = async () => {
    if (!orgId) return;
    try {
      setWalletLoading(true);
      const response = await getOrganizationById(orgId);

      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const orgAgentsList = data?.data?.org_agents;
        const userOrgRoles = data?.data?.userOrgRoles;

        if (userOrgRoles && userOrgRoles.length > 0) {
          setUserOrg(userOrgRoles[0]);
        }

        if (
          typeof response !== 'string' &&
          response?.data?.data?.org_agents[0]?.ledgers?.id
        ) {
          dispatch(
            setLedgerId(response?.data?.data?.org_agents[0]?.ledgers?.id)
          );
        }
        if (orgAgentsList && orgAgentsList.length > 0) {
          setWalletData(orgAgentsList);
        } else {
          setWalletData([]);
        }
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setWalletLoading(false);
    }
  };


  const getAllEcosystemInvitations = async () => {
		try {
		const response = await getUserEcosystemInvitations(
			currentPage.pageNumber,
			currentPage.pageSize,
			'',
      orgId
		);
    
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

        const pendingInvitations = data?.data?.invitations?.filter(
          (invitation: { status: string }) => invitation.status === 'pending'
        );        
        
			if (pendingInvitations && pendingInvitations.length > 0) {
				setEcoMessage(`You have received invitation to join ecosystem `);
				setViewButton(true);
			}
      
      const totalPages = data?.data?.totalPages;

			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
      
		} 
    // else {
		// 	console.error(response as string);
		// }
	}
	catch(err){
		console.error('An unexpected error occurred.', err);
	}
	};

  useEffect(() => {
    if (orgId) {
      fetchOrganizationDetails();
    }
  }, [orgId]);

  const handleCreateWallet = () => {
    // redirect or open wallet creation
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>

      <div className="cursor-pointer">
			  {informativeMessage && informativeMessage.length > 0 &&

					<AlertComponent
					message={informativeMessage}  
					type={informativeMessage ? 'warning' : 'failure'} 
					viewButton={viewButton}
					path={pathRoutes.users.orgInvitations}
					onAlertClose={() => {
						setInformativeMessage(''); 
					}}
					/>
			  }				
			</div>
			<div className="cursor-pointer">
			{ecoMessage && ecoMessage.length > 0 &&
        <AlertComponent
            message={ecoMessage} 
            type={ecoMessage ? 'warning' : 'failure'}  
            viewButton={viewButton}
            path={`${envConfig.PUBLIC_ECOSYSTEM_FRONT_END_URL}${pathRoutes.users.dashboard}`}
            onAlertClose={() => {
                setEcoMessage('');
            }}
        />
      }
    
			</div>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        {walletLoading ? (
          <div className='bg-muted relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-md p-6 shadow-sm'>
            <Skeleton className='mb-2 h-6 w-2/3' />
            <Skeleton className='mb-4 h-4 w-1/2' />
            <Skeleton className='h-10 w-[180px]' />
          </div>
        ) : (
          walletData.length === 0 && (
            <div className="relative flex min-h-[150px] flex-col justify-center overflow-hidden rounded-md bg-[url('/images/bg-lightwallet.png')] bg-cover bg-center bg-no-repeat p-6 shadow-sm dark:bg-[url('/images/bg-darkwallet.png')] dark:bg-cover">
              <div className='flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center'>
                <div className='flex flex-col items-start'>
                  <h3 className='text-xl font-semibold'>
                    Wallet lets you create schemas and credential definitions
                  </h3>
                  <p className='mt-2 text-sm'>
                    Please create wallet for your organization which would help
                    you to issue and verify credentials for your users.
                  </p>
                </div>
                <Button onClick={handleCreateWallet} className='min-w-[180px]'>
                  Create Wallet
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    className='ml-2'
                  >
                    <path
                      d='M9.99984 6L8.58984 7.41L13.1698 12L8.58984 16.59L9.99984 18L15.9998 12L9.99984 6Z'
                      fill='currentColor'
                    />
                  </svg>
                </Button>
              </div>
            </div>
          )
        )}

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <OrganizationCardList userOrg={userOrg} walletData={walletData} />
        <SchemasList />
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <CredentialDefinition />
          <RecentActivity />
        </div>
      </div>
    </PageContainer>
  );
}
