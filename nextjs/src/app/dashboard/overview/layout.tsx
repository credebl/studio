import PageContainer from '@/components/layout/page-container';
import React from 'react';
import OrganizationCardList from './OrganizationCardList';
import SchemasList from './SchemasList';
import RecentActivity from './RecentActivity';
import CredentialDefinition from './CredentialDefinition ';

export default function OverViewLayout() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-[50%_50%]'>
          <OrganizationCardList />
          <SchemasList />
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-[50%_50%]'>
          <CredentialDefinition />
          <RecentActivity />
        </div>
      </div>
    </PageContainer>
  );
}
