import type { IssueCredential } from '../common/enums';
import { apiRoutes } from '../config/apiRoutes';
import { storageKeys } from '../config/CommonConstant';
import { getHeaderConfigs } from '../config/GetHeaderConfigs';
import { axiosGet, axiosPost } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';
import type { IConnectionListAPIParameter } from './connection';

export const verifyCredential = async (payload: any) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.verifyCredential}`;
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
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.verifyCredential}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortByValue=${sortingOrder}&sorting=${sortBy}`;

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

export const verifyPresentation = async (proofId:string) => {
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


export const getProofAttributes=async (proofId:string, orgId: string)=>{
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.proofRequestAttributesVerification}/${proofId}/form`;
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
}

export const getCredentialDefinitionsForVerification = async (schemaId: string) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url= `${apiRoutes.Verification.verificationCredDef}/${schemaId}`;

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
