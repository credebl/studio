import { apiRoutes } from '../config/apiRoutes';
import { axiosGet, axiosPut } from '../services/apiRequests';
import { getFromLocalStorage } from './Auth';
import { getHeaderConfigs } from '../config/GetHeaderConfigs';
import { storageKeys } from '../config/CommonConstant';

export interface IPlatformSetting {
	externalIp: string;
	lastInternalId: string;
	sgApiKey: string;
	emailFrom: string;
	apiEndPoint: string;
	enableEcosystem: boolean;
	multiEcosystemSupport: boolean;
}

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

export const getPlatformSettings = async (token: string) => {
	const url = `${apiRoutes.users.platformSettings}`;
	console.log(65658, token)
	const axiosPayload = {
		url,
		config: {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		},
	};

	console.log(6565, axiosPayload)

	try {
		return await axiosGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const updatePlatformSettings = async (payload: IPlatformSetting) => {
	const url = `${apiRoutes.users.platformSettings}-check`;
	const axiosPayload = {
		url,
		config: await getHeaderConfigs(),
		payload
	};

	try {
		return await axiosPut(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};
