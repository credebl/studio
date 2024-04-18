import type { SchemaTypes } from '../common/enums';
import { apiRoutes } from '../config/apiRoutes';
import { storageKeys } from '../config/CommonConstant';
import {
	getHeaderConfigs,
	getHeaderConfigsForFormData,
} from '../config/GetHeaderConfigs';
import { axiosGet, axiosPost } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';
import type { IConnectionListAPIParameter } from './connection';

export const getSchemaCredDef = async (schemaType: SchemaTypes) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.bulk.credefList}?schemaType=${schemaType}`;
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

export const DownloadCsvTemplate = async (templateId: string, schemaType: SchemaTypes) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.download}`;

	const axiosPayload = {
		url,
		payload: {
			templateId,
			schemaType
		},
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const uploadCsvFile = async (
	payload: { file: Uint8Array | Blob; fileName: string },
	templateId: string,
	schemaType: SchemaTypes
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.bulk.uploadCsv}?templateId=${templateId}&schemaType=${schemaType}`;

	const axiosPayload = {
		url,
		payload: payload,
		config: await getHeaderConfigsForFormData(),
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const getCsvFileData = async (
	requestId: any,
	pageNumber: number,
	pageSize: number,
	search: string,
) => {
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

export const issueBulkCredential = async (
	requestId: string,
	clientId: string,
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}/${requestId}${apiRoutes.Issuance.bulk.bulk}`;

	const axiosPayload = {
		url,
		config: await getHeaderConfigs(),
		payload: {
			clientId,
		},
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const retryBulkIssuance = async (fileId: string, clientId: string) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}/${fileId}${apiRoutes.Issuance.bulk.retry}`;

	const axiosPayload = {
		url,
		payload: { clientId: clientId },
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const getFilesHistory = async ({
	page,
	itemPerPage,
	search,
	sortBy,
	sortingOrder,
}: IConnectionListAPIParameter) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.bulk.files}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`;

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

export const getFilesDataHistory = async (
	requestId: string,
	itemPerPage: number,
	page: number,
	search: string,
	sortingOrder: string,
	sortBy: string,
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}/${requestId}${apiRoutes.Issuance.bulk.filesData}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortBy=${sortBy}&sortField=${sortingOrder}`;

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
