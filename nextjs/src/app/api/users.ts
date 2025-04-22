
import { getHeaderConfigs } from "@/config/GetHeaderConfigs";
import { axiosGet, axiosPut } from "@/services/apiRequests";
import apiRoutes from "./apiRoutes";

export interface IPlatformSetting {
	externalIp: string;
	lastInternalId: string;
	sgApiKey: string;
	emailFrom: string;
	apiEndPoint: string;
}

export const getUserActivity = async (limit: number) => {
	// const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
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

export const getPlatformSettings = async () => {
	const url = `${apiRoutes.users.platformSettings}`;
	const axiosPayload = {
		url,
		config: await getHeaderConfigs()
	};

	try {
		return await axiosGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const updatePlatformSettings = async (payload: IPlatformSetting) => {
	const url = `${apiRoutes.users.platformSettings}`;
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
