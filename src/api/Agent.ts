import { axiosGet } from "../services/apiRequests";
import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";

export const getAgentHealth = async (orgId:number) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.checkAgentHealth}`,
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