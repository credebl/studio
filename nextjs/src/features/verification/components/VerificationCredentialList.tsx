/* eslint-disable max-lines */
'use client'

import { ChangeEvent, JSX, useEffect, useState } from 'react'
import {
  ProofRequestState,
  ProofRequestStateUserText,
} from '@/features/common/enum'
import {
  getVerificationList,
  getVerifiedProofDetails,
  verifyPresentation,
} from '@/app/api/verification'

import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import DateTooltip from '@/components/DateTooltip'
import { EmptyMessage } from '@/components/EmptyMessage'
import { Features } from '@/common/enums'
import { IConnectionListAPIParameter } from '@/app/api/connection'
import { ITableData } from '../../connections/types/connections-interface'
import PageContainer from '@/components/layout/page-container'
import ProofRequest from './ProofRequestPopup'
import { RequestProof } from '../type/interface'
import RoleViewButton from '@/components/RoleViewButton'
import SortDataTable from './SortDataTable'
import { apiStatusCodes } from '@/config/CommonConstant'
import { dateConversion } from '@/utils/DateConversion'
import { getOrganizationById } from '@/app/api/organization'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

const initialPageState = {
  itemPerPage: 10,
  page: 1,
  search: '',
  sortBy: 'createDateTime',
  sortingOrder: 'desc',
  allSearch: '',
}

