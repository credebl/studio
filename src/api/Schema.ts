import type { GetAllSchemaListParameter, createCredDeffFieldName } from "../components/Resources/Schema/interfaces";
import { axiosGet, axiosPost } from "../services/apiRequests";

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";
import { getHeaderConfigs } from "../config/GetHeaderConfigs";

export const getAllSchemas = async ({itemPerPage, page, allSearch }: GetAllSchemaListParameter, schemaType?: string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const ledgerId = await getFromLocalStorage(storageKeys.LEDGER_ID)
  const details = {
		url: `${apiRoutes.Platform.getAllSchemaFromPlatform}?pageSize=${itemPerPage}&searchByText=${allSearch}&pageNumber=${page}&ledgerId=${ledgerId}&schemaType=${schemaType}`,
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

export const getAllSchemasByOrgId = async ({ search, itemPerPage, page }: GetAllSchemaListParameter, orgId: string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getAll}?pageNumber=${page}&pageSize=${itemPerPage}&searchByText=${search}`,
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

export const createSchemas = async (payload: any, orgId: string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.create}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosPost(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getSchemaById = async (schemaId: string, orgId: string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getSchemaById}/${schemaId}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    throw err?.message
  }
}

export const createCredentialDefinition = async (payload: createCredDeffFieldName, orgId:string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.createCredentialDefinition}`,
    payload,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosPost(details)
		
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getAllCredDef = async () => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.createCredentialDefinition}`;
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


export const getCredDeffById = async (schemaId: string, orgId: string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.getCredDefBySchemaId}/${schemaId}/cred-defs`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

export const getCredDefDetailsByCredDefId = async (credDefId: string, orgId: string) => {
  const token = await getFromLocalStorage(storageKeys.TOKEN)
  const details = {
    url: `${apiRoutes.organizations.root}/${orgId}${apiRoutes.schema.createCredentialDefinition}/${credDefId}`,
    config: {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    },
  }

  try {
    const response = await axiosGet(details)
    return response
  }
  catch (error) {
    const err = error as Error
    return err?.message
  }
}

