import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import { BiChevronDown } from "react-icons/bi";
import CustomAvatar from '../Avatar'
import type { Organisation } from './interfaces'
import { getOrganizations } from '../../api/organization';
import { pathRoutes } from '../../config/pathRoutes';

const OrgDropDown = () => {
	const [orgList, setOrgList] = useState<Organisation[]>([]);
	const [activeOrg, setactiveOrg] = useState<Organisation | null>(null)
	


	useEffect(() => {
		getAllorgs()
	}, []);

	const getAllorgs = async () => {
		const response = await getOrganizations(1, 10, '');
		const { data } = response as AxiosResponse;
		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			setOrgList(data?.data?.organizations);
			setActiveOrg(data?.data?.organizations)
		} else {
			console.log("data?.data?.organizations")
		}
	};

	const goToOrgDashboard = async (orgId: number, roles: string[]) => {
		await setToLocalStorage(storageKeys.ORG_ID, orgId.toString());
		window.location.href = pathRoutes.organizations.dashboard;
	};

	const setActiveOrg = async (organizations: Organisation[]) => {
		
		let activeOrg: Organisation | null = null

		const orgId = await getFromLocalStorage(storageKeys.ORG_ID)
		if (orgId) {
			activeOrg = organizations?.find(org => org.id === Number(orgId)) as Organisation
			setactiveOrg(activeOrg || null)
			await setToLocalStorage(storageKeys.ORG_ID, orgId.toString());
		} else {
			activeOrg = organizations && organizations[0]
			setactiveOrg(activeOrg || null)
			await setToLocalStorage(storageKeys.ORG_ID, activeOrg.id.toString());

		}

		const roles: string[] = activeOrg?.userOrgRoles.map(role => role.orgRole.name)
		activeOrg.roles = roles

		await setToLocalStorage(storageKeys.ORG_ROLES, roles.toString());

	}

	const redirectToCreateOrgModal = () => {
		window.location.href = '/organizations?orgModal=true';
		
	}

	return (
		<>
			<div
				id="dropdownUsersButton"
				data-dropdown-toggle="dropdownUsers"
				data-dropdown-placement="bottom"
				className="text-primary-700 text-lg h-10 bg-primary-50 cursor-pointer focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium 
					rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
			>

				<>
					{
						activeOrg ?
							<>
								{activeOrg.logoUrl ? (
									<CustomAvatar size="20" src={activeOrg?.logoUrl} round />
								) : (
									<CustomAvatar size="20" name={activeOrg?.name} round />
								)}
								<text className="ml-2">{activeOrg?.name}</text>
							</>
							:
							<text>
								Select organization
							</text>
					}
				</>

				<BiChevronDown size={25} color='white' />
			</div>
			<div
				id="dropdownUsers"
				className="z-10 hidden border border-gray-200 shadow-xl bg-gray-50 rounded-lg shadow w-60 dark:bg-gray-700"
			>
				{orgList?.length > 0 ? (
					<ul
						className="max-h-48 py-2 overflow-y-auto text-gray-700 dark:text-gray-200 text-sm"
						aria-labelledby="dropdownUsersButton"
					>
						{orgList?.map((org) => {
							const roles: string[] = org.userOrgRoles.map(role => role.orgRole.name)
							org.roles = roles
							return (
								<li key={org?.id} onClick={() => goToOrgDashboard(org?.id, org?.roles)}>
									<a
										href="#"
										className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
									>
										{org.logoUrl ? (
											<CustomAvatar size="25" src={org?.logoUrl} round />
										) : (
											<CustomAvatar size="25" name={org?.name} round />
										)}

										<text className="ml-3">{org?.name}</text>
									</a>
								</li>
							)
						})
						}
					</ul>
				) : (
					<div className="text-black-100 text-sm text-center p-10">
						<text>No organizations found</text>
					</div>
				)}

				<a
					href="#"
					className="flex items-center p-3 text-sm font-medium text-primary-700 border-t border-gray-200 rounded-b-lg bg-gray-50 dark:border-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-blue-500 hover:underline"
					onClick={redirectToCreateOrgModal}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className='pr-2' width="20" height="20" fill="none" viewBox="0 0 24 24">
  <path fill="#1F4EAD" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"/>
</svg>


					Create Organization
				</a>
			</div>
		</>
	);
};

export default OrgDropDown;
