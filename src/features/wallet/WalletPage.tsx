'use client'

import React, { useEffect, useState } from 'react'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import DIDList from './DidListComponent'
import { IOrganisation } from '@/features/organization/components/interfaces/organization'
import Loader from '@/components/Loader'
import OrganizationDetails from '@/features/organization/components/OrganizationDetails'
import PageContainer from '@/components/layout/page-container'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

/**
 * The organization wallet: its agent details and every DID it holds. The DID list has its own page because it grows
 * with each imported or created DID and needs the full width for long identifiers.
 */
export default function WalletPage(): React.JSX.Element {
  const router = useRouter()
  const orgId = useAppSelector((state) => state?.organization.orgId)
  const [orgData, setOrgData] = useState<IOrganisation | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [didCount, setDidCount] = useState<number | null>(null)

  useEffect(() => {
    if (!orgId) {
      setOrgData(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const fetchOrganization = async (): Promise<void> => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const response = await getOrganizationById(orgId)
        const { data } = response as AxiosResponse
        if (cancelled) {
          return
        }
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setOrgData(data?.data)
        } else {
          setOrgData(null)
          setErrorMsg('Unable to load the organization wallet.')
        }
      } catch (error) {
        console.error('Error fetching organization wallet:', error)
        if (!cancelled) {
          setOrgData(null)
          setErrorMsg('Unable to load the organization wallet.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchOrganization()
    return () => {
      cancelled = true
    }
  }, [orgId])

  const [wallet] = orgData?.org_agents ?? []

  let content: React.ReactNode = null
  if (loading) {
    content = (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    )
  } else if (!orgId) {
    content = (
      <p className="text-muted-foreground">
        Select or create an organization to see its wallet.
      </p>
    )
  } else if (errorMsg) {
    content = <p className="text-destructive">{errorMsg}</p>
  } else if (!wallet) {
    content = (
      <div className="flex flex-col items-start gap-4 rounded-md border p-6">
        <p>This organization does not have a wallet yet.</p>
        <Button onClick={() => router.push(`wallet-setup?orgId=${orgId}`)}>
          Setup Your Wallet
        </Button>
      </div>
    )
  } else if (!wallet.orgDid) {
    content = (
      <div className="flex flex-col items-start gap-4 rounded-md border p-6">
        <p>
          Your wallet is ready. Set up a DID to issue and verify credentials.
        </p>
        <Button onClick={() => router.push(`create-did?orgId=${orgId}`)}>
          Setup Your DID
        </Button>
      </div>
    )
  } else {
    content = (
      <div className="space-y-6">
        <div className="rounded-md border p-4">
          <OrganizationDetails orgData={orgData} />
        </div>
        <section className="space-y-4 rounded-md border p-4">
          <h2 className="text-2xl font-bold">
            DIDs
            {didCount !== null && (
              <span className="text-muted-foreground ml-2 text-base font-normal">
                ({didCount})
              </span>
            )}
          </h2>
          <DIDList orgId={orgId} onDidCountChange={setDidCount} />
        </section>
      </div>
    )
  }

  return (
    <PageContainer fitWidth>
      <div className="flex flex-1 flex-col">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Wallet</h1>
        {content}
      </div>
    </PageContainer>
  )
}
