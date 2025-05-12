import { axiosGet, axiosPost, axiosPut, ecosystemAxiosPost } from '@/services/apiRequests';

import { AxiosResponse } from 'axios';
import { GetAllSchemaListParameter } from '@/features/organization/connectionIssuance/type/SchemaCard';
import { SchemaType } from '@/common/enums';
import { apiRoutes } from '@/config/apiRoutes';
import { getHeaderConfigs } from '@/config/GetHeaderConfigs';

export interface IConnectionListAPIParameter {
	itemPerPage: number;
	page: number;
	search: string;
	sortBy: string;
	sortingOrder: string;
	orgId:string;
	filter?: string;
}

export const issueCredential = async (data: object, credentialType: SchemaType,orgId:string) => {
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.issueCredential}?credentialType=${credentialType}`;
	const payload = data;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
	const axiosPayload = {
		url,
		payload,
		config	
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const getIssuedCredentials = async ({page,
	itemPerPage,
	search,
	sortBy,
	sortingOrder,
	orgId,
filter}: IConnectionListAPIParameter) => {
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
