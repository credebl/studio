import type { AxiosResponse } from 'axios';
import { getFromLocalStorage, setToLocalStorage } from '../api/Auth';
import { OrganizationRoles } from '../common/enums';
import { apiStatusCodes, storageKeys } from './CommonConstant';
import { getOrganizationById } from '../api/organization';
import { Roles } from '../utils/enums/roles';

export interface IOrgDetails {
	orgName: string;
	orgDid: string;
}
const getOrgData = async () => {
	const data = await getFromLocalStorage(storageKeys.ORG_DETAILS);
	return data;
};
const getOrgId = async () => {
	const id = await getFromLocalStorage(storageKeys.ORG_ID);
	return id;
};

export const getUserProfile = async () => {
	try {
		const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE);
		const userDetails = userProfile && (await JSON.parse(userProfile));
		return userDetails;
	} catch (err) {

	}
};

const getUserRoles = async () => {
	const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
	const roles = orgRoles.split(',');
	return roles;
};

const getOwnerAdminRole = async (props?: string) => {
	const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
	if (props) {
		const roles = orgRoles.includes(OrganizationRoles.organizationOwner);
		return roles;
	} else {
		const roles =
			orgRoles.includes(OrganizationRoles.organizationOwner) ||
			orgRoles.includes(OrganizationRoles.organizationAdmin);
		return roles;
	}
};

const getOrgDetails = async (): Promise<IOrgDetails> => {
	const orgId = await getOrgId();
	const org = await getOrgData();
	const orgData: IOrgDetails = org && JSON.parse(org);
	const isOrgData = Object.keys(orgData).length > 0;
	const isOrgDid = orgData?.orgDid;
	if (!isOrgData || !isOrgDid) {
		try {
			if (orgId) {
				const { data } = (await getOrganizationById(orgId)) as AxiosResponse;

				if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
					const orgData: IOrgDetails = {
						orgName: data?.data?.name,
						orgDid:
							data?.data && data?.data?.org_agents?.length > 0
								? data?.data?.org_agents[0]?.orgDid
								: '',
					};
					await setToLocalStorage(
						storageKeys.ORG_DETAILS,
						JSON.stringify(orgData),
					);
					return orgData;
				}
			}
		} catch (err) {
			console.log('ERROR-Get ORG Details', err);
		}
	}
	return orgData;
};

export {
	getOrgDetails,
	getUserRoles,
	getOwnerAdminRole,
};
