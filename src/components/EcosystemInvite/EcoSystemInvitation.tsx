'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { apiStatusCodes } from '../../config/CommonConstant';
import axios from 'axios';
import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import { EmptyListMessage } from '../EmptyListComponent';
import { Features } from '../../utils/enums/features';
import type { Invitation } from '../organization/interfaces/invitations';
import type { OrgRole } from '../organization/interfaces';
import { Card, Pagination } from 'flowbite-react';
import RoleViewButton from '../RoleViewButton';
import SendInvitationModal from '../organization/invitations/SendInvitationModal';
import { TextTittlecase } from '../../utils/TextTransform';
import { getEcosystemList, getOrganizationInvitations } from '../../api/invitations';
import CustomSpinner from '../CustomSpinner';
import { dateConversion } from '../../utils/DateConversion';
import DateTooltip from '../Tooltip';
import CustomAvatar from '../Avatar';
import DataTable from '../../commonComponents/datatable';


const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
};

const header = [
	{ columnName: 'Org Name' },
	{ columnName: 'Member Since' },
	{ columnName: 'Role' },
	{ columnName: 'Status' },
	{ columnName: 'Action' },
];


const Ecosysteminvitation = () => {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(initialPageState);
    const [userRoles, setUserRoles] = useState<string[]>([])
    const timestamp = Date.now();

    const onPageChange = (page: number) => {
        setCurrentPage({
            ...currentPage,
            pageNumber: page
        })
    };
    const [searchText, setSearchText] = useState("");

    const [invitationsList, setInvitationsList] = useState<Array<Invitation> | null>(null)
    const props = { openModal, setOpenModal };
console.log("invitationsList",invitationsList);

    //Fetch the user organization list
    const getAllEcosystem = async () => {
        setLoading(true)

        const response = await getEcosystemList();
        const { data } = response as AxiosResponse
console.log("data",data);

        setLoading(false)

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

            // const totalPages = data?.data?.totalPages;

            const invitationList = data?.data

            setInvitationsList(invitationList)
            // setCurrentPage({
            //     ...currentPage,
            //     total: totalPages
            // })
        }
        else {
            setError(response as string)

        }
    }

		const credentialList =  [	{ data:[
			{ data: "Master Card" },
					{
						data: "06/10/2022"
					},
					{ data: "Lead" },
					{
						data: "Pending"
					},
					{
						data: ":"
					}]
		}]
			
    //This useEffect is called when the searchText changes 
    // useEffect(() => {

    //     // let getData: string | number | NodeJS.Timeout | undefined;
    //     let getData: NodeJS.Timeout

    //     if (searchText.length >= 1) {
    //         getData = setTimeout(() => {
    //             getAllInvitations()

    //         }, 1000)
    //     } else {
    //         getAllInvitations()
    //     }

    //     return () => clearTimeout(getData)
    // }, [searchText, openModal, currentPage.pageNumber])

    
    //onCHnage of Search input text
    const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    }

    const createInvitationsModel = () => {
        props.setOpenModal(true)
    }
