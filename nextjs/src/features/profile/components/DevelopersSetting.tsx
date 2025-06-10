'use client'

import { createCredentials, getCredentials } from '@/app/api/DeveloperSetting'
import { useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { ClientSecretKeySvg } from '@/config/svgs/ClientSecretKeySvg'
import CopyDid from '@/config/CopyDid'
import Loader from '@/components/Loader'
import { Roles } from '@/common/enums'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { getUserProfile } from '@/app/api/Auth'
import { useAppSelector } from '@/lib/hooks'

const ClientCredentials = (): React.JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true)
  const [clientId, setClientId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [hideCopy, setHideCopy] = useState<boolean>(true)
  const [buttonDisplay, setButtonDisplay] = useState<boolean>(true)
  const [regenerate, setRegenerate] = useState<boolean>(false)

  const [hasOrganizations, setHasOrganizations] = useState<boolean>(false)
  const token = useAppSelector((state) => state.auth.token)
  const orgId = useAppSelector((state) => state.organization.orgId)
  const [userRoles, setUserRoles] = useState<string[]>([])

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
      return
    }
    setLoading(true)
    try {
      const response = await getOrganizationById(orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setUserRoles(data?.data?.userOrg)
      }
    } catch (error) {
      console.error('Failed to fetch organization details:', error)
    } finally {
      setLoading(false)
    }
  }

  const createClientCredentials = async (): Promise<void> => {
    if (!orgId) {
      return
    }
    setLoading(true)
    try {
      const response = await createCredentials(orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setButtonDisplay(false)
        setHideCopy(false)
        setClientId(data.data.clientId)
        setClientSecret(data.data.clientSecret)
        setSuccess(data.message)
        setWarning(
          "Make sure to copy your new client secret now. You won't be able to see it again.",
        )
      }
    } catch (error) {
      console.error('Error creating client credentials:', error)
      setFailure('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getClientCredentials = async (): Promise<void> => {
    if (!orgId || orgId.trim().length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await getCredentials(orgId)
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setRegenerate(Boolean(data?.data?.clientSecret))
        setHideCopy(true)
        setClientId(data?.data?.clientId)
        setClientSecret(data?.data?.clientSecret)
        setButtonDisplay(true)
      } else {
        setClientId(null)
        setClientSecret(null)
      }
    } catch (error) {
      console.error('Error fetching client credentials:', error)
      setFailure('Failed to fetch client credentials')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!orgId) {
      return
    }
    getClientCredentials()
    fetchOrganizationDetails()
  }, [orgId])

  useEffect(() => {
    const fetchUserProfile = async (): Promise<void> => {
      if (!token) {
        return
      }
      try {
        const response = await getUserProfile(token)
        if (
          typeof response !== 'string' &&
          response?.data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS
        ) {
          const userProfile = response.data.data
          const hasOrg = userProfile.userOrgRoles?.some(
            (role) => role.orgId !== null || role.organisation !== null,
          )
          if (hasOrganizations !== hasOrg) {
            setHasOrganizations(hasOrg)
          }
        }
      } catch (error) {
        console.error('Error fetching profile in DeveloperSetting:', error)
      }
    }

    fetchUserProfile()
  }, [token, hasOrganizations])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="page-container relative flex h-full flex-auto flex-col p-3 sm:p-4">
        {(success || failure) && (
          <AlertComponent
            message={success ?? failure}
            type={success ? 'success' : 'failure'}
            onAlertClose={() => {
              setSuccess(null)
              setFailure(null)
            }}
          />
        )}
        {!hasOrganizations ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                No Organization
              </div>
              <p className="text-lg text-gray-600 dark:text-white">
                Get started by creating a new Organization
              </p>
            </div>
          </div>
        ) : (
          orgId && (
            <div className="mx-auto w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <div className="px-6 py-6">
                <form action="#">
                  <div className="form-container">
                    <div className="mb-4">
                      <h1 className="text-xl font-medium text-gray-800 dark:text-white">
                        Client Id
                      </h1>
                      <div className="my-2 flex text-sm leading-normal text-gray-700 dark:text-white">
                        {clientId && (
                          <CopyDid
                            className="truncate text-base text-gray-500 dark:text-gray-400"
                            value={clientId}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="items-center justify-between py-4 sm:flex sm:space-x-2">
                        <div>
                          <h1 className="mb-3 text-xl font-medium text-gray-800 dark:text-white">
                            Client Secret
                          </h1>
                          <span className="text-gray-600 dark:text-gray-500">
                            You need a client secret to authenticate as the
                            organization to the API.
                          </span>
                        </div>

                        {Array.isArray(userRoles) &&
                          userRoles.includes(Roles.OWNER) && (
                            <div className="mt-4 shrink-0 items-center text-start sm:mt-0">
                              {buttonDisplay && (
                                <Button
                                  onClick={createClientCredentials}
                                  variant="default"
                                  className="bg-primary"
                                >
                                  {regenerate
                                    ? 'Regenerate Client Secret'
                                    : 'Generate Client Secret'}
                                </Button>
                              )}
                            </div>
                          )}
                      </div>

                      {clientId && (
                        <>
                          <hr />
                          <div className="mt-4">
                            {warning && (
                              <AlertComponent
                                message={warning}
                                type="warning"
                                onAlertClose={() => setWarning(null)}
                              />
                            )}
                          </div>

                          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-4">
                              {ClientSecretKeySvg()}

                              <div className="truncate">
                                <h1 className="ml-4 truncate text-base text-gray-500 dark:text-white">
                                  {!hideCopy ? (
                                    clientSecret && (
                                      <CopyDid
                                        className="truncate text-base text-gray-500 dark:text-white"
                                        value={clientSecret}
                                      />
                                    )
                                  ) : (
                                    <span className="truncate">
                                      {clientSecret}
                                    </span>
                                  )}
                                </h1>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default ClientCredentials
