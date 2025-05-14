import { SchemaTypes } from "@/common/enums";
import { apiRoutes } from "@/config/apiRoutes";
import { getHeaderConfigs } from "@/config/GetHeaderConfigs";
import { axiosGet, axiosPost } from "@/services/apiRequests";

export const getSchemaCredDef = async (schemaType: SchemaTypes,orgId:string) => {
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

export const DownloadCsvTemplate = async (templateId: string, schemaType: SchemaTypes, orgId: string) => {
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