let name="Karan tompe"
useEffect(()=>{
	getAllEcosystem()
	
	},[])
    return (
        <div>
            <div
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
            >
							<AlertComponent
                    message='You have some pending received invitations' 
                    type="message"
										viewButton={true}
										path={"/ecosystem/invitation"}
										// ecosystem/inivations
                    onAlertClose={() => {
                        setMessage(null)
                        setError(null)
                    }}
                />
							<Card className='my-2'>
                <div className="flex items-center justify-between">
								<div className="flex items-center">
										{/* {org.logoUrl ? (
											<CustomAvatar size="80" src={org?.logoUrl} />
										) : ( */}
											<CustomAvatar size="80" name={name} />
										{/* )} */}

										<div className="ml-4">
											<h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
												<p>Proactive </p>
											</h5>
											<div className="flow-root">
												<ul className="divide-y divide-gray-200 dark:divide-gray-700">
													<li className="py-3 sm:py-4 overflow-auto">
														<div className="flex items-center space-x-4">
															<div className="inline-flex items-center text-gray-900 dark:text-white">
																{/* {org?.description} */}
																my org
															</div>
														</div>
													</li>
												</ul>
											</div>
										</div>
									</div>
									<div className='flex justify-between'>
                    <RoleViewButton
                        buttonTitle='Invite'
                        feature={Features.SEND_INVITATION}
                        svgComponent={
                        <svg className='pr-2' xmlns="http://www.w3.org/2000/svg" width="36" height="18" fill="none" viewBox="0 0 42 24">
                            <path fill="#fff" d="M37.846 0H9.231a3.703 3.703 0 0 0-3.693 3.692v1.385c0 .508.416.923.924.923a.926.926 0 0 0 .923-.923V3.692c0-.184.046-.369.092-.554L17.815 12 7.477 20.861a2.317 2.317 0 0 1-.092-.553v-1.385A.926.926 0 0 0 6.462 18a.926.926 0 0 0-.924.923v1.385A3.703 3.703 0 0 0 9.231 24h28.615a3.703 3.703 0 0 0 3.693-3.692V3.692A3.703 3.703 0 0 0 37.846 0ZM8.862 1.892c.092-.046.23-.046.369-.046h28.615c.139 0 .277 0 .37.046L24.137 13.938a.97.97 0 0 1-1.2 0L8.863 1.893Zm28.984 20.262H9.231c-.139 0-.277 0-.37-.046L19.247 13.2l2.492 2.17a2.67 2.67 0 0 0 1.8.691 2.67 2.67 0 0 0 1.8-.692l2.493-2.169 10.384 8.908c-.092.046-.23.046-.369.046Zm1.846-1.846c0 .184-.046.369-.092.553L29.262 12 39.6 3.138c.046.185.092.37.092.554v16.616ZM2.77 9.692c0-.507.416-.923.923-.923h5.539c.507 0 .923.416.923.923a.926.926 0 0 1-.923.923h-5.54a.926.926 0 0 1-.923-.923Zm6.462 5.539H.923A.926.926 0 0 1 0 14.308c0-.508.415-.923.923-.923h8.308c.507 0 .923.415.923.923a.926.926 0 0 1-.923.923Z" />
                        </svg>}
                        onClickEvent={createInvitationsModel}
                    />
										 <button type="button" className='ml-4'
                        >
                            <svg aria-hidden="true" className="mr-1 -ml-1 w-5 h-5"
                                fill="currentColor" viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg" color='#3558A8'
                                onClick=""><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                                >
                                </path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>

                        </button>  
												</div>                
                </div>
								</Card>
                <SendInvitationModal
								    flag={true}
                    openModal={props.openModal}
                    setMessage={(data) => setMessage(data)}
                    setOpenModal={
                        props.setOpenModal
                    } />

                

                {/* {
								loading
                    ? <div className="flex items-center justify-center mb-4">
                       
                        <CustomSpinner/>
                    </div>
                    : invitationsList && invitationsList?.length > 0 ? (
											<div
											className="Flex-wrap"
											style={{ display: 'flex', flexDirection: 'column' }}
										> */}

											<Card>
												<div className='flex justify-between'>
<h1 className='text-xl font-semibold py-1'>EcoSystem Members</h1>
<a href={"/ecosystem/sent-invitations"}><h1 className='text-xl font-semibold py-1'>Sent Invitations</h1></a>
</div>
											<div className="">
												{/* {invitationsList && invitationsList.length > 0 && */}
													<DataTable header={header} data={credentialList} loading={loading}></DataTable>
												{/* } */}
											</div>
											</Card>
										{/* </div>) 
                    : 
										invitationsList && (<EmptyListMessage
                        message={'No Invitations'}
                        description={'Get started by inviting a users'}
                        buttonContent={'Invite'}
                        feature={Features.SEND_INVITATION}
                        onClick={createInvitationsModel}
                        svgComponent={<svg className='pr-2' xmlns="http://www.w3.org/2000/svg" width="36" height="18" fill="none" viewBox="0 0 42 24">
                            <path fill="#fff" d="M37.846 0H9.231a3.703 3.703 0 0 0-3.693 3.692v1.385c0 .508.416.923.924.923a.926.926 0 0 0 .923-.923V3.692c0-.184.046-.369.092-.554L17.815 12 7.477 20.861a2.317 2.317 0 0 1-.092-.553v-1.385A.926.926 0 0 0 6.462 18a.926.926 0 0 0-.924.923v1.385A3.703 3.703 0 0 0 9.231 24h28.615a3.703 3.703 0 0 0 3.693-3.692V3.692A3.703 3.703 0 0 0 37.846 0ZM8.862 1.892c.092-.046.23-.046.369-.046h28.615c.139 0 .277 0 .37.046L24.137 13.938a.97.97 0 0 1-1.2 0L8.863 1.893Zm28.984 20.262H9.231c-.139 0-.277 0-.37-.046L19.247 13.2l2.492 2.17a2.67 2.67 0 0 0 1.8.691 2.67 2.67 0 0 0 1.8-.692l2.493-2.169 10.384 8.908c-.092.046-.23.046-.369.046Zm1.846-1.846c0 .184-.046.369-.092.553L29.262 12 39.6 3.138c.046.185.092.37.092.554v16.616ZM2.77 9.692c0-.507.416-.923.923-.923h5.539c.507 0 .923.416.923.923a.926.926 0 0 1-.923.923h-5.54a.926.926 0 0 1-.923-.923Zm6.462 5.539H.923A.926.926 0 0 1 0 14.308c0-.508.415-.923.923-.923h8.308c.507 0 .923.415.923.923a.926.926 0 0 1-.923.923Z" />
                        </svg>}
                    />)
                } */}

                <div className="flex items-center justify-end mb-4">

                    <Pagination
                        currentPage={currentPage.pageNumber}
                        onPageChange={onPageChange}
                        totalPages={currentPage.total}
                    />
                </div>
            </div>
        </div>

    )
}

