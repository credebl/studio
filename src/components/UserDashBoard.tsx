import type { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { getUserInvitations } from "../api/invitations";
import { getOrganizations } from "../api/organization";
import { apiStatusCodes } from "../config/CommonConstant";
import { pathRoutes } from "../config/pathRoutes";
import { AlertComponent } from "./AlertComponent";
import type { Organisation } from "./organization/interfaces";
import CustomAvatar from '../components/Avatar'

const initialPageState = {
	pageNumber: 1,
	pageSize: 10,
	total: 0,
};

const UserDashBoard = () => {

	const [message, setMessage] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const [loading, setLoading] = useState<boolean>(false)
	const [organizationsList, setOrganizationList] = useState<Array<Organisation> | null>(null)


	const getAllInvitations = async () => {

		setLoading(true)
		const response = await getUserInvitations(currentPage.pageNumber, currentPage.pageSize, '');
		const { data } = response as AxiosResponse

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

			const totalPages = data?.data?.totalPages;

			const invitationList = data?.data?.invitations

			if (invitationList.length > 0) {
				setMessage('You have some pending received invitations')
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


	useEffect(() => {
		getAllInvitations()
		getAllOrganizations()
	}, [])

	const redirectToInvitations = () => {
		window.location.href = pathRoutes.users.invitations
	}

	return (
		<div className="px-4 pt-6">
			<div className="cursor-pointer" onClick={redirectToInvitations}>
				<AlertComponent
					message={message ? message : error}
					type={message ? 'warning' : 'failure'}
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
					<div className="w-full">
						<h2 className="text-base font-bold text-gray-500 dark:text-gray-400">
							Organizations
						</h2>

						{
							organizationsList
							&& organizationsList.map(org => {
								return <div className="pt-4 flex">

									{(org.logoUrl) ? <CustomAvatar size='30' src={org.logoUrl} /> : <CustomAvatar size='30' name={org.name} />}

									<h3 className="pl-2.5"> {org.name}</h3>
								</div>
							})
						}


						<a
							href="/organizations"
							className="float-right inline-flex items-center p-2 text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
						>
							View More..
						</a>

					</div>

				</div>
				<div
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

				</div>
				<div
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
				</div>
			</div>

			{/* 2 columns */}
			<div className="">
				{/* Activity Card */}
				<div
					className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 xl:mb-0"
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="pl-12 text-lg font-semibold text-gray-900 dark:text-white">
							Recent Activity
						</h3>
						<a
							href="#"
							className="inline-flex items-center p-2 text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
						>
							View all
						</a>
					</div>
					<ol className="relative border-l pl-8 border-gray-200 dark:border-gray-700">
						<li className="mb-10 ml-4">
							<div
								className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-800 dark:bg-gray-700"
							>
							</div>
							<time
								className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
							>April 2023</time
							>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Application UI design in Figma
							</h3>
							<p
								className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400"
							>
								Get access to over 20+ pages including a dashboard layout, charts,
								kanban board, calendar, and pre-order E-commerce & Marketing pages.
							</p>

						</li>
						<li className="mb-10 ml-4">
							<div
								className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-800 dark:bg-gray-700"
							>
							</div>
							<time
								className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
							>March 2023</time
							>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Marketing UI code in Flowbite
							</h3>
							<p
								className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400"
							>
								Get started with dozens of web components and interactive elements
								built on top of Tailwind CSS.
							</p>

						</li>
						<li className="mb-10 ml-4">
							<div
								className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-800 dark:bg-gray-700"
							>
							</div>
							<time
								className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
							>February 2023</time
							>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Marketing UI design in Figma
							</h3>
							<p className="text-base font-normal text-gray-500 dark:text-gray-400">
								Get started with dozens of web components and interactive elements
								built on top of Tailwind CSS.
							</p>
						</li>
					</ol>
				</div>

			</div>

		</div>

	)
}
export default UserDashBoard;