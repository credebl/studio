import { apiRoutes } from '../config/apiRoutes';
import { storageKeys } from '../config/CommonConstant';
import { getHeaderConfigs } from '../config/GetHeaderConfigs';
import { axiosDelete, axiosGet } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';
export interface IConnectionListAPIParameter {
	itemPerPage: number;
	page: number;
	search: string;
	sortBy: string;
	sortingOrder: string;
	filter?: string;
}

export const getConnectionsByOrg = async ({
	page,
	itemPerPage,
	search,
	sortBy,
	sortingOrder,
}: IConnectionListAPIParameter) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.getAllConnections}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`;

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


export const deleteConnectionRecords = async (
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.deleteConnections}`;

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

