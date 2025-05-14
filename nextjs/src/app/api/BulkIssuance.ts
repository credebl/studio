import { SchemaTypes } from "@/common/enums";
import { apiRoutes } from "@/config/apiRoutes";
import { getHeaderConfigs } from "@/config/GetHeaderConfigs";
import { axiosGet } from "@/services/apiRequests";

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
