import { useEffect, useState } from "react";

import { AlertComponent } from "../AlertComponent";
import type { AxiosResponse } from "axios";
import CustomAvatar from '../Avatar'
import { EmptyListMessage } from "../EmptyListComponent";
import type { Organisation } from "../organization/interfaces";
import type { UserActivity } from "./interfaces";
import { apiStatusCodes, storageKeys } from "../../config/CommonConstant";
import { getOrganizations } from "../../api/organization";
import { getUserActivity } from "../../api/users";
import { getUserInvitations } from "../../api/invitations";
import { pathRoutes } from "../../config/pathRoutes";
import { setToLocalStorage } from "../../api/Auth";
import { dateConversion } from "../../utils/DateConversion";
import DateTooltip from "../Tooltip";

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

const UserDashBoard = () => {

	const [message, setMessage] = useState<string | null>(null)
	const [viewButton, setViewButton] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [loading, setLoading] = useState<boolean>(false)
	const [organizationsList, setOrganizationList] = useState<Array<Organisation> | null>(null)
	const [activityList, setActivityList] = useState<Array<UserActivity> | null>(null)

	const getAllInvitations = async () => {

		setLoading(true)
		const response = await getUserInvitations(currentPage.pageNumber, currentPage.pageSize, '');
		const { data } = response as AxiosResponse

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

			const totalPages = data?.data?.totalPages;

			const invitationList = data?.data?.invitations

			if (invitationList.length > 0) {
				setMessage('You have some pending received invitations')
				setViewButton(true)
			}

			setCurrentPage({
				...currentPage,
				total: totalPages
			})
		} else {
			setError(response as string)
		}

		setLoading(false)
	}

	//Fetch the user organization list
	const getAllOrganizations = async () => {

		setLoading(true)
		const response = await getOrganizations(currentPage.pageNumber, currentPage.pageSize, '');
		const { data } = response as AxiosResponse

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

			const totalPages = data?.data?.totalPages;

			const orgList = data?.data?.organizations.filter((userOrg: Organisation, index: number) => index < 3)

			setOrganizationList(orgList)
			setCurrentPage({
				...currentPage,
				total: totalPages
			})
		} else {
			setError(response as string)
		}

		setLoading(false)
	}


	//Fetch the user recent activity
	const getUserRecentActivity = async () => {

		setLoading(true)
		const response = await getUserActivity(5);
		const { data } = response as AxiosResponse

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

			const activityList = data?.data;

			setActivityList(activityList);

		} else {
			setError(response as string)
		}

		setLoading(false)
	}



	useEffect(() => {
		getAllInvitations()
		getAllOrganizations()
		getUserRecentActivity()
	}, [])

	const redirectToInvitations = () => {
		window.location.href = pathRoutes.users.invitations
	}

	const goToOrgDashboard = async (orgId: number, roles: string[]) => {
		await setToLocalStorage(storageKeys.ORG_ID, orgId.toString());
		window.location.href = pathRoutes.organizations.dashboard;
	};

	return (
		<div className="px-4 pt-6">
			<div className="cursor-pointer" onClick={redirectToInvitations}>
				<AlertComponent
					message={message ? message : error}
					type={message ? 'warning' : 'failure'}
					viewButton={viewButton}
					onAlertClose={() => {
						setMessage(null)
						setError(null)
					}}
				/>
			</div>

			<div
				className="grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3"
			>

				<div
					className=" justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
				<div className="w-full" >
						<h2 className="text-base font-bold text-gray-500 dark:text-gray-400">
							Organizations
						</h2>

						{/* {
							organizationsList
							&& organizationsList.map(org => {
								return <div className="pt-4 flex">

									{(org.logoUrl) ? <CustomAvatar size='30' src={org.logoUrl} /> : <CustomAvatar size='30' name={org.name} />}

									<h3 className="pl-2.5 text-lg font-semibold text-gray-900 dark:text-white">
										{org.name}
									</h3>

								</div>
							})
						} */}
						

							{organizationsList?.map((org) => {
							const roles: string[] = org.userOrgRoles.map(role => role.orgRole.name)
							org.roles = roles
							return (
								<div onClick={() => goToOrgDashboard(org?.id, org?.roles)}>
									<a
										href="#"
										className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
									>
										{org.logoUrl ? (
											<CustomAvatar className='dark:text-white' size="25" src={org?.logoUrl} round />
										) : (
											<CustomAvatar className='dark:text-white' size="25" name={org?.name} round />
										)}

										<span className="ml-3 text-base font-bold text-gray-500 dark:text-white">{org?.name}</span>
									</a>
								</div>
							)
						})
						}

						{
							organizationsList && organizationsList?.length > 0 && (
								<a
							href="/organizations"
							className="float-right inline-flex items-center p-2 text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
						>
							View More..
						</a>
							)}
					</div>

				</div>
				{/* <div
					className="justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
					<div className="w-full">
						<h3 className="text-base font-bold text-gray-500 dark:text-gray-400">
							Ecosystems
						</h3>
						<h1
							className="w-100 mt-8 text-center p-2 text-xl font-medium rounded-lg text-primary-700 dark:text-primary-500 dark:hover:bg-gray-700"
						>Coming Soon..</h1>
					</div>
						
				</div> */}

				{/* <div
					className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
					<div className="w-full">
						<h3 className="mb-2 text-base font-bold text-gray-500 dark:text-gray-400">
							DID Methods
						</h3>

						<h1
							className="w-100 mt-8 text-center p-2 text-xl font-medium rounded-lg text-primary-700 dark:text-primary-500 dark:hover:bg-gray-700"
						>Coming Soon..</h1>
					</div>
					<div id="traffic-channels-chart" className="w-full"></div>
				</div> */}
			</div>

			<div className="">
				<div
					className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 xl:mb-0"
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="pl-12 text-lg font-semibold text-gray-900 dark:text-white">
							Recent Activity
							{
								activityList && activityList?.length===0 && (
									<div className="px-2 py-1 text-black-800  text-xs">
										Looks like there are no activities to display at the moment.
									</div>
								)
							}
						</h3> 
					</div>
					{
						activityList
							? <ol className="relative border-l pl-8 border-gray-200 dark:border-gray-700">
								{
									activityList
									&& activityList.map(activity => {
										return <li className="mb-10 ml-4">
											<div
												className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-800 dark:bg-gray-700"
											>
											</div>
											<time
												className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
											>
												<DateTooltip date={activity.createDateTime}>
												{dateConversion(activity.createDateTime)}
												</DateTooltip>
											</time>
											<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
												{activity.action}
											</h3>
											<p
												className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400"
											>
												{activity.details}
											</p>

										</li>
									})
								}

							</ol>
							: activityList && (<EmptyListMessage
								message={'No Users activity'}
								description={'Get started by creating a new Organization'}
								svgComponent={<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
									<path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
								</svg>} />)

					}

				</div>

			</div>

		</div>

	)
}
export default UserDashBoard;