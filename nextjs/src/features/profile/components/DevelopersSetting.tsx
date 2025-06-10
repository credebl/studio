'use client'

import { createCredentials, getCredentials } from '@/app/api/DeveloperSetting'
import { useEffect, useState } from 'react'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
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

  const [userRoles, setUserRoles] = useState<string[]>([])

  const orgId = useAppSelector((state) => state.organization.orgId)

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
      return
    }

    setLoading(true)
    try {
      const response = await getOrganizationById(orgId as string)
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

          setHasOrganizations(hasOrg)
        }
      } catch (error) {
        console.error('Error fetching profile in DeveloperSetting:', error)
      }
    }

    fetchUserProfile()
  }, [token])
  return (
    <div className="h-full">
      <div className="page-container relative flex h-full flex-auto flex-col p-3 sm:p-4">
        <div className="col-span-full mb-4 xl:mb-2"></div>

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

        <div className="mx-auto w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="px-6 py-6">
            {hasOrganizations && orgId ? (
              <>
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

                        {userRoles.includes(Roles.OWNER) && (
                          <div className="mt-4 shrink-0 items-center text-start sm:mt-0">
                            {buttonDisplay && (
                              <Button
                                onClick={createClientCredentials}
                                variant="default"
                                className={'bg-primary'}
                              >
                                {loading && <Loader />}
                                {regenerate
                                  ? 'Regenerate Client Secret'
                                  : 'Generate Client Secret'}{' '}
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="36"
                                height="35"
                                viewBox="0 0 36 35"
                                fill="none"
                              >
                                <path
                                  d="M20.8 9.36588C21.5543 8.62592 22.4686 8.25594 23.5429 8.25594C24.6171 8.25594 25.5314 8.62592 26.2857 9.36588C27.04 10.1058 27.4171 11.0028 27.4171 12.0566C27.4171 13.1105 27.04 14.0074 26.2857 14.7474C25.5314 15.4874 24.6171 15.8573 23.5429 15.8573C22.4686 15.8573 21.5543 15.4874 20.8 14.7474C20.0457 14.0074 19.6686 13.1105 19.6686 12.0566C19.6686 11.0028 20.0457 10.1058 20.8 9.36588ZM15.3143 3.98436C17.6 1.74207 20.3429 0.620915 23.5429 0.620915C26.7429 0.620916 29.4857 1.74206 31.7714 3.98436C34.0571 6.22666 35.2 8.91742 35.2 12.0566C35.2 15.1959 34.0571 17.8866 31.7714 20.1289C30.24 21.6313 28.4743 22.6235 26.4743 23.1056C24.4743 23.5877 22.4914 23.5821 20.5257 23.0888L8.45714 34.9281H0.228573L0.228572 22.8197L5.02857 22.147L5.71429 17.4382L10.6857 16.5973L12.2971 15.0165C11.7943 13.0881 11.7886 11.1429 12.28 9.18089C12.7714 7.21888 13.7829 5.48671 15.3143 3.98436ZM18.0571 6.67512C16.7771 7.93081 16.04 9.41633 15.8457 11.1317C15.6514 12.8471 15.9886 14.4447 16.8571 15.9246L12.5714 20.1289L9.17714 20.7007L8.45714 25.5104L4.13714 26.0486L4.13715 31.0938H6.88L19.6 18.6154C21.1086 19.4674 22.7371 19.7982 24.4857 19.6076C26.2343 19.417 27.7486 18.6938 29.0286 17.4382C30.5371 15.9582 31.2914 14.1644 31.2914 12.0566C31.2914 9.94888 30.5371 8.15504 29.0286 6.67512C27.52 5.19521 25.6914 4.45525 23.5429 4.45525C21.3943 4.45525 19.5657 5.19521 18.0571 6.67512Z"
                                  fill="#3A3A3A"
                                />
                              </svg>
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
              </>
            ) : !loading && !hasOrganizations ? (
              <div className="text-center">
                <div className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  No Organization
                </div>
                <p className="text-lg text-gray-600 dark:text-white">
                  Get started by creating a new Organization
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Loader />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientCredentials
