import IssuerLifecycle from '@/features/oid4vc/components/IssuerLifecycle'
import PageContainer from '@/components/layout/page-container'
import React from 'react'

const page = (): React.JSX.Element => (
  <PageContainer>
    <IssuerLifecycle />
  </PageContainer>
)

export default page
