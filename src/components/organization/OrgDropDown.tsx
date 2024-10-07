import { apiStatusCodes, storageKeys } from '../../config/CommonConstant.ts';
import {
	getFromLocalStorage,
	removeFromLocalStorage,
	setToLocalStorage,
} from '../../api/Auth';
import { useEffect, useState } from 'react';
import '../../common/global.css';
import type { AxiosResponse } from 'axios';
import { BiChevronDown } from 'react-icons/bi';
import { AiOutlineSearch } from 'react-icons/ai';
import CustomAvatar from '../Avatar/index.tsx';
import type { IOrgInfo, Organisation } from './interfaces';
import { getOrganizations } from '../../api/organization.ts';
import { pathRoutes } from '../../config/pathRoutes.ts';

const OrgDropDown = () => {
	const [orgList, setOrgList] = useState<Organisation[]>([]);
	const [activeOrg, setActiveOrg] = useState<IOrgInfo>();
	const [input, setInput] = useState('');

	useEffect(() => {
		let getData: NodeJS.Timeout;
		if (input.length >= 1) {
			getData = setTimeout(() => {
				getAllorgs();
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getAllorgs();
		}
		return () => clearTimeout(getData);
	}, [input]);

	const getAllorgs = async () => {
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		const response = await getOrganizations(1, 20, input);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setOrgList(data?.data?.organizations);
			handleActiveOrg(data?.data?.organizations);
		}
	};

	const goToOrgDashboard = async (org: Organisation) => {
		await removeFromLocalStorage(storageKeys.ORG_INFO);
		await removeFromLocalStorage(storageKeys.ORG_DETAILS);

		if (org) { // Added check
			await setOrgRoleDetails(org);
			const roles: string[] = org?.userOrgRoles?.length > 0 ? org?.userOrgRoles?.map((role) => role?.orgRole?.name)
				: [];
			const { id, name, description, logoUrl } = org || {};
			const orgInfo = {
				name, description, logoUrl, roles, id
			};
			await setToLocalStorage(storageKeys.ORG_INFO, orgInfo);
			window.location.href = pathRoutes.organizations.dashboard;
		}
	};

	const setOrgRoleDetails = async (org: Organisation) => {
		if (org && org.id !== undefined && org.id !== null) { // Added check
			await setToLocalStorage(storageKeys.ORG_ID, org.id.toString());
		}
		const roles: string[] = org?.userOrgRoles?.length > 0
			? org?.userOrgRoles.map((role) => role?.orgRole?.name)
			: [];
		if (roles.length > 0) { // Added check
			await setToLocalStorage(storageKeys.ORG_ROLES, roles.toString());
		}
	};

	const handleActiveOrg = async (organizations: Organisation[]) => {
		let activeOrgDetails;
		const orgInfoDetails = await getFromLocalStorage(storageKeys.ORG_INFO);
		activeOrgDetails = orgInfoDetails ? JSON.parse(orgInfoDetails) : null;

		if (activeOrgDetails && Object.keys(activeOrgDetails)?.length > 0) {
			setActiveOrg(activeOrgDetails);
		} else if (organizations?.[0]) {
			activeOrgDetails = organizations?.[0];
			const roles: string[] = activeOrgDetails?.userOrgRoles?.map(
				(role: { orgRole: { name: string } }) => role.orgRole.name,
			);
			const { id, name, description, logoUrl } = organizations[0] || {};
			const orgInfo = {
				id, name, description, logoUrl, roles
			};
			await setToLocalStorage(storageKeys.ORG_INFO, orgInfo);

			setActiveOrg(activeOrgDetails);

			
				await setToLocalStorage(storageKeys.ORG_ROLES, roles?.toString());
		
		}
		if (activeOrgDetails) {
			await setOrgRoleDetails(activeOrgDetails);
		}
	};
	const redirectToCreateOrgModal = () => {
		window.location.href = '/organizations?orgModal=true';
	};

	return (
		<>
			<div
				id="dropdownUsersButton"
				data-dropdown-toggle="dropdownUsers"
				data-dropdown-placement="bottom"
				className="text-primary-700 flex justify-between text-lg h-fit sm:h-10 w-fit sm:w-56 bg-primary-100 hover:!bg-primary-200 dark:bg-primary-700 cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium 
				rounded-md text-sm px-1 py-1 sm:px-4 sm:py-2.5 text-center inline-flex items-center dark:hover:bg-primary-700 dark:focus:ring-blue-800"
			>
				{activeOrg ? (
					<div className="shrink-0 flex items-center w-6 sm:w-40 text-sm">
						{activeOrg.logoUrl ? (
							<CustomAvatar textSizeRatio={2.5} className='max-w-[100%] w-full h-full rounded-full font-sm ' size="25px" src={activeOrg?.logoUrl}  />
						) : (
							<CustomAvatar textSizeRatio={2.5} className='max-w-[100%] w-full h-full rounded-full font-sm' size="25px" name={activeOrg?.name}  />
						)}
						<span className="ml-2 text-sm text-primary-700 dark:text-white truncate hidden sm:block">
							{activeOrg?.name?.length > 20
								? activeOrg?.name?.substring(0, 20) + '...'
								: activeOrg?.name}
						</span>
					</div>
				) : (
					<span className="text-primary-700 dark:text-white hidden sm:block">
						Select organization
					</span>
				)}

				<BiChevronDown
					size={25}
					color="primary-700"
					className=" text-primary-700 dark:text-white"
				/>
			</div>
			<div
				id="dropdownUsers"
				className="z-10 hidden border border-gray-200 shadow-xl bg-gray-50 rounded-md shadow w-56 dark:bg-gray-700"
			>
				{
					<ul
						className="max-h-56 pb-2 overflow-y-auto text-gray-700 dark:text-gray-200 text-sm scrollbar scrollbar-w-3 scrollbar-thumb-rounded-[0.25rem] scrollbar-track-slate-200 scrollbar-thumb-gray-400 dark:scrollbar-track-gray-900 dark:scrollbar-thumb-gray-700"
						aria-labelledby="dropdownUsersButton"
					>
						<div className="w-full flex items-center sticky top-0 bg-white px-2 border dark:border-gray-500 rounded-t-md border-gray-100 dark:text-gray-200 dark:bg-gray-600 dark:hover:text-white">
							<AiOutlineSearch
								size={22}
								className="text-gray-700 dark:text-white"
							/>
							<input
								type="text"
								placeholder="Search organization"
								onChange={(e) => setInput(e.target.value)}
								className="placeholder:text-gray-500 dark:placeholder:text-white p-2 w-full outline-none dark:bg-gray-600"
							/>
						</div>
						{orgList?.length > 0 ? (
							orgList?.map((org) => {
								const roles: string[] = org.userOrgRoles.map(
									(role) => role.orgRole.name,
								);
								org.roles = roles;
								return (
									<li key={org?.id}>
										<button
											className="w-full"
											onClick={() => goToOrgDashboard(org)}
										>
											<a
												href="#"
												className="flex items-center w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
											>
												{org.logoUrl ? (
													<CustomAvatar
														className="dark:text-white max-w-[100%] w-full h-full rounded-full font-sm"
														size="35px"
														src={org?.logoUrl}
														textSizeRatio={2.5}
													/>
												) : (
													<CustomAvatar
														className=" dark:text-white max-w-[100%] w-full h-full rounded-full font-sm"
														size="35px"
														name={org?.name}
														textSizeRatio={2.5}
													/>
												)}

												<span className="ml-3 text-base text-start font-bold text-gray-500 dark:text-white word-break-word">
													{org.name.length > 25
														? org?.name.substring(0, 25) + '...'
														: org?.name}
												</span>
											</a>
										</button>
									</li>
								);
							})
						) : (
							<div className="text-black-100 text-sm text-center p-10">
								<span>No organizations found</span>
							</div>
						)}
					</ul>
				}
				<a
					href="#"
					className="flex items-center px-5 py-3 text-base font-medium text-primary-700 border-t border-gray-200 rounded-b-lg bg-gray-50 dark:border-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white hover:underline"
					onClick={redirectToCreateOrgModal}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="pr-2 dark:text-white"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
						/>
					</svg>
					Create Organization
				</a>
			</div>
		</>
	);
};

export default OrgDropDown;
