import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
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
import CustomAvatar from '../Avatar';
import type { Organisation } from './interfaces';
import { getOrganizations } from '../../api/organization';
import { pathRoutes } from '../../config/pathRoutes';
interface Iorg {
	name: string;
	logoUrl: string;
}
const OrgDropDown = () => {
	const [orgList, setOrgList] = useState<Organisation[]>([]);
	const [activeOrg, setactiveOrg] = useState<Iorg>();
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
		const response = await getOrganizations(1, 20, input);
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setOrgList(data?.data?.organizations);
			setActiveOrg(data?.data?.organizations);
		}
	};

	const goToOrgDashboard = async (org: Organisation) => {
		await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID);
		await removeFromLocalStorage(storageKeys.ECOSYSTEM_ROLE);
		await removeFromLocalStorage(storageKeys.ORG_DETAILS);

		await setOrgRoleDetails(org);
		await setToLocalStorage(storageKeys.ORG_DETAILS, org);
		window.location.href = pathRoutes.organizations.dashboard;
	};

	const setOrgRoleDetails = async (org: Organisation) => {
		await setToLocalStorage(storageKeys.ORG_ID, org.id.toString());
		const roles: string[] = org?.userOrgRoles.map((role) => role.orgRole.name);

		await setToLocalStorage(storageKeys.ORG_ROLES, roles.toString());
	};

	const setActiveOrg = async (organizations: Iorg[]) => {
		let activeOrg = null;

		activeOrg = await getFromLocalStorage(storageKeys.ORG_DETAILS);

		if (activeOrg) {
			setactiveOrg(JSON.parse(activeOrg));
		} else {
			activeOrg = organizations && organizations[0];
			await setToLocalStorage(storageKeys.ORG_DETAILS, organizations[0]);

			setactiveOrg(activeOrg);
			const roles: string[] = activeOrg?.userOrgRoles.map(
				(role: { orgRole: { name: string } }) => role.orgRole.name,
			);
			await setToLocalStorage(storageKeys.ORG_ROLES, roles.toString());
		}

		if (activeOrg) {
			await setOrgRoleDetails(activeOrg);
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
				className="text-primary-700 flex justify-between text-lg h-10 w-56 bg-primary-100 hover:!bg-primary-200 dark:bg-primary-700 cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium 
					rounded-md text-sm px-4 py-2.5 text-center inline-flex items-center dark:hover:bg-primary-700 dark:focus:ring-blue-800"
			>
				{activeOrg ? (
					<>
						<div className="shrink-0 flex items-center w-40">
							{activeOrg.logoUrl ? (
								<CustomAvatar size="20" src={activeOrg?.logoUrl} round />
							) : (
								<CustomAvatar size="20" name={activeOrg?.name} round />
							)}
							<text className="ml-2 text-primary-700 dark:text-white truncate">
								{activeOrg?.name?.length > 20
									? activeOrg?.name?.substring(0, 20) + '...'
									: activeOrg?.name}
							</text>
						</div>
					</>
				) : (
					<text className="text-primary-700 dark:text-white">
						Select organization
					</text>
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
								placeholder="Enter organization name"
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
														className="shrink-0 dark:text-white"
														size="25"
														src={org?.logoUrl}
														round
													/>
												) : (
													<CustomAvatar
														className="shrink-0 dark:text-white"
														size="25"
														name={org?.name}
														round
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
								<text>No organizations found</text>
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
