import type { AxiosResponse } from 'axios';
import { getFromLocalStorage, setToLocalStorage } from '../api/Auth';
import { EcosystemRoles, OrganizationRoles } from '../common/enums';
import { apiStatusCodes, storageKeys } from './CommonConstant';
import { getEcosystems, getOrganizationById } from '../api/organization';
import { Roles } from '../utils/enums/roles';

export interface IOrgDetails {
	orgName: string;
	orgDid: string;
}
export interface ICheckEcosystem {
	isEnabledEcosystem: boolean;
	isEcosystemMember: boolean;
	isEcosystemLead: boolean;
	isMultiEcosystem: boolean;
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
const checkEcosystem = async (): Promise<ICheckEcosystem> => {
	await getEcosystemId();

	const userData = await getUserProfile();
	const role = await getEcosystemRole();

	const isEnabledEcosystem = userData?.enableEcosystem;
	const ecosystemRole = role || EcosystemRoles.ecosystemLead;

	const isMultiEcosystem = userData?.multiEcosystemSupport;

	const isLead = ecosystemRole === EcosystemRoles.ecosystemLead && isEnabledEcosystem

	return {
		isEnabledEcosystem,
		isMultiEcosystem,
		isEcosystemMember: !isLead && isEnabledEcosystem,
		isEcosystemLead: isLead,
	};
};

const ecosystemId = async () => {
	const id = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);
	return id;
};

const getEcosystemRole = async () => {
	const data = await getFromLocalStorage(storageKeys.ECOSYSTEM_ROLE);
	return data;
};

const getEcosystemId = async (): Promise<string> => {
	const ecoId = await ecosystemId();
	const ecoRole = await getEcosystemRole();
	const orgId = await getOrgId();
	if (!ecoId || !ecoRole) {
		try {
			if (orgId) {
				const { data } = (await getEcosystems(orgId)) as AxiosResponse;
				if (
					data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS &&
					data?.data?.ecosystemList?.length > 0
				) {
					const response = data?.data.ecosystemList[0];
					const id = response?.id;
					const role =
						response?.ecosystemOrgs &&
						response?.ecosystemOrgs.length > 0 &&
						response?.ecosystemOrgs[0]?.ecosystemRole?.name;
					await setToLocalStorage(storageKeys.ECOSYSTEM_ID, id);
					if (role) {
						await setToLocalStorage(storageKeys.ECOSYSTEM_ROLE, role);
					}
					return id;
				}
			}
		} catch (err) {
			console.log('ERROR-Get Ecosystem', err);
		}
	}
	return ecoId;
};

export {
	getOrgDetails,
	getUserRoles,
	getOwnerAdminRole,
	getEcosystemId,
	checkEcosystem
};
