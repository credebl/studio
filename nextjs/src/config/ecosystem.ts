'use client';

import type { AxiosResponse } from 'axios';
import { EcosystemRoles } from '@/features/common/enum';
import { apiStatusCodes, storageKeys } from './CommonConstant';

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

// Helpers

const getOrgData = async (): Promise<string | null> => {
//   return getFromLocalStorage(storageKeys.ORG_DETAILS);
const orgData = null;
  return orgData ? JSON.parse(orgData) : null;
};

const getOrgId = async (): Promise<string | null> => {
//   return getFromLocalStorage(storageKeys.ORG_ID);
const orgId = null;
  return orgId ? JSON.parse(orgId) : null;
};

const getUserProfile = async (): Promise<any> => {
  try {
    // const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE);
	const userProfile = null;
    return userProfile ? JSON.parse(userProfile) : null;
  } catch {
    return null;
  }
};

const getUserRoles = async (): Promise<string[]> => {
//   const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
const orgRoles = null;
  return orgRoles ? orgRoles.split(',') : [];
};

const getOwnerAdminRole = async (onlyOwner?: boolean): Promise<boolean> => {
  const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
  if (!orgRoles) return false;

  const includesOwner = orgRoles.includes(OrganizationRoles.organizationOwner);
  const includesAdmin = orgRoles.includes(OrganizationRoles.organizationAdmin);

  return onlyOwner ? includesOwner : includesOwner || includesAdmin;
};

const getOrgDetails = async (): Promise<IOrgDetails | null> => {
  const orgId = await getOrgId();
  const org = await getOrgData();

  if (org) {
    const orgData: IOrgDetails = JSON.parse(org);
    if (orgData?.orgDid) return orgData;
  }

  if (!orgId) return null;

  try {
    const { data } = (await getOrganizationById(orgId)) as AxiosResponse;
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const orgData: IOrgDetails = {
        orgName: data?.data?.name,
        orgDid: data?.data?.org_agents?.[0]?.orgDid || ''
      };

    //   await setToLocalStorage(storageKeys.ORG_DETAILS, JSON.stringify(orgData));
      return orgData;
    }
  } catch (err) {
    console.error('ERROR - Get ORG Details', err);
  }

  return null;
};

// Ecosystem Helpers

const getEcosystemId = async (): Promise<string | null> => {
//   const cachedId = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);
//   const cachedRole = await getFromLocalStorage(storageKeys.ECOSYSTEM_ROLE);
const cachedId = null;
const cachedRole = null;
  const orgId = await getOrgId();

  if (cachedId && cachedRole) return cachedId;

  if (!orgId) return null;

  try {
    const { data } = (await getEcosystems(orgId)) as AxiosResponse;
    const list = data?.data?.ecosystemList;

    if (
      data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS &&
      list?.length > 0
    ) {
      const ecosystem = list[0];
      const id = ecosystem?.id;
      const role = ecosystem?.ecosystemOrgs?.[0]?.ecosystemRole?.name;

    //   if (id) await setToLocalStorage(storageKeys.ECOSYSTEM_ID, id);
    //   if (role) await setToLocalStorage(storageKeys.ECOSYSTEM_ROLE, role);

      return id;
    }
  } catch (err) {
    console.error('ERROR - Get Ecosystem', err);
  }

  return cachedId;
};

const getEcosystemRole = async (): Promise<string | null> => {
//   return getFromLocalStorage(storageKeys.ECOSYSTEM_ROLE);
const ecosystemRole = null;
  return ecosystemRole ? JSON.parse(ecosystemRole) : null;
};

const checkEcosystem = async (): Promise<ICheckEcosystem> => {
  await getEcosystemId(); // Ensures values are populated
  const userData = await getUserProfile();
  const role = await getEcosystemRole();

  const isEnabled = !!userData?.enableEcosystem;
  const isMulti = !!userData?.multiEcosystemSupport;

  const isLead = role === EcosystemRoles.ecosystemLead && isEnabled;

  return {
    isEnabledEcosystem: isEnabled,
    isMultiEcosystem: isMulti,
    isEcosystemMember: !isLead && isEnabled,
    isEcosystemLead: isLead
  };
};

export {
  getOrgDetails,
  getUserRoles,
  getOwnerAdminRole,
  getEcosystemId,
  checkEcosystem,
  getUserProfile
};