const VerificationCredentialList = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true)
  const [verificationList, setVerificationList] = useState<ITableData[]>([])
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [requestId, setRequestId] = useState<string>('')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [proofReqSuccess, setProofReqSuccess] = useState<string>('')
  const [userData, setUserData] = useState(null)
  const [view, setView] = useState(false)
  const [listAPIParameter, setListAPIParameter] =
    useState<IConnectionListAPIParameter>(initialPageState)
  const [totalItem, setTotalItem] = useState(0)
  const [verifyLoading, setVerifyLoading] = useState(true)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [pageInfo, setPageInfo] = useState({
    totalItem: '',
    nextPage: '',
    lastPage: '',
  })
  const [isWalletCreated, setIsWalletCreated] = useState(false)
  const [searchText, setSearchText] = useState('')
  const route = useRouter()

  const orgId = useAppSelector((state) => state.organization.orgId)

  const orgRoles = useAppSelector((state) => state.organization.orgRoles)
  const getProofPresentationData = async (proofId: string): Promise<void> => {
    setVerifyLoading(true)

    try {
      const response = await getVerifiedProofDetails(proofId, orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes?.API_STATUS_SUCCESS) {
        setUserData(data?.data)
      } else {
        setErrMsg(response as string)
      }
    } catch (error) {
      setErrMsg('An error occurred while fetching proof details')
      console.error('Error fetching proof details:', error)
    } finally {
      setVerifyLoading(false)
    }
  }

  const fetchOrganizationDetails = async (): Promise<void> => {
    if (!orgId) {
      return
    }
    setLoading(true)
    const response = await getOrganizationById(orgId)
    const { data } = response as AxiosResponse
    setLoading(false)
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      if (
        data?.data?.org_agents?.length > 0 &&
        data?.data?.org_agents[0]?.orgDid
      ) {
        setIsWalletCreated(true)
      }
    } else {
      setErrMsg(response as string)
    }
    setLoading(false)
  }

  const getUserRoles = async (): Promise<void> => {
    const roles = orgRoles
    setUserRoles(roles)
  }

  const searchInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(e.target.value)
    setListAPIParameter({
      ...listAPIParameter,
      search: e.target.value,
      page: 1,
    })
  }

  const openProofRequestModel = (
    flag: boolean,
    requestId: string,
    state: string,
  ): void => {
    setRequestId(requestId)
    setOpenModal(flag)
    setView(state === 'done')
  }
  const getproofRequestList = async (
    orgId: string,
    apiParameter: IConnectionListAPIParameter,
  ): Promise<void> => {
    setLoading(true)
    try {
      if (orgId && isWalletCreated) {
        const response = await getVerificationList(orgId, apiParameter)

        const { data } = response as AxiosResponse
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          const { totalItems, nextPage, lastPage } = data.data
          setPageInfo({
            totalItem: totalItems,
            nextPage,
            lastPage,
          })
          setTotalItem(data?.data.totalItems)
          const credentialList = data?.data?.data?.map(
            (requestProof: RequestProof) => ({
              data: [
                {
                  data: requestProof?.presentationId
                    ? requestProof?.presentationId
                    : 'Not available',
                },
                {
                  data: requestProof?.connectionId
                    ? requestProof?.connectionId
                    : 'Not available',
                },
                {
                  data: (
                    <DateTooltip date={requestProof.createDateTime}>
                      <div> {dateConversion(requestProof.createDateTime)} </div>
                    </DateTooltip>
                  ),
                },
                {
                  data: (
                    <span
                      className={`${
                        requestProof?.state === ProofRequestState.requestSent &&
                        'text-done border'
                      } ${
                        requestProof?.state === ProofRequestState.done &&
                        'text-success border'
                      } ${
                        requestProof?.state === ProofRequestState.abandoned &&
                        'text-destructive border'
                      } ${
                        requestProof?.state ===
                          ProofRequestState.presentationReceived &&
                        'bg-secondary text-primary border-secondary dark:border-secondary dark:text-secondary border'
                      } flex justify-center rounded-md py-0.5 text-xs font-medium min-[320]:w-full min-[320]:px-1 sm:mr-0 sm:px-0 md:mr-2 lg:px-0.5 2xl:w-8/12`}
                    >
                      {requestProof?.state === ProofRequestState.requestSent
                        ? ProofRequestStateUserText.requestSent
                        : requestProof?.state ===
                            ProofRequestState.presentationReceived
                          ? ProofRequestStateUserText.requestReceived
                          : requestProof?.state === ProofRequestState.done
                            ? ProofRequestStateUserText.done
                            : requestProof?.state ===
                                ProofRequestState.abandoned
                              ? ProofRequestStateUserText.abandoned
                              : ''}
                    </span>
                  ),
                },
                {
                  data: (
                    <Button
                      disabled={
                        requestProof.state !==
                          ProofRequestState.presentationReceived &&
                        requestProof?.state !== 'done'
                      }
                      className="flex h-10 min-w-[4rem] items-center justify-center"
                      onClick={() => {
                        openProofRequestModel(
                          true,
                          requestProof?.presentationId,
                          requestProof?.state,
                        )
                        getProofPresentationData(requestProof?.presentationId)
                      }}
                    >
                      {requestProof?.state === 'done' ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="mr-1 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 15"
                          >
                            <path
                              fill="currentColor"
                              d="M23.385 7.042C23.175 6.755 18.165 0 11.767 0 5.37 0 .36 6.755.15 7.042a.777.777 0 0 0 0 .916C.36 8.245 5.37 15 11.767 15c6.398 0 11.408-6.755 11.618-7.042.2-.273.2-.643 0-.916Zm-11.618 6.406c-4.713 0-8.795-4.483-10.003-5.949 1.207-1.466 5.28-5.947 10.003-5.947 4.713 0 8.794 4.482 10.003 5.949-1.207 1.466-5.28 5.947-10.003 5.947Z"
                            />
                            <path
                              fill="currentColor"
                              d="M11.772 2.84a4.66 4.66 0 0 0-4.655 4.655 4.66 4.66 0 0 0 4.655 4.655 4.66 4.66 0 0 0 4.656-4.655 4.66 4.66 0 0 0-4.656-4.655Zm0 7.758A3.107 3.107 0 0 1 8.67 7.495a3.107 3.107 0 0 1 3.103-3.103 3.107 3.107 0 0 1 3.104 3.103 3.107 3.107 0 0 1-3.104 3.103Z"
                            />
                          </svg>
                          <span>View</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg
                            className="mr-1 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 15"
                          >
                            <path
                              fill="currentColor"
                              d="M15.749 6.99c-.334-.21-.813-.503-.813-.697.01-.397.113-.786.3-1.136.277-.69.561-1.395.204-1.915-.358-.519-1.122-.462-1.853-.405-.358.082-.73.082-1.089 0a2.74 2.74 0 0 1-.374-1.087c-.162-.739-.333-1.501-.942-1.704-.61-.203-1.154.3-1.699.811-.309.276-.723.65-.934.65-.212 0-.634-.374-.943-.65C7.07.362 6.51-.14 5.908.046c-.602.187-.805.933-.967 1.671-.05.383-.18.75-.382 1.08a2.295 2.295 0 0 1-1.09 0c-.722-.066-1.478-.13-1.844.405-.365.535-.081 1.225.195 1.914.19.35.295.739.31 1.136-.066.195-.521.487-.854.698C.65 7.34 0 7.76 0 8.41c0 .649.65 1.07 1.276 1.468.333.211.812.495.853.69-.014.4-.12.791-.309 1.144-.276.69-.56 1.395-.195 1.914.366.52 1.122.463 1.845.398a2.441 2.441 0 0 1 1.089.04c.2.33.33.697.382 1.08.162.738.333 1.508.934 1.711a.86.86 0 0 0 .277.106 2.439 2.439 0 0 0 1.422-.812c.308-.275.731-.657.942-.657.212 0 .626.382.935.657.544.487 1.105.998 1.698.812.593-.187.813-.974.943-1.712a2.69 2.69 0 0 1 .374-1.08 2.472 2.472 0 0 1 1.089-.04c.73.065 1.479.138 1.852-.397.374-.536.073-1.225-.203-1.915a2.585 2.585 0 0 1-.3-1.144c.056-.194.511-.478.812-.69C16.35 9.587 17 9.174 17 8.517c0-.658-.618-1.136-1.251-1.526Zm-.431 2.248c-.537.332-1.04.649-1.195 1.135a2.73 2.73 0 0 0 .325 1.68c.155.373.399.99.293 1.151-.106.163-.731.09-1.113.057a2.393 2.393 0 0 0-1.626.203 2.594 2.594 0 0 0-.682 1.55c-.082.365-.236 1.054-.406 1.111-.171.057-.667-.422-.894-.625a2.585 2.585 0 0 0-1.48-.868c-.58.11-1.105.417-1.486.868-.22.203-.756.674-.894.625-.138-.049-.325-.746-.407-1.111a2.594 2.594 0 0 0-.674-1.55 1.522 1.522 0 0 0-.95-.243 7.016 7.016 0 0 0-.708.04c-.374 0-1.008.09-1.105-.056-.098-.146.097-.78.26-1.112.285-.51.4-1.1.325-1.68-.146-.486-.65-.81-1.186-1.135-.358-.227-.902-.568-.902-.811 0-.244.544-.552.902-.811.536-.333 1.04-.658 1.186-1.136a2.754 2.754 0 0 0-.325-1.688c-.163-.348-.398-.973-.284-1.127.113-.154.73-.09 1.105-.057.549.122 1.123.05 1.625-.203.392-.427.629-.972.674-1.55.082-.364.236-1.054.407-1.11.17-.058.674.421.894.624.381.45.907.753 1.487.86a2.569 2.569 0 0 0 1.479-.86c.227-.203.756-.673.894-.625.138.049.325.747.406 1.112.048.578.288 1.123.682 1.55a2.397 2.397 0 0 0 1.626.202c.382 0 1.007-.09 1.113.057.106.146-.138.811-.292 1.144a2.755 2.755 0 0 0-.326 1.687c.155.479.659.811 1.195 1.136.357.227.902.568.902.811 0 .243-.488.527-.845.755Z"
                            />
                            <path
                              fill="currentColor"
                              d="m11.253 6.126-3.78 3.943-1.687-1.403a.473.473 0 0 0-.149-.08.556.556 0 0 0-.352 0 .473.473 0 0 0-.148.08.377.377 0 0 0-.101.12.306.306 0 0 0 0 .284.377.377 0 0 0 .101.12l2.002 1.7a.459.459 0 0 0 .152.083.548.548 0 0 0 .181.027.601.601 0 0 0 .19-.043.499.499 0 0 0 .153-.097l4.105-4.284a.312.312 0 0 0 .074-.265.365.365 0 0 0-.174-.234.55.55 0 0 0-.632.049h.065Z"
                            />
                          </svg>
                          <span>Verify</span>
                        </span>
                      )}
                    </Button>
                  ),
                },
              ],
            }),
          )

          setVerificationList(credentialList)
          setErrMsg(null)
        } else {
          setVerificationList([])
        }
      }
    } catch (error) {
      setVerificationList([])
      setErrMsg('An error occurred while fetching the proof request list')
    }

    setLoading(false)
  }

  useEffect(() => {
    if (isWalletCreated && orgId) {
      getproofRequestList(orgId, listAPIParameter)
    }
  }, [isWalletCreated, orgId, listAPIParameter])
  const presentProofById = async (id: string): Promise<void> => {
    try {
      const response = await verifyPresentation(id, orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes?.API_STATUS_CREATED) {
        setOpenModal(false)
        setProofReqSuccess(data.message)
        setVerifyLoading(false)
        setTimeout(() => {
          getproofRequestList(orgId, listAPIParameter)
        }, 2000)
      } else {
        setOpenModal(false)
        setErrMsg(response as string)
        setVerifyLoading(false)
      }
      setTimeout(() => {
        setProofReqSuccess('')
        setErrMsg('')
      }, 4000)
    } catch (error) {
      setOpenModal(false)
      setVerifyLoading(false)
      console.error('An error occurred:', error)
      setErrMsg('An error occurred while processing the presentation.')
    }
  }

  const requestProof = async (proofVericationId: string): Promise<void> => {
    if (proofVericationId) {
      setOpenModal(false)
      presentProofById(proofVericationId)
    }
  }

  const searchSortByValue = (value: string): void => {
    setListAPIParameter({
      ...listAPIParameter,
      page: 1,
      sortingOrder: value,
    })
  }

  useEffect(() => {
    let getData: NodeJS.Timeout | null = null

    if (listAPIParameter?.search?.length >= 1) {
      getData = setTimeout(() => {
        getproofRequestList(orgId, listAPIParameter)
      }, 1000)
      return (): void => clearTimeout(getData!)
    } else {
      getproofRequestList(orgId, listAPIParameter)
    }
    return (): void => clearTimeout(getData!)
  }, [listAPIParameter])

  const schemeSelection = (): void => {
    route.push('/organizations/verification/verify-credentials')
  }

  const refreshPage = (): void => {
    getproofRequestList(orgId, listAPIParameter)
  }

  useEffect(() => {
    getUserRoles()
    fetchOrganizationDetails()
  }, [verificationList, orgId])

  const header = [
    { columnName: 'Request Id' },
    { columnName: 'Connection Id' },
    { columnName: 'Requested On' },
    { columnName: 'Status' },
    { columnName: 'Action' },
  ]

  return (
    <PageContainer>
      <div className="px-4 pt-2">
        <div className="mb-4 flex flex-wrap justify-between gap-4">
          <h1 className="ml-1 text-xl font-semibold">Verification List</h1>
          <div className="text-sm font-medium shadow">
            {isWalletCreated && (
              <RoleViewButton
                buttonTitle="Request"
                feature={Features.VERIFICATION}
                svgComponent={
                  <svg
                    className="mt-1 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 25 25"
                  >
                    <path
                      fill="#000"
                      d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z"
                    />
                  </svg>
                }
                onClickEvent={schemeSelection}
              />
            )}
          </div>
        </div>
        <div>
          <div className="rounded-sm border shadow-sm 2xl:col-span-2">
            {(proofReqSuccess || errMsg) && (
              <div className="p-2">
                <div
                  className={`flex items-start gap-2 rounded-md border px-4 py-3 ${
                    proofReqSuccess
                      ? 'bg-success text-success border-success'
                      : 'bg-error text-error border-error'
                  }`}
                >
                  <div className="flex-1 text-sm">
                    {proofReqSuccess || errMsg}
                  </div>
                  <button
                    onClick={() => {
                      setProofReqSuccess('')
                      setErrMsg(null)
                    }}
                    className="text-lg font-semibold focus:outline-none"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {!isWalletCreated && !loading ? (
              <div className="flex items-center justify-center">
                <EmptyMessage
                  title="No Wallet Details Found"
                  description={'The owner is required to create a wallet'}
                  buttonContent={''}
                />
              </div>
            ) : (
              <div>
                {verificationList && (
                  <div
                    className="Flex-wrap"
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <SortDataTable
                      pageInfo={pageInfo}
                      searchValue={searchText}
                      searchSortByValue={searchSortByValue}
                      isHeader={true}
                      isSearch={true}
                      isRefresh={true}
                      isSort={true}
                      isPagination={true}
                      message={'No Verification Records'}
                      discription={'You have no verification record yet'}
                      onInputChange={searchInputChange}
                      refresh={refreshPage}
                      header={header}
                      data={verificationList}
                      loading={loading}
                      currentPage={listAPIParameter?.page}
                      onPageChange={(page: number) => {
                        setListAPIParameter((prevState) => ({
                          ...prevState,
                          page,
                        }))
                      }}
                      totalPages={Math.ceil(
                        totalItem / listAPIParameter?.itemPerPage,
                      )}
                    ></SortDataTable>
                  </div>
                )}
              </div>
            )}

            {userData && (
              <ProofRequest
                openModal={openModal}
                closeModal={() => {
                  openProofRequestModel(false, '', '')
                }}
                onSucess={requestProof}
                requestId={requestId}
                userData={userData}
                view={view}
                verifyLoading={verifyLoading}
                userRoles={userRoles}
              />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default VerificationCredentialList
