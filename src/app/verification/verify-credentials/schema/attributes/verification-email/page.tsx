import EmailVerification from '@/features/verification/components/EmailVerification'
import PageContainer from '@/components/layout/page-container'
import React from 'react'

const page = (): React.JSX.Element => (
  <PageContainer>
    <EmailVerification />
  </PageContainer>
)
export default page
