import type { IEcosystem } from './interfaces';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { useEffect, useState } from 'react';
import { Features } from '../../utils/enums/features';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomAvatar from '../Avatar';
import CustomSpinner from '../CustomSpinner';
import endorseIcon from '../../assets/endorser-card.svg';
import userCard from '../../assets/User_Card.svg';
import MemberList from './MemberList';
import { getEcosystem, getEcosystemDashboard } from '../../api/ecosystem';
import { EmptyListMessage } from '../EmptyListComponent';
import CreateEcosystemOrgModal from '../CreateEcosystemOrgModal';
import { AlertComponent } from '../AlertComponent';
import { ICheckEcosystem, checkEcosystem, getEcosystemId } from '../../config/ecosystem';
import RoleViewButton from '../RoleViewButton';
import SendInvitationModal from '../organization/invitations/SendInvitationModal';
import { Dropdown } from 'flowbite-react';
import EditPopupModal from '../EditEcosystemOrgModal';
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { getUserEcosystemInvitations } from '../../api/invitations';
import { pathRoutes } from '../../config/pathRoutes';
import type { EcosystemDashboard } from '../organization/interfaces';
import { dateConversion } from '../../utils/DateConversion';

interface IRoleTablet {
    role: string
}

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};

export const RoleTablet = ({ role }: IRoleTablet) => (
    <div className='text-[#467FFF] bg-[#C8DCFF] w-fit py-1.5 px-3 rounded-full ml-3'>{role}</div>
)

