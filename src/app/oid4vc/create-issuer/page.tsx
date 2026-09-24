import CreateIssuer from '@/features/oid4vc/components/CreateIssuer'
import PageContainer from '@/components/layout/page-container'
import React from 'react'

const page = (): React.JSX.Element => (
  <PageContainer>
    <CreateIssuer />
  </PageContainer>
)

export default page
