import type { IssueCredential } from '../common/enums';
import { apiRoutes } from '../config/apiRoutes';
import { storageKeys } from '../config/CommonConstant';
import { getHeaderConfigs } from '../config/GetHeaderConfigs';
import { axiosGet } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';

export const getIssuedCredentials = async (state: IssueCredential) => {
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
