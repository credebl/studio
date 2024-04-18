import type { CredentialType, SchemaType } from '../common/enums';
import { apiRoutes } from '../config/apiRoutes';
import { storageKeys } from '../config/CommonConstant';
import {
	getHeaderConfigs
} from '../config/GetHeaderConfigs';
import { axiosDelete, axiosGet, axiosPost } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';
import type { IConnectionListAPIParameter } from './connection';

export const getIssuedCredentials = async ({page,
	itemPerPage,
	search,
	sortBy,
	sortingOrder,
filter}: IConnectionListAPIParameter) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.getIssuedCredentials}?pageSize=${itemPerPage}&pageNumber=${page}&search=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`;
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

export const issueCredential = async (data: object, credentialType:SchemaType) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.issueCredential}?credentialType=${credentialType}`;
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

export const issueOobEmailCredential = async (data: object, credentialType:CredentialType) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.issueOobEmailCredential}?credentialType=${credentialType}`;
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



export const deleteIssuanceRecords = async (
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.deleteIssaunce}`;

	const axiosPayload = {
		url,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosDelete(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};