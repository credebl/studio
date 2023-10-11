import type { IEcosystem } from './interfaces';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { ReactSVGElement, useEffect, useState } from 'react';
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
import { ICheckEcosystem, checkEcosystem } from '../../config/ecosystem';
import RoleViewButton from '../RoleViewButton';
import SendInvitationModal from '../organization/invitations/SendInvitationModal';
import { getFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { getEcosytemReceivedInvitations } from '../../api/invitations';
import { pathRoutes } from '../../config/pathRoutes';
import type { EcosystemDashboard } from '../organization/interfaces';

const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};

const Dashboard = () => {
    const [ecosystemDetails, setEcosystemDetails] = useState<IEcosystem | null>();
    const [success, setSuccess] = useState<string | null>(null);
    const [failure, setFailure] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean | null>(true);
    const [error, setError] = useState<string | null>(null);
    const [ecosystemId, setEcosystemId] = useState('');
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [viewButton, setViewButton] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(initialPageState);
    const [isEcosystemLead, setIsEcosystemLead] = useState(false);
	const [showPopup, setShowPopup] = useState<boolean>(false);
    const [ecosystemDashboard, setEcosystemDashboard] = useState<EcosystemDashboard | null>(null)
	const [ecosystemDetailsNotFound, setEcosystemDetailsNotFound] = useState(false);

    const props = { openModal, setOpenModal };

	const createEcosystemModel = () => {
		props.setOpenModal(true);
	};

	const createInvitationsModel = () => {
		props.setOpenModal(true);
	};

	const redirectToOrgRegistrationPopup = () => {
		setShowPopup(true);
	};

    const getAllEcosystemInvitations = async () => {
        setLoading(true);
        const response = await getEcosytemReceivedInvitations(
            currentPage.pageNumber,
            currentPage.pageSize,
            '',
        );
        const { data } = response as AxiosResponse;

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            const totalPages = data?.data?.totalPages;

            const invitationList = data?.data;
            const ecoSystemName = invitationList.map((invitations: { name: string; }) => {
                return invitations.name
            })
            const invitationPendingList = data?.data?.invitations.filter((invitation: { status: string; }) => {
                return invitation.status === 'pending'
            })

            if (invitationPendingList.length > 0) {
                setMessage(`You have received invitation to join ${ecoSystemName} ecosystem `)
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
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		if (orgId) {
			const response = await getEcosystem(orgId);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const ecosystemData = data?.data[0];
				await setToLocalStorage(storageKeys.ECOSYSTEM_ID, ecosystemData?.id);
				setEcosystemId(ecosystemData?.id);
				setEcosystemDetails({
					logoUrl: ecosystemData.logoUrl,
					name: ecosystemData.name,
					description: ecosystemData.description,
				});
			} else {
				setEcosystemDetailsNotFound(true);
				
			}
		}
		setLoading(false);
	};

	const fetchEcosystemDashboard = async () => {

        setLoading(true)

        const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const ecosystemId = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);

		const response = await getEcosystemDashboard(ecosystemId as string, orgId as string);

		const { data } = response as AxiosResponse

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setEcosystemDashboard(data?.data)
		}
		else {
            setFailure(response as string)
			setFailure(response as string);
			setLoading(false);
		}
		setLoading(false)
        
    }

	const getDashboardData = async () => {
		await fetchEcosystemDetails();
		await fetchEcosystemDashboard();
		await getAllEcosystemInvitations();
		const checkEcosystemData = async () => {
            const data: ICheckEcosystem = await checkEcosystem();
            setIsEcosystemLead(data.isEcosystemLead)
        }
        checkEcosystemData();

	}

	useEffect(() => {
		getDashboardData()
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
                                message={message ? message : error}
                                type={message ? 'warning' : 'failure'}
                                viewButton={viewButton}
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
                    <div className="mt-4 flex flex-wrap items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                        <div className="items-center flex flex-wrap">
                            <div className="mr-4">
                                {ecosystemDetails?.logoUrl ? (
                                    <CustomAvatar size="80" src={ecosystemDetails?.logoUrl} />
                                ) : (
                                    <CustomAvatar size="90" name={ecosystemDetails?.name} />
                                )}
                            </div>
                            {ecosystemDetails ? (
                                <div>
                                    <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                                        {ecosystemDetails?.name || 'Dummy Name'}
                                    </h3>

									<p className="mb-1 text-base font-normal text-gray-900 dark:text-white">
										{ecosystemDetails?.description || 'Dummy Desc'}
									</p>
								</div>
							) : (
								<CustomSpinner />
							)}
						</div>

						{isEcosystemLead && (
							<div className="inline-flex items-center">
								<SendInvitationModal
									ecosystemId={ecosystemId}
									flag={true}
									openModal={props.openModal}
									setMessage={(data) => setMessage(data)}
									setOpenModal={props.setOpenModal}
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
								<div className="ml-4">
									<svg
										className="w-6 h-6 text-gray-800 cursor-pointer dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="currentColor"
										viewBox="0 0 4 15"
									>
										<path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
									</svg>
								</div>	
							</div>
						)}
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
											{ ecosystemDashboard?.endorsementsCount }

                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                                <MemberList />
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div>
                    {!ecosystemDetails && !loading ? (
                        <div>
                        </div>
                    ) : (
                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                            <div className="flex items-center justify-center mb-4">
                                <CreateEcosystemOrgModal
                                    openModal={openModal}
                                    setOpenModal={props.setOpenModal}
                                    setMessage={(value) => {
                                        setSuccess(value);
                                        fetchEcosystemDetails();
                                    }}
                                    isorgModal={false}
                                />
                                <EmptyListMessage
                                    message={'No Ecosystem found'}
                                    description={'Get started by creating an ecosystem'}
                                    buttonContent={'Create Ecosystem'}
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
                                    onClick={() => createEcosystemModel()}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
			{ecosystemDetailsNotFound && (
        <AlertComponent
          message="Ecosystem details not found."
          type="failure"
          onAlertClose={() => {
            setEcosystemDetailsNotFound(false); 
            setFailure(null);
          }}
        />
      )}
        </div>
    );
};

export default Dashboard;