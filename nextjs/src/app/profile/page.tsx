import PageContainer from '@/components/layout/page-container'
import React from 'react'
import UserProfile from '@/features/profile/components/UserProfile'

const page = (): React.JSX.Element => (
  <PageContainer>
    <UserProfile />
  </PageContainer>
)

export default page
