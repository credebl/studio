import type { IssueCredential } from '../common/enums';
import { apiRoutes } from '../config/apiRoutes';
import { storageKeys } from '../config/CommonConstant';
import { getHeaderConfigs } from '../config/GetHeaderConfigs';
import { axiosGet, axiosPost } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';

export const getIssuedCredentials = async (state: IssueCredential) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.Issuance.getIssuedCredentials}?orgId=${orgId}`;

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
    const url = `${apiRoutes.Issuance.getCredDefBySchemaId}?schemaId=${schemaId}&orgId=${orgId}`;
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
	const url = apiRoutes.Issuance.issueCredential;
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
