'use client';

import { Card, Pagination } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';

import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomAvatar from '../Avatar'
import { Features } from '../../utils/enums/features';
import RoleViewButton from '../RoleViewButton';
import SearchInput from '../SearchInput';
import { pathRoutes } from '../../config/pathRoutes';
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { EmptyListMessage } from '../EmptyListComponent';
import CustomSpinner from '../CustomSpinner';
import CreateEcosystemOrgModal from '../CreateEcosystemOrgModal';
import { getEcosystems } from '../../api/ecosystem';
import type { IEcosystem } from './interfaces';
import { checkEcosystem, type ICheckEcosystem } from '../../config/ecosystem';

const initialPageState = {
  pageNumber: 1,
  pageSize: 9,
  total: 100,
};

const EcosystemList = () => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(initialPageState);
  const onPageChange = (page: number) => {
    setCurrentPage({
      ...currentPage,
      pageNumber: page
    })
  };
  const [searchText, setSearchText] = useState("");

  const [ecosystemList, setEcosystemList] = useState<Array<IEcosystem> | null>(null)
  const [isEcosystemData, setIsEcosystemData] = useState<ICheckEcosystem>()

  const createOrganizationModel = () => {
    setOpenModal(true)
  }

  const fetchEcosystems = async () => {
    setLoading(true);
    const id = await getFromLocalStorage(storageKeys.ORG_ID);
    // setOrgId(id);
    if (id) {
      const response = await getEcosystems(id, currentPage.pageNumber, currentPage.pageSize, searchText);
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const ecosystemData = data?.data;
        if (ecosystemData) {
          console.log(6565, data)
          setEcosystemList(ecosystemData)
        } else {
          await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID);
          setError(response as string)
        }
      } else {
        await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID);
        setError(response as string)
      }
    }
    setLoading(false);
  };

  //This useEffect is called when the searchText changes 
  useEffect(() => {
    let getData: NodeJS.Timeout

    if (searchText.length >= 1) {
      getData = setTimeout(() => {
        fetchEcosystems()
      }, 1000)
    } else {
      fetchEcosystems()
    }

    return () => clearTimeout(getData)
  }, [searchText, openModal, currentPage.pageNumber])

  useEffect(() => {
    const queryParameters = new URLSearchParams(window?.location?.search)
    const isModel = queryParameters.get("orgModal") || ''

    if (isModel !== '') {
      setOpenModal(true)
    }

    const checkEcosystemData = async () => {
      const data: ICheckEcosystem = await checkEcosystem();
      setIsEcosystemData(data)
    }
    checkEcosystemData();
  }, [])

  //onCHnage of Search input text
  const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }

  const redirectOrgDashboard = async (ecosystemId: string, ecosystemRole: string) => {
    await setToLocalStorage(storageKeys.ECOSYSTEM_ID, ecosystemId);
    await setToLocalStorage(storageKeys.ECOSYSTEM_ROLE, ecosystemRole);
    window.location.href = pathRoutes.ecosystem.dashboard
  }

  const isEcosystemList = Boolean(ecosystemList && ecosystemList?.length > 0)
  const showCreateButton = Boolean(isEcosystemList && (isEcosystemData?.isMultiEcosystem || isEcosystemData?.isEcosystemLead))
  console.log(6534, isEcosystemData, showCreateButton, isEcosystemList, isEcosystemData?.isMultiEcosystem, isEcosystemData?.isEcosystemLead, (isEcosystemList && isEcosystemData?.isMultiEcosystem) || isEcosystemData?.isEcosystemLead)
  return (
    <div className="px-4 pt-6">
      <div className="pl-6 mb-4 col-span-full xl:mb-2">

        <BreadCrumbs />
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Ecosystems
        </h1>
      </div>
      <div>
        <div
          className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800 min-h-100/18rem flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <SearchInput
              onInputChange={searchInputChange}
            />
            {
              showCreateButton &&
              <RoleViewButton
                buttonTitle='Create'
                feature={Features.CRETAE_ORG}
                svgComponent={
                  <div className='pr-3'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
                      <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                    </svg>
                  </div>
                }
                onClickEvent={createOrganizationModel}
              />
            }
          </div>

          <AlertComponent
            message={message ?? error}
            type={message ? 'success' : 'failure'}
            onAlertClose={() => {
              setMessage(null)
              setError(null)
            }}
          />

          {loading
            ? <div className="flex items-center justify-center mb-4">
              <CustomSpinner />
            </div>
            : isEcosystemList ? (<div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
              {
                isEcosystemList && ecosystemList && ecosystemList.map((item) => {
                  const role = item?.ecosystemOrgs && item?.ecosystemOrgs.length > 0 && item?.ecosystemOrgs[0]?.ecosystemRole?.name || ""
                  return (
                    <Card key={item.id} onClick={() => redirectOrgDashboard(item.id, role)} className='transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer overflow-hidden overflow-ellipsis' style={{ maxHeight: '100%', maxWidth: '100%', overflow: 'auto' }}>
                      <div className='flex items-center'>
                        {(item.logoUrl) ? <CustomAvatar size='80' src={item.logoUrl} /> : <CustomAvatar size='80' name={item.name} />}

                        <div className='ml-4 w-full'>
                          <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {item.name}
                          </h5>
                          <p className="text-base tracking-tight text-gray-900 dark:text-white truncate">{item.description}</p>
                          <div className="flow-root h-auto">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                              <li className="pt-2 sm:pt-3 overflow-auto">
                                <div className="flex items-center space-x-4">
                                  <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                    Roles:
                                    {item?.ecosystemOrgs && item?.ecosystemOrgs?.length > 0 && item?.ecosystemOrgs[0].ecosystemRole &&
                                      item?.ecosystemOrgs[0]?.ecosystemRole?.name &&
                                      <span
                                        className="m-1 bg-primary-50 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                                      >
                                        {item?.ecosystemOrgs[0]?.ecosystemRole?.name}
                                      </span>
                                    }
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })
              }
            </div>)
              : ecosystemList && (
                <EmptyListMessage
                  message={'No Ecosystem'}
                  description={'Get started by creating a new Ecosystem'}
                  buttonContent={'Create Ecosystem'}
                  onClick={createOrganizationModel}
                  svgComponent={<svg className='pr-2 mr-1' xmlns="http://www.w3.org/2000/svg" width="24" height="15" fill="none" viewBox="0 0 24 24">
                    <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                  </svg>} />)
          }

          <div className={`flex items-center justify-end ${isEcosystemList && "mt-auto"}`}>
            {
              isEcosystemList && (
                <Pagination
                  currentPage={currentPage.pageNumber}
                  onPageChange={onPageChange}
                  totalPages={currentPage.total}
                />
              )
            }
          </div>
          <CreateEcosystemOrgModal
            openModal={openModal}
            setOpenModal={setOpenModal}
            setMessage={(value) => {
              setMessage(value)
              if (value) {
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              } else {
                fetchEcosystems();
              }
            }}
            isorgModal={false}
          />
        </div>
      </div>
    </div>
  )
}

export default EcosystemList;
