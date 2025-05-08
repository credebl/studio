import { apiRoutes } from '@/config/apiRoutes';
import { IDedicatedAgentConfiguration, IUpdatePrimaryDid } from '@/features/organization/components/interfaces/organization';
import { axiosGet, axiosPost } from '@/services/apiRequests';

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

export const spinupDedicatedAgent = async (data: object, orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentDedicatedSpinup}`;
  const payload = data;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const setAgentConfigDetails = async (
  data: IDedicatedAgentConfiguration,
  orgId: string
) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.setAgentConfig}`;
  const payload = data;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const spinupSharedAgent = async (data: object, orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentSharedSpinup}`;
  const payload = data;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const createDid = async (orgId: string, data: any) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.createDid}`;
  const payload = data;

  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    payload,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};



export const getLedgerConfig = async () => {
  const url = `${apiRoutes.organizations.root}${apiRoutes.Agent.getLedgerConfig}`;
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const getLedgers = async () => {
  const url = `${apiRoutes.Platform.getLedgers}`;
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const createPolygonKeyValuePair = async (orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.createPolygonKeys}`;
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};


export const getDids = async (orgId: string) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.didList}`;
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  const axiosPayload = {
    url,
    config
  };

  try {
    return await axiosGet(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};

export const updatePrimaryDid = async (
  orgId: string,
  payload: IUpdatePrimaryDid
) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.primaryDid}`;

  const axiosPayload = {
    url,
    payload,
    config: await getHeaderConfigs()
  };

  try {
    return await axiosPut(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};