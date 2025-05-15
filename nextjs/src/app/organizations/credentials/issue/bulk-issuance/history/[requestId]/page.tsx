import HistoryDetails from '@/features/organization/bulkIssuance/components/HistoryDetail'
import React from 'react'

type Params = Promise<{ requestId: string }>

export default async function Page({
  params,
}: {
  params: Params
}): Promise<React.JSX.Element> {
  const { requestId } = await params
  return (
    
      <HistoryDetails {...{requestId}} /> 
    
  )
}
