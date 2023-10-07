import type { IEcosystem } from './interfaces'
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
import { getEcosystem } from '../../api/ecosystem';
import { EmptyListMessage } from '../EmptyListComponent';
import CreateEcosystemOrgModal from '../CreateEcosystemOrgModal';
import { AlertComponent } from '../AlertComponent';
import checkEcosystem from '../../config/ecosystem';
import RoleViewButton from '../RoleViewButton';
import SendInvitationModal from '../organization/invitations/SendInvitationModal';
import { setToLocalStorage } from '../../api/Auth';
import { getEcosytemReceivedInvitations } from '../../api/invitations';
import { pathRoutes } from '../../config/pathRoutes';


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

	const props = { openModal, setOpenModal };

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
			const ecoSystemName = invitationList.map((invitations: { name: string; })=>{
				return invitations.name
			})
			const invitationPendingList = data?.data?.invitations.filter((invitation: { status: string; })=>{
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
		const response = await getEcosystem();
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
			setFailure(response as string);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchEcosystemDetails();
		getAllEcosystemInvitations();
	}, []);

	const { isEcosystemLead } = checkEcosystem();

	return (
		<div className="px-4 pt-6">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>

			{
				error ?  <> {(success || failure) && (
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


    const createEcosystemModel = () => {
        props.setOpenModal(true)
    }

    const fetchEcosystemDetails = async () => {

        setLoading(true)

        if (storageKeys.ORG_ID) {
            const response = await getEcosystem(storageKeys.ORG_ID);

            const { data } = response as AxiosResponse

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                if (data?.data.length > 0) {
                    const ecosystemData = data?.data[0]
                    setEcosystemDetails({
                        logoUrl: ecosystemData.logoUrl,
                        name: ecosystemData.name,
                        description: ecosystemData.description
                    })
                }
            } else {
                setFailure(response as string)
            }
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchEcosystemDetails()
    }, [])

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

					{isEcosystemLead && (
						<>
							<div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
								<div className="grid w-full grid-cols-1 gap-4 mt-0 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
									<div
										className="items-center justify-between p-4 bg-white border-0 border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover min-h-[152px]"
										style={{ backgroundImage: `url(${userCard})` }}
									>
										<div className="w-full">
											<h3 className="text-base font-medium text-white">
												Member
											</h3>
											<span className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white">
												23
											</span>
										</div>
									</div>

                        {
                            isEcosystemLead &&
                            <>
                                <div
                                    className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
                                >
                                    <div
                                        className="grid w-full grid-cols-1 gap-4 mt-0 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
                                    >
                                        <div
                                            className="items-center justify-between p-4 bg-white border-0 border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-103 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover min-h-[152px]" style={{ backgroundImage: `url(${userCard})` }}
                                        >
                                            <div className="w-full">
                                                <h3 className="text-base font-medium text-white">
                                                    Member
                                                </h3>
                                                <span
                                                    className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white"
                                                >23
                                                </span>
                                            </div>
                                        </div>

                                        <div
                                            className="items-center justify-between p-4 bg-white border-0 border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-103 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover min-h-[152px]" style={{ backgroundImage: `url(${endorseIcon})` }}
                                        >
                                            <div className="w-full">
                                                <h3 className="text-base font-medium text-white">
                                                    Endorsements
                                                </h3>
                                                <span className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white">
                                                    598
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800'>
                                    <MemberList />
                                </div>
                            </>
                        }

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

		</div>
	);
};

export default Dashboard;
