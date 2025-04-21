import PageContainer from '@/components/layout/page-container';
import OrganizationCardList from './OrganizationCardList';
import SchemasList from './SchemasList';
import RecentActivity from './RecentActivity';
import CredentialDefinition from './CredentialDefinition ';

export default function OverViewPage() {
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

    // <PageContainer>
    //   <div className='flex flex-1 flex-col space-y-2'>
    //     <div className='flex items-center justify-between space-y-2'>
    //       <h2 className='text-2xl font-bold tracking-tight'>
    //         Hi, Welcome back 👋
    //       </h2>
    //     </div>
    //     <div className='mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
    //       <StatsData />
    //     </div>

    //     <div className='mb-8 grid gap-6 md:grid-cols-1 lg:grid-cols-2'>
    //       <OrganizationsChart />
    //       <OrganizationCardList />
    //     </div>

    //     <div className='mb-8 grid gap-6 md:grid-cols-1 lg:grid-cols-2'>
    //       <SchemasList />
    //       <CredentialDefinition />
    //     </div>

    //     <div className='mb-8 grid gap-6 md:grid-cols-1 lg:grid-cols-1'>
    //       <RecentActivity />
    //     </div>
    //   </div>
    // </PageContainer>
  );
}
