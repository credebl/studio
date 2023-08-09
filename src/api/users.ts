import { apiRoutes } from '../config/apiRoutes';
import { axiosGet } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';
import { getHeaderConfigs } from '../config/GetHeaderConfigs';
import { storageKeys } from '../config/CommonConstant';

export const getUserActivity = async (limit: number) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.users.recentActivity}?limit=${limit}`;
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
