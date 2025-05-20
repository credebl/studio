'use client'

import { JSX, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Dashboard from './Dashboard'
import { RootState } from '@/lib/store'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { setLedgerId } from '@/lib/orgSlice'

const IssueDashboard = (): JSX.Element => {
  const dispatch = useDispatch()
  const orgId = useSelector((state: RootState) => state.organization.orgId)
  const orgData = async (): Promise<void> => {
    const response = await getOrganizationById(orgId)
    if (typeof response === 'string') {
      // handle the error message
      console.error('Error fetching organization:', response)
    } else {
      const { data } = response
      dispatch(setLedgerId(data.data.org_agents[0].ledgers.id))
    }
  }
  useEffect(() => {
    orgData()
  }, [])

  const options = [
    {
      heading: 'Connection',
      description:
        'Issue credential(s) by selecting connection from existing users',
      path: '/organizations/credentials/connections',
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

  return (
    <Dashboard
      title="Issue Credential"
      options={options}
      backButtonPath={pathRoutes.organizations.issuedCredentials}
    />
  )
}

export default IssueDashboard
