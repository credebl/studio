import { apiRoutes } from '@/config/apiRoutes';
import { apiStatusCodes } from '@/config/CommonConstant';
import { getHeaderConfigs } from '@/config/GetHeaderConfigs';
import { ConnectionResponse } from '@/features/connections/types/connections-interface';
import { axiosDelete, axiosGet } from '@/services/apiRequests';

export interface IConnectionListAPIParameter {
  itemPerPage: number;
  page: number;
  search: string;
  sortBy: string;
  sortingOrder: string;
  filter?: string;
}

export const getConnectionsByOrg = async ({
  orgId,
  page,
  itemPerPage,
  search,
  sortBy,
  sortingOrder
}: IConnectionListAPIParameter & { orgId: string }): Promise<ConnectionResponse | void> => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Issuance.getAllConnections}?pageSize=${itemPerPage}&pageNumber=${page}&searchByText=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`;

  const axiosPayload = {
    url,
    config: await getHeaderConfigs()
  };

  try {
    const connectionList = await axiosGet(axiosPayload);
    const { data } = connectionList as any;
    let result = {};
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      result = data.data ?? {};
    }
    throw new Error("Error fetching connection list");
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching connections::', err.message);
  }
};

export const deleteConnectionRecords = async (orgId: string) => {

  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.deleteConnections}`;

  const axiosPayload = {
    url,
    config: await getHeaderConfigs()
  };

  try {
    return await axiosDelete(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};
