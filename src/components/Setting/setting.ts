import { getFromLocalStorage } from "../../api/Auth";
import { storageKeys } from "../../config/CommonConstant";
import { getHeaderConfigs } from "../../config/GetHeaderConfigs";
import { apiRoutes } from "../../config/apiRoutes";
import { axiosGet, axiosPost } from "../../services/apiRequests";

export const getCredentials = async () => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.setting.setting}`;

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

export const createCredentials = async () => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.setting.setting}`;

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
