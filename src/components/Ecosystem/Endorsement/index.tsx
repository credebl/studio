'use client';

import { Alert, Pagination } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import { getAllSchemas, getAllSchemasByOrgId } from '../../../api/Schema';

import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import CustomSpinner from '../../CustomSpinner';
import { EmptyListMessage } from '../../EmptyListComponent';
import SearchInput from '../../SearchInput';
import { getFromLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';
import { getOrganizationById } from '../../../api/organization';
import checkEcosystem from '../../../config/ecosystem';
import type { GetAllSchemaListParameter, IAttributes } from '../../Resources/Schema/interfaces';
import EndorsementPopup from './EndorsementPopup';
import { EcosystemRoles, EndorsementStatus, EndorsementType } from '../../../common/enums';
import EndorsementCard from './EndorsementCard';

interface ISelectedRequest {
    attribute: IAttributes[];
    issuerDid: string;
    createdDate: string;
    schemaId: string;
}

const EndorsementList = () => {
    const [schemaList, setSchemaList] = useState([])
    const [schemaListErr, setSchemaListErr] = useState<string | null>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [allSchemaFlag, setAllSchemaFlag] = useState<boolean>(false)
    const [orgId, setOrgId] = useState<string>('')
    const [endorsementListAPIParameter, setEndorsementListAPIParameter] = useState({
        itemPerPage: 9,
        page: 1,
        search: "",
        sortBy: "id",
        sortingOrder: "DESC",
        allSearch: ""
    })
    const [walletStatus, setWalletStatus] = useState(false)
    const [totalItem, setTotalItem] = useState(0)
    const [showPopup, setShowPopup] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<ISelectedRequest>()
    const getEndorsementList = async (endorsementListAPIParameter: GetAllSchemaListParameter, flag: boolean) => {
        try {
            const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
            setOrgId(organizationId);
            setLoading(true);
            let schemaList
            if (allSchemaFlag) {
                schemaList = await getAllSchemas(endorsementListAPIParameter);
            } else {
                schemaList = await getAllSchemasByOrgId(endorsementListAPIParameter, organizationId);
            }
            const { data } = schemaList as AxiosResponse;
            if (schemaList === 'Schema records not found') {
                setLoading(false);
                setSchemaList([]);
            }

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                if (data?.data?.data) {
                    setTotalItem(data?.data.totalItems)
                    setSchemaList(data?.data?.data);
                    setLoading(false);
                } else {
                    setLoading(false);
                    if (schemaList !== 'Schema records not found') {
                        setSchemaListErr(schemaList as string)

                    }
                }
            } else {
                setLoading(false);
                if (schemaList !== 'Schema records not found') {
                    setSchemaListErr(schemaList as string)

                }
            }
            setTimeout(() => {
                setSchemaListErr('')
            }, 3000)
        } catch (error) {
            console.error('Error while fetching schema list:', error);
            setLoading(false);

        }
    };

    useEffect(() => {
        getEndorsementList(endorsementListAPIParameter, false)

    }, [endorsementListAPIParameter, allSchemaFlag])

    const onSearch = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        event.preventDefault()
        getEndorsementList({
            ...endorsementListAPIParameter,
            search: event.target.value
        }, false)

        if (allSchemaFlag) {
            getEndorsementList({
                ...endorsementListAPIParameter,
                allSearch: event.target.value
            }, false)
        }

    }

    const requestSelectionCallback = (schemaId: string, attributes: IAttributes[], issuerId: string, created: string) => {
        const schemaDetails = {
            attribute: attributes,
            issuerDid: issuerId,
            createdDate: created,
            schemaId
        }
        console.log("Selected request data::", schemaDetails)
        setSelectedRequest(schemaDetails)
        // props.schemaSelectionCallback(schemaId, schemaDetails)
        setShowPopup(true)
    }
    const options = ["All", "Approved", "Requested", "Rejected"]

    const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log("Handle filter", e.target.value)
        if (e.target.value === 'All schemas') {
            setAllSchemaFlag(true)
        }
        else {
            setAllSchemaFlag(false)
            getEndorsementList(endorsementListAPIParameter, false)
        }
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

    const { isEcosystemMember } = checkEcosystem()
    // const createSchemaTitle = isEcosystemMember ? "Request Endorsement" : "Create"
    // isEcosystemMember ? "Request Endorsement" : "Create"

    return (
        <div className="px-4 pt-6">
            <div className="mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />
                <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                    Endorsement Details
                </h1>
            </div>
            <div>
                <div
                    className=""
                >
                    <div className="flex flex-col items-center justify-between mb-4 pr-4 sm:flex-row">
                        <div id='schemasSearchInput' className='mb-2 pl-2 flex space-x-2 items-end'>
                            <SearchInput
                                onInputChange={onSearch}
                            />
                            <select onChange={handleFilter} id="schamfilter"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11">
                                {/* <option selected>Organization's schema</option> */}
                                {options.map((opt) => (
                                    <option
                                        key={opt}
                                        className=""
                                        value={opt}
                                    >
                                        {opt}
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
                {loading && (<div className="flex items-center justify-center mb-4">
                    <CustomSpinner />
                </div>)
                }
                {
                    !loading && schemaList && schemaList.length > 0 ? (
                        <div className='Flex-wrap' style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
                                {schemaList && schemaList.length > 0 &&
                                    schemaList.map((element, index) => (
                                        <div className='p-2' key={`endorsement-cards${index}`}>
                                            <EndorsementCard fromEndorsementList={true} schemaName={element['name']} version={element['version']} schemaId={element['schemaLedgerId']} issuerDid={element['issuerId']} attributes={element['attributes']} created={element['createDateTime']}
                                                onClickCallback={requestSelectionCallback} status={index === 1 ? EndorsementStatus.approved : index === 2 ? EndorsementStatus.requested : EndorsementStatus.rejected} />
                                        </div>
                                    ))}
                            </div>
                            <div className="flex items-center justify-end mb-4" id="schemasPagination">
                                {schemaList.length > 0 && (<Pagination
                                    currentPage={endorsementListAPIParameter?.page}
                                    onPageChange={(page) => {
                                        setEndorsementListAPIParameter(prevState => ({
                                            ...prevState,
                                            page: page
                                        }));
                                    }}
                                    totalPages={Math.ceil(totalItem / endorsementListAPIParameter?.itemPerPage)}
                                />)}
                            </div>
                        </div>
                    ) :
                        (
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
                        )
                }
            </div>
            <EndorsementPopup openModal={showPopup} closeModal={hidePopup} isAccepted={(flag: boolean) => console.log('Is accepted::', flag)} name={"Schema"} id={selectedRequest?.schemaId ?? "test"} version={''} authorDID={''} revocable={false} endorsementType={EndorsementType.schema} organizationName={''} created={''} ecosystemRole={EcosystemRoles.ecosystemMember} attrNames={[]} />
        </div>
    )
}


export default EndorsementList
