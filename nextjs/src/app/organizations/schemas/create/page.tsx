import CreateSchema from '@/features/schemas/components/Create'
import PageContainer from '@/components/layout/page-container'
import React from 'react'

const page = (): React.JSX.Element => (
  <div>
    <PageContainer>
      <CreateSchema />
    </PageContainer>
  </div>
)

export default page
