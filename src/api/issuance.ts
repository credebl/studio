import axios from 'axios';
import { apiRoutes } from '../config/apiRoutes';
import { storageKeys } from '../config/CommonConstant';
import {
	getHeaderConfigs,
	getHeaderConfigsForFormData,
} from '../config/GetHeaderConfigs';
import { axiosGet, axiosPost } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';

export const getIssuedCredentials = async () => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.getIssuedCredentials}`;

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

// bulk issuance

// upload file

export const uploadCsvFile = async (payload: any) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const credefId = await getFromLocalStorage(storageKeys.CRED_DEF_ID);

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.bulk.uploadCsv}?credDefId=${credefId}`;

	// const token = await getFromLocalStorage(storageKeys.TOKEN);
console.log("urlurl3434",url);

	// const res = await axios.post('https://devapi.credebl.id/orgs/37/bulk/upload?credDefId=HkgC8NwFPw3Bt6hmzSsBnG%3A3%3ACL%3A97433%3Apan%20card%206nf8g7g5', {
	// 	body: formData,
	// 	headers: {
	// 		'Authorization': `Bearer ${token}`,
	// 	},
	// })
// 	if(url){	const res = await axios.post(url, formData, {
//   headers: {
//     'Authorization': `Bearer ${token}`,
//   },
// });}
	// .then((res) => res.json());
// const data= JSON.stringify(formData)
	const axiosPayload = {
		url,
		payload ,
		config: await getHeaderConfigsForFormData()
	};
	console.log('axiosPayload', axiosPayload);

	try {
		await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

//get file data

export const getCsvFileData = async (
	requestId: any,
	pageNumber: number,
	pageSize: number,
	search: string,
) => {
	// https://devapi.credebl.id/orgs/37/sfdefsaacdas/preview?pageNumber=1&pageSize=10
	// const url = `${apiRoutes.Ecosystem.root}/${ecosystemId}/${orgId}${apiRoutes.Ecosystem.members}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;
	//
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}/${requestId}${apiRoutes.Issuance.bulk.preview}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;

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
