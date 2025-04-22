import { axiosGet } from '@/services/apiRequests';
import { GetAllSchemaListParameter } from '@/features/dashboard/type/schema';
import { getHeaderConfigs } from '@/config/GetHeaderConfigs';
import apiRoutes from './apiRoutes';

export const getAllSchemasByOrgId = async (
  { search, itemPerPage, page }: GetAllSchemaListParameter,
  orgId: string
) => {
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getAll}?pageNumber=${page}&pageSize=${itemPerPage}&searchByText=${search}`,
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

export const getAllCredDef = async (orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.createCredentialDefinition}`;
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

export const getCredDeffById = async (schemaId: string, orgId: string) => {
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getCredDefBySchemaId}/${schemaId}/cred-defs`,
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

export const getCredDefDetailsByCredDefId = async (
  credDefId: string,
  orgId: string
) => {
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.createCredentialDefinition}/${credDefId}`,
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