export default Ecosysteminvitation;



{/* <div className="px-4 pt-6">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Verification List
				</h1>
			</div>
			<div>
				<div
					className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
					<div className="flex items-center justify-end mb-4">					
						<RoleViewButton
								buttonTitle='Request'
								feature={Features.VERIFICATION}
								svgComponent={
									<svg className='mr-2 mt-1' xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 25 25">
								<path fill="#fff" d="M21.094 0H3.906A3.906 3.906 0 0 0 0 3.906v12.5a3.906 3.906 0 0 0 3.906 3.907h.781v3.906a.781.781 0 0 0 1.335.553l4.458-4.46h10.614A3.906 3.906 0 0 0 25 16.407v-12.5A3.907 3.907 0 0 0 21.094 0Zm2.343 16.406a2.343 2.343 0 0 1-2.343 2.344H10.156a.782.782 0 0 0-.553.228L6.25 22.333V19.53a.781.781 0 0 0-.781-.781H3.906a2.344 2.344 0 0 1-2.344-2.344v-12.5a2.344 2.344 0 0 1 2.344-2.344h17.188a2.343 2.343 0 0 1 2.343 2.344v12.5Zm-3.184-5.951a.81.81 0 0 1-.17.254l-3.125 3.125a.781.781 0 0 1-1.105-1.106l1.792-1.79h-7.489a2.343 2.343 0 0 0-2.344 2.343.781.781 0 1 1-1.562 0 3.906 3.906 0 0 1 3.906-3.906h7.49l-1.793-1.79a.78.78 0 0 1 .254-1.277.781.781 0 0 1 .852.17l3.125 3.125a.79.79 0 0 1 .169.852Z" />
							</svg>
								}
								onClickEvent={schemeSelection}
							/>
					</div>
					{
					(proofReqSuccess || errMsg) && (
						<div className="p-2">
							<Alert
								color={proofReqSuccess ? 'success' : 'failure'}
								onDismiss={() => setErrMsg(null)}
							>
								<span>
									<p>
										{proofReqSuccess || errMsg}
									</p>
								</span>
							</Alert>
						</div>
					)}
					{loading ? (
						<div className="flex items-center justify-center mb-4">
							<CustomSpinner />
						</div>
					) : verificationList && verificationList.length > 0 ? (
						<div
							className="Flex-wrap"
							style={{ display: 'flex', flexDirection: 'column' }}
						>
							<div className="">
								{verificationList && verificationList.length > 0 &&
									<DataTable header={header} data={verificationList} loading={loading}></DataTable>
								}
							</div>
						</div>
					) : (
						<div>
							<span className="dark:text-white block text-center p-4 m-8">
								There isn't any data available.
							</span>
						</div>
					)}

					<ProofRequest openModal={openModal}
						closeModal={
							openProofRequestModel
						}
						onSucess={
							requestProof
						}
						requestId={requestId}
						userData={userData}
						view={view}
					/>
				</div>
			</div>
		</div> */}
