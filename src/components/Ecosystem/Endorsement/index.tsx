'use client';

import { Alert, Pagination } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import CustomSpinner from '../../CustomSpinner';
import { EmptyListMessage } from '../../EmptyListComponent';
import SearchInput from '../../SearchInput';
import { getFromLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';
import { getOrganizationById } from '../../../api/organization';
import { getEcosystemId } from '../../../config/ecosystem';
import type { IAttributes } from '../../Resources/Schema/interfaces';
import EndorsementPopup from './EndorsementPopup';
import EndorsementCard from './EndorsementCard';
import { GetEndorsementListParameter, getEndorsementList } from '../../../api/ecosystem';

interface ISelectedRequest {
    attribute: IAttributes[];
    issuerDid: string;
    createdDate: string;
    schemaId: string;
}

interface IEndorsementList {
    id: string
    endorserDid: string
    authorDid: string
    status: string
    type: string
    ecosystemOrgs: {
        orgId: number
    }
    requestPayload: string
    responsePayload: string
    createDateTime: string
}

const EndorsementList = () => {
    const [schemaList, setSchemaList] = useState<IEndorsementList[]>([])
    const [schemaListErr, setSchemaListErr] = useState<string | null>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [orgId, setOrgId] = useState<string>('')
    const [endorsementListAPIParameter, setEndorsementListAPIParameter] = useState({
        itemPerPage: 9,
        page: 1,
        search: "",
        sortBy: "id",
        sortingOrder: "DESC",
        type: "",
        status: ""
    })
    const [totalPages, setTotalPages] = useState(0)
    const [walletStatus, setWalletStatus] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<ISelectedRequest>()


    const options = [
        {
            name: "All",
            value: ""
        },
        {
            name: "Approved",
            value: "approved"
        },
        {
            name: "Requested",
            value: "requested"
        },
        {
            name: "Rejected",
            value: "rejected"
        },
    ]

    const typeOptions = [{
        name: "All",
        value: ""
    },
    {
        name: "Schema",
        value: "schema"
    },
    {
        name: "Credential-definition",
        value: "credential-definition"
    }

    ]

    const getEndorsementListData = async (endorsementListAPIParameter: GetEndorsementListParameter) => {
        try {
            const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
            setOrgId(organizationId)
            const id = await getEcosystemId();
            const endorsementList = await getEndorsementList(endorsementListAPIParameter, organizationId, id);

            const { data } = endorsementList as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                if (data?.data?.transactions) {
                    setSchemaList(data?.data?.transactions);
                    setTotalPages(data?.data?.totalPages)
                    setLoading(false);
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error('Error while fetching schema list:', error);
        }
    }

    const onPageChange = (page: number) => {
		setEndorsementListAPIParameter({
			...endorsementListAPIParameter,
			page,
		});
	};

    useEffect(() => {
        getEndorsementListData(endorsementListAPIParameter)
    }, [endorsementListAPIParameter])

    const onSearch = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        event.preventDefault()
        setEndorsementListAPIParameter({ ...endorsementListAPIParameter, search: event.target.value })
    }

    const requestSelectionCallback = (data: any) => {
        setSelectedRequest(data)
        setShowPopup(true)
    }

    const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>, filter: "typeFilter" | "statusFilter") => {
        const updateFilter = endorsementListAPIParameter
        if (filter === "typeFilter") {
            updateFilter["type"] = e.target.value
        }
        if (filter === "statusFilter") {
            updateFilter["status"] = e.target.value
        }
        setEndorsementListAPIParameter(updateFilter)
        getEndorsementListData(updateFilter)
    };

    const fetchOrganizationDetails = async () => {
        setLoading(true)
        const orgId = await getFromLocalStorage(storageKeys.ORG_ID)
        const response = await getOrganizationById(orgId);
        const { data } = response as AxiosResponse
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            if (data?.data?.org_agents && data?.data?.org_agents?.length > 0) {
                setWalletStatus(true)
            }
        }
        setLoading(false)
    }

    const hidePopup = () => {
        setShowPopup(false)
    }

    useEffect(() => {
        fetchOrganizationDetails()
    }, [])

    return (
        <div className="px-4 pt-6">
            <div className="mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />
                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Endorsements
                </h1>
            </div>
            <div>
                <div>
                    <div className="flex flex-col items-center justify-between mb-4 pr-4 sm:flex-row">
                        <div id='schemasSearchInput' className='mb-2 pl-2 flex space-x-2 items-end'>
                            <SearchInput
                                onInputChange={onSearch}
                            />
                            <select onChange={(e) => handleFilter(e, "statusFilter")} id="statusfilter"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
                                {options.map((opt) => (
                                    <option
                                        key={opt.value}
                                        className=""
                                        value={opt.value}
                                    >
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                            <select onChange={(e) => handleFilter(e, "typeFilter")} id="typefilter"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
                                {typeOptions.map((opt) => (
                                    <option
                                        key={opt.value}
                                        className=""
                                        value={opt.value}
                                    >
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                {
                    schemaListErr &&
                    <Alert
                        color="failure"
                        onDismiss={() => setSchemaListErr(null)}
                    >
                        <span>
                            <p>
                                {schemaListErr}
                            </p>
                        </span>
                    </Alert>
                }
                {schemaList && schemaList.length > 0 ? (
                    <div className='Flex-wrap' style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
                            {
                                schemaList.map((item: IEndorsementList) => (
                                    <div className='p-2' key={`endorsement-cards${item.id}`}>
                                        <EndorsementCard fromEndorsementList={true} data={item} onClickCallback={requestSelectionCallback} />
                                    </div>
                                ))}
                        </div>
                        <div className="flex items-center justify-end mb-4" id="schemasPagination">
                            <Pagination
                                currentPage={endorsementListAPIParameter.page}
                                onPageChange={onPageChange}
                                totalPages={totalPages}
                            />
                        </div>
                    </div>
                ) :
                    (
                        <div>
                            {
                                !(schemaList && schemaList.length > 0) && loading ?
                                    (<div className="flex items-center justify-center mb-4 min-h-100/25rem">
                                        <CustomSpinner />
                                    </div>)
                                    :
                                    <div>
                                        {walletStatus ?
                                            <EmptyListMessage
                                                message={'No Endorsement Requests'}
                                                description={'Get started by requesting Endorsement'}
                                                buttonContent={'Request Endorsements'}
                                                svgComponent={<svg className='pr-2 mr-1' xmlns="http://www.w3.org/2000/svg" width="24" height="15" fill="none" viewBox="0 0 24 24">
                                                    <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                                                </svg>}
                                                onClick={() => {
                                                    window.location.href = `${pathRoutes.organizations.createSchema}?OrgId=${orgId}`
                                                }}
                                            />
                                            :
                                            <EmptyListMessage
                                                message={'No Wallet'}
                                                description={'Get started by creating a Wallet'}
                                                buttonContent={'Create Wallet'}
                                                svgComponent={<svg className='pr-2 mr-1' xmlns="http://www.w3.org/2000/svg" width="24" height="15" fill="none" viewBox="0 0 24 24">
                                                    <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                                                </svg>}
                                                onClick={() => {
                                                    window.location.href = `${pathRoutes.organizations.dashboard}?OrgId=${orgId}`
                                                }}
                                            />}
                                    </div>
                            }
                        </div>
                    )
                }
            </div>
            <EndorsementPopup openModal={showPopup} closeModal={hidePopup} isAccepted={(flag: boolean) => console.log('Is accepted::', flag)} endorsementData={selectedRequest}/>
        </div>
    )
}


export default EndorsementList
