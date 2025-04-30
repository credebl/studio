import { apiRoutes } from '@/config/apiRoutes';
import { axiosGet } from '@/services/apiRequests';

export const getLedgersPlatformUrl = async (indyNamespace: string) => {
  const details = {
    url: `${apiRoutes.Platform.getLedgerPlatformUrl}${indyNamespace}`,
    config: {
      headers: {
        'Content-type': 'application/json'
      }
    }
  };

  try {
    const response = await axiosGet(details);
    return response;
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};
