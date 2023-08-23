import type { GetAllSchemaListParameter, createCredDeffFieldName, createSchema } from "../components/Resources/Schema/interfaces";
import { axiosDelete, axiosGet, axiosPost } from "../services/apiRequests";

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";

export const getAgentHealth = async (orgId:number) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `http://localhost:5000/agent-service/health?orgId=${orgId}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  };

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}
