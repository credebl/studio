import type { IssueCredential, RequestType } from '../common/enums';
import { apiRoutes } from '../config/apiRoutes';
import { storageKeys } from '../config/CommonConstant';
import { getHeaderConfigs } from '../config/GetHeaderConfigs';
import { axiosDelete, axiosGet, axiosPost } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';
import type { IConnectionListAPIParameter } from './connection';

export const verifyCredential = async (payload: object, requestType:RequestType) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.verifyCredential}?requestType=${requestType}`;
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

export const createOobProofRequest = async (payload: object, requestType: RequestType) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.oobProofRequest}?requestType=${requestType}`;
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

export const getVerificationCredential = async (state: IssueCredential) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.Issuance.getIssuedCredentials}?orgId=${orgId}&state=${state}`;
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

export const getVerificationList = async ({
	page,
	itemPerPage,
	search,
	sortBy,
	sortingOrder,
}: IConnectionListAPIParameter) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.verifyCredential}?pageSize=${itemPerPage}&pageNumber=${page}&search=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`;

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

export const verifyPresentation = async (proofId: string) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.presentationVerification}/${proofId}/verify`;
	const axiosPayload = {
		url,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};


export const getVerifiedProofDetails=async (proofId:string, orgId: string)=>{
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.proofRequestAttributesVerification}/${proofId}`;
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

export const getCredentialDefinitionsForVerification = async (
	schemaId: string,
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.Verification.verificationCredDef}/${schemaId}`;

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

export const deleteVerificationRecords = async (
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.deleteVerifications}`;

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
