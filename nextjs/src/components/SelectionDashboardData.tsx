'use client'

import { JSX, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { RootState } from '@/lib/store'
import SelectionDashboard from './SelectionDashboard'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { setLedgerId } from '@/lib/orgSlice'
import { usePathname } from 'next/navigation'

const SelectionDashboardData = (): JSX.Element => {
  const path = usePathname()

  const dispatch = useDispatch()
  const isVerification = path.includes('/verification')
  const orgId = useSelector((state: RootState) => state.organization.orgId)
  const orgData = async (): Promise<void> => {
    const response = await getOrganizationById(orgId)
    if (typeof response === 'string') {
      console.error('Error fetching organization:', response)
    } else {
      const { data } = response
      dispatch(setLedgerId(data.data.org_agents[0].ledgers.id))
    }
  }
  useEffect(() => {
    orgData()
  }, [])

  const issueOptions = [
    {
      heading: 'Connection',
      description:
        'Issue credential(s) by selecting connection from existing users',
      path: '/credentials/connections',
    },
    {
      heading: 'Email',
      description: 'Issue credential(s) by entering email ID for specific user',
      path: pathRoutes.organizations.Issuance.email,
    },
    {
      heading: 'Bulk',
      description: 'Issue credential(s) by uploading .csv file records',
      path: pathRoutes.organizations.Issuance.bulkIssuance,
    },
  ]

  const verifyOptions = [
    {
      heading: 'Connection',
      description: 'Verify credential(s) by selecting existing connections',
      path: pathRoutes.organizations.verification.schema,
    },
    {
      heading: 'Email',
      description:
        'Verify credential(s) by entering email ID for specific user',
      path: pathRoutes.organizations.verification.email,
    },
    {
      heading: 'Bulk',
      description:
        'Verify credential(s) in bulk by uploading .csv file records',
      path: '',
    },
  ]
  return (
    <SelectionDashboard
      title={isVerification ? 'Verify Credential' : 'Issue Credential'}
      options={isVerification ? verifyOptions : issueOptions}
      backButtonPath={
        isVerification
          ? pathRoutes.organizations.credentials
          : pathRoutes.back.credentials.credentials
      }
    />
  )
}

export default SelectionDashboardData
