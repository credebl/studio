import { apiRoutes } from '../config/apiRoutes';
import { storageKeys } from '../config/CommonConstant';
import {
	getHeaderConfigs
} from '../config/GetHeaderConfigs';
import { axiosGet, axiosPost } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';
import type { IConnectionListAPIParameter } from './connection';

export const getIssuedCredentials = async ({page,
	itemPerPage,
	search,
	sortBy,
	sortingOrder}: IConnectionListAPIParameter) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.getIssuedCredentials}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`;
	
	const axiosPayload = {
		url,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const getCredentialDefinitions = async (schemaId: string) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getCredDefBySchemaId}/${schemaId}/cred-defs`;

	const axiosPayload = {
		url,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const issueCredential = async (data: object) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.issueCredential}`;
	const payload = data;

	const axiosPayload = {
		url,
		payload,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const issueOobEmailCredential = async (data: object) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.issueOobEmailCredential}`;
	const payload = data;

	const axiosPayload = {
		url,
		payload,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};
