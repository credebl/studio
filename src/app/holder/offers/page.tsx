import HolderOfferRedemption from './components/HolderOfferRedemption'
import PageContainer from '@/components/layout/page-container'
import React from 'react'

const HolderOffersPage = (): React.JSX.Element => (
  <PageContainer>
    <div className="flex w-full flex-col gap-2">
      <h1 className="text-2xl font-semibold">Holder offers</h1>
      <p className="text-muted-foreground text-sm">
        Resolve an OID4VC offer and decide how its credential is bound.
      </p>
    </div>
    <HolderOfferRedemption />
  </PageContainer>
)

export default HolderOffersPage
