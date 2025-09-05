// import { apiStatusCodes, storageKeys } from '../config/CommonConstant.ts';
import { JSX, useEffect, useState } from 'react'

import type { AxiosResponse } from 'axios'
import Loader from './Loader'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getAgentHealth } from '@/app/api/Agent'
import { useAppSelector } from '@/lib/hooks'

// import CustomSpinner from '../components/CustomSpinner';
// import { getAgentHealth } from '../api/Agent.ts';
// import { getFromLocalStorage } from '../api/Auth.ts';

interface Agent {
  label: string
  endpoints: string[]
  isInitialized: boolean
}

const AgentHealth = (): JSX.Element => {
  const [agentHealthDetails, setAgentHealthDetails] = useState<Agent | null>()
  const [loader, setLoader] = useState<boolean>(true)
  const orgId = useAppSelector((state) => state.organization.orgId)

  const getAgentHealthDetails = async (): Promise<void> => {
    try {
      const organizationId = orgId
      if (organizationId) {
        const agentData = await getAgentHealth(organizationId)
        const { data } = agentData as AxiosResponse
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          setAgentHealthDetails(data?.data)
          setLoader(false)
        } else {
          setLoader(false)
          setAgentHealthDetails(null)
        }
      } else {
        console.error('Organization not created yet')
        setLoader(false)
      }
    } catch (error) {
      setLoader(false)
      console.error('An error occurred:', error)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      getAgentHealthDetails()
    }, 4000)
  }, [])

  useEffect(() => {
    getAgentHealthDetails()
  }, [orgId])
  return (
    <div className="">
      <div>
        {loader ? (
          <div>
            <Loader />
          </div>
        ) : (
          orgId &&
          (agentHealthDetails?.isInitialized ? (
            <div className="flex w-fit shrink-0 items-center rounded-full bg-green-100 px-2 py-2 text-xs font-medium text-green-800 md:py-1 dark:bg-green-900 dark:text-green-300">
              <div className="h-1 w-1 shrink-0 rounded-full bg-green-500 p-1 md:mr-1" />
              <span className="mr-1 hidden w-fit shrink-0 rounded-full md:block dark:bg-green-900 dark:text-green-300">
                Wallet Agent is up and running
              </span>
            </div>
          ) : (
            <div className="flex w-fit shrink-0 items-center rounded-full bg-red-100 p-2 text-xs font-medium text-red-800 md:p-1 dark:bg-red-900 dark:text-red-300">
              <div className="h-1 w-1 shrink-0 rounded-full bg-red-500 p-1 md:mr-1" />
              <span className="mr-1 hidden w-fit shrink-0 rounded-full text-red-800 md:block dark:bg-red-900 dark:text-red-300">
                Wallet Agent is not running
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AgentHealth