const Dashboard = () => {
    const [ecosystemDetails, setEcosystemDetails] = useState<IEcosystem | null>();
    const [success, setSuccess] = useState<string | null>(null);
    const [failure, setFailure] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean | null>(true);
    const [ecosystemId, setEcosystemId] = useState('')
    const [editOpenModal, setEditOpenModal] = useState<boolean>(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [viewButton, setViewButton] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(initialPageState);
    const [isEcosystemLead, setIsEcosystemLead] = useState(false);
    const [ecosystemDashboard, setEcosystemDashboard] = useState<EcosystemDashboard | null>(null)
    const [ecosystemDetailsNotFound, setEcosystemDetailsNotFound] = useState(false);
    const [orgId, setOrgId] = useState('');
    const [isOrgModal, setIsOrgModal] = useState(false)

    const createEcosystemModel = () => {
        setOpenModal(true);
    };

    const createInvitationsModel = () => {
        setOpenModal(true);
    };

    const EditEcosystemOrgModal = () => {
        setEditOpenModal(true);
    };

    const handleEditModalClose = () => {
        setEditOpenModal(false);
        setDropdownOpen(false);
        fetchEcosystemDetails()
    };

    const getAllEcosystemInvitations = async () => {

        setLoading(true);
        const response = await getUserEcosystemInvitations(
            currentPage.pageNumber,
            currentPage.pageSize,
            '',
        );
        const { data } = response as AxiosResponse;

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            const totalPages = data?.data?.totalPages;

            const invitationPendingList = data?.data?.invitations.filter((invitation: { status: string; }) => {
                return invitation.status === 'pending'
            })

            if (invitationPendingList.length > 0) {
                setMessage(`You have received invitation to join ecosystem `)
                setViewButton(true);
            }
            setCurrentPage({
                ...currentPage,
                total: totalPages,
            });
        } else {
            setError(response as string);
        }
        setLoading(false);
    };

    const fetchEcosystemDetails = async () => {
        setLoading(true);
        const id = await getFromLocalStorage(storageKeys.ORG_ID);
        setOrgId(id)
        if (id) {
            const response = await getEcosystem(id);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const ecosystemData = data?.data[0];
                if (ecosystemData) {
                    await setToLocalStorage(storageKeys.ECOSYSTEM_ID, ecosystemData?.id);
                    setEcosystemId(ecosystemData?.id);
                    const ecosystemOrg = ecosystemData?.ecosystemOrgs && ecosystemData?.ecosystemOrgs.length > 0 && ecosystemData?.ecosystemOrgs[0]
                    setEcosystemDetails({
                        logoUrl: ecosystemData?.logoUrl,
                        name: ecosystemData?.name,
                        description: ecosystemData?.description,
                        joinedDate: ecosystemOrg && ecosystemOrg?.createDateTime,
                        role: ecosystemOrg && ecosystemOrg?.ecosystemRole?.name
                    });
                } else {
                    await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID)
                }
            } else {
                await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID)
                setEcosystemDetailsNotFound(true);
            }
        }
        setLoading(false);
    };

    const fetchEcosystemDashboard = async () => {

        setLoading(true)

        const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
        const ecosystemId = await getEcosystemId();
        const data: ICheckEcosystem = await checkEcosystem();

        if (ecosystemId && orgId && data.isEcosystemLead) {
            const response = await getEcosystemDashboard(ecosystemId, orgId);

            const { data } = response as AxiosResponse

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setEcosystemDashboard(data?.data)
            }
            else {
                setFailure(response as string)
                setFailure(response as string);
                setLoading(false);
            }
        }
        setLoading(false)
    }

    const checkOrgId = async () => {
        const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
        if (orgId) {
            await getAllEcosystemInvitations();
        }
    };

    const getDashboardData = async () => {
        await checkOrgId();
        await fetchEcosystemDetails();
        await fetchEcosystemDashboard();
    };

    useEffect(() => {
        getDashboardData();

        const checkEcosystemData = async () => {
            const data: ICheckEcosystem = await checkEcosystem();
            setIsEcosystemLead(data.isEcosystemLead)
        }
        checkEcosystemData();

    }, []);

    return (
        <div className="px-4 pt-6">
            <div className="mb-4 col-span-full xl:mb-2">
                <BreadCrumbs />
            </div>

            {
                error ? <> {(success || failure) && (
                    <AlertComponent
                        message={success ?? failure}
                        type={success ? 'success' : 'failure'}
                        onAlertClose={() => {
                            setSuccess(null);
                            setFailure(null);
                        }}
                    />
                )}
                </>
                    :
                    <>
                        <div className="cursor-pointer">
                            {<AlertComponent
                                message={message || error}
                                type={message ? message === 'Ecosystem invitations sent successfully' ? 'success' : 'warning' : 'failure'}
                                viewButton={message === 'Ecosystem invitations sent successfully' ? false : true}
                                path={pathRoutes.ecosystem.invitation}
                                onAlertClose={() => {
                                    setMessage(null);
                                    setError(null);
                                }}
                            />}
                        </div>

                        {(success || failure) && (
                            <AlertComponent
                                message={success ?? failure}
                                type={success ? 'success' : 'failure'}
                                onAlertClose={() => {
                                    setSuccess(null);
                                    setFailure(null);
                                }}
                            />
                        )}
                    </>
            }

            {ecosystemDetails ? (
                <div>
                    <div className={`mt-4 flex-wrap items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 ${isEcosystemLead ? "w-full block" : "flex"}`}>
                        <div className={`flex flex-wrap ${!isEcosystemLead ? "w-full items-start" : "items-center"}`}>
                            <div className="mr-4">
                                {ecosystemDetails?.logoUrl ? (
                                    <CustomAvatar size="80" src={ecosystemDetails?.logoUrl} />
                                ) : (
                                    <CustomAvatar size="90" name={ecosystemDetails?.name} />
                                )}
                            </div>
                            {ecosystemDetails ? (
                                <div className='w-full sm:w-100/22rem min-w-[12rem]'>
                                    <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                                        {ecosystemDetails?.name}
                                    </h3>

                                    <p className="mb-1 text-base font-normal text-gray-900 dark:text-white">
                                        {ecosystemDetails?.description}
                                    </p>
                                    {
                                        !isEcosystemLead ?
                                            <div className='text-md font-semibold mt-6'>
                                                <div className='flex'>
                                                    <span className='text-[#3D3D3D] dark:text-white min-w-[10rem]'>Ecosystem Owner</span><span className='dark:text-white'>:</span> <span className='text-[#5E5972] dark:text-white ml-2'>NA</span>
                                                </div>
                                                <div className='flex'>
                                                    <span className='text-[#3D3D3D] dark:text-white min-w-[10rem]'>Ecosystem Lead</span> <span className='dark:text-white'>:</span><span className='text-[#5E5972] dark:text-white ml-2'>NA</span>
                                                </div>
                                                <div className='flex'>
                                                    <span className='text-[#3D3D3D] dark:text-white min-w-[10rem]'>Joined since</span> <span className='dark:text-white'>:</span><span className='text-[#5E5972] dark:text-white ml-2'>{ecosystemDetails.joinedDate ? dateConversion(ecosystemDetails.joinedDate) : "NA"}</span>
                                                </div>
                                            </div>
                                            :
                                            <div className='flex items-center'>
                                                <span className='dark:text-white'>Role: </span> <RoleTablet role={ecosystemDetails?.role || ""} />
                                            </div>
                                    }
                                </div>
                            ) : (
                                <CustomSpinner />
                            )}

                            {!isEcosystemLead &&
                                <div className='flex items-center ml-auto'>
                                    <span className='dark:text-white'>Role: </span> <RoleTablet role={ecosystemDetails?.role || ""} />
                                </div>
                            }

                            {isEcosystemLead && (
                                <div className="inline-flex items-center ml-auto">
                                    <SendInvitationModal
                                        ecosystemId={ecosystemId}
                                        flag={true}
                                        openModal={openModal}
                                        setMessage={(data) => setMessage(data)}
                                        setOpenModal={setOpenModal}
                                    />
                                    <RoleViewButton
                                        buttonTitle="Invite"
                                        feature={Features.SEND_INVITATION}
                                        svgComponent={
                                            <svg
                                                className="pr-2"
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="36"
                                                height="18"
                                                fill="none"
                                                viewBox="0 0 42 24"
                                            >
                                                <path
                                                    fill="#fff"
                                                    d="M37.846 0H9.231a3.703 3.703 0 0 0-3.693 3.692v1.385c0 .508.416.923.924.923a.926.926 0 0 0 .923-.923V3.692c0-.184.046-.369.092-.554L17.815 12 7.477 20.861a2.317 2.317 0 0 1-.092-.553v-1.385A.926.926 0 0 0 6.462 18a.926.926 0 0 0-.924.923v1.385A3.703 3.703 0 0 0 9.231 24h28.615a3.703 3.703 0 0 0 3.693-3.692V3.692A3.703 3.703 0 0 0 37.846 0ZM8.862 1.892c.092-.046.23-.046.369-.046h28.615c.139 0 .277 0 .37.046L24.137 13.938a.97.97 0 0 1-1.2 0L8.863 1.893Zm28.984 20.262H9.231c-.139 0-.277 0-.37-.046L19.247 13.2l2.492 2.17a2.67 2.67 0 0 0 1.8.691 2.67 2.67 0 0 0 1.8-.692l2.493-2.169 10.384 8.908c-.092.046-.23.046-.369.046Zm1.846-1.846c0 .184-.046.369-.092.553L29.262 12 39.6 3.138c.046.185.092.37.092.554v16.616ZM2.77 9.692c0-.507.416-.923.923-.923h5.539c.507 0 .923.416.923.923a.926.926 0 0 1-.923.923h-5.54a.926.926 0 0 1-.923-.923Zm6.462 5.539H.923A.926.926 0 0 1 0 14.308c0-.508.415-.923.923-.923h8.308c.507 0 .923.415.923.923a.926.926 0 0 1-.923.923Z"
                                                />
                                            </svg>
                                        }
                                        onClickEvent={createInvitationsModel}
                                    />
                                    <Dropdown
                                        label={"test"}
                                        open={dropdownOpen}
                                        onToggle={() => setDropdownOpen(!dropdownOpen)}
                                        renderTrigger={() => <svg
                                            className="ml-4 w-4 h-4 text-gray-800 cursor-pointer dark:text-white"
                                            aria-hidden="true"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 4 15"

                                        >
                                            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                        </svg>}
                                    >
                                        <Dropdown.Item onClick={EditEcosystemOrgModal}>
                                            <div>
                                                Edit Ecosystem
                                            </div>
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <div>
                                                Enable/Disable Ecosystem
                                            </div>
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <div>
                                                Manual Registration
                                            </div>
                                        </Dropdown.Item>
                                    </Dropdown>
                                </div>
                            )}
                        </div>
                    </div>

                    {isEcosystemLead && (
                        <>
                            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                                <div className="grid w-full grid-cols-1 gap-4 mt-0 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                                    <div
                                        className="items-center justify-between p-4 bg-white border-0 border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-103 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover min-h-[152px]"
                                        style={{ backgroundImage: `url(${userCard})` }}
                                    >
                                        <div className="w-full">
                                            <h3 className="text-base font-medium text-white">
                                                Member
                                            </h3>
                                            <span className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white">
                                                {ecosystemDashboard?.membersCount}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className="items-center justify-between p-4 bg-white border-0 border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-103 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover min-h-[152px]"
                                        style={{ backgroundImage: `url(${endorseIcon})` }}
                                    >
                                        <div className="w-full">
                                            <h3 className="text-base font-medium text-white">
                                                Endorsements
                                            </h3>
                                            <span className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white">
                                                {ecosystemDashboard?.endorsementsCount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
														<div>
                                <MemberList />
														</div>
                            <EditPopupModal
                                openModal={editOpenModal}
                                setOpenModal={setEditOpenModal}
                                setMessage={(value) => {
                                    setSuccess(value);
                                }}
                                isOrganization={false}
                                onEditSuccess={handleEditModalClose}
                                entityData={ecosystemDetails}
                            />
                        </>
                    )}
                </div>
            ) : (
                <div>
                    {!ecosystemDetails && loading ? (
                        <div className="min-h-100/18rem flex justify-center items-center">
                            <CustomSpinner />
                        </div>
                    ) : (
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                            <div className="flex items-center justify-center mb-4">
                                <CreateEcosystemOrgModal
                                    openModal={openModal}
                                    setOpenModal={setOpenModal}
                                    setMessage={(value) => {
                                        setSuccess(value);
                                        if (isOrgModal && value) {
                                            setTimeout(() => {
                                                window.location.reload();
                                            }, 2000);
                                        } else {
                                            getDashboardData();
                                        }
                                    }}
                                    isorgModal={isOrgModal}
                                />
                                <EmptyListMessage
                                    feature={!orgId ? Features.CRETAE_ORG : ""}
                                    message={'No Ecosystem found'}
                                    description={`Get started by creating an ${!orgId ? "Organization" : "Ecosystem"}`}
                                    buttonContent={`Create ${!orgId ? 'Organization' : 'Ecosystem'}`}
                                    svgComponent={
                                        <svg
                                            className="pr-2 mr-1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="15"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fill="#fff"
                                                d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
                                            />
                                        </svg>
                                    }
                                    onClick={() => {
                                        setIsOrgModal(Boolean(!orgId))
                                        createEcosystemModel()
                                    }
                                    }
                                />
                            </div>
                        </div>
                    )}
                </div>
            )
            }

            {
                ecosystemDetailsNotFound && (
                    <AlertComponent
                        message="Ecosystem details not found."
                        type="failure"
                        onAlertClose={() => {
                            setEcosystemDetailsNotFound(false);
                            setFailure(null);
                        }}
                    />
                )
            }
        </div >
    );
};

export default Dashboard;
