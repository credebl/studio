import { apiRoutes } from '@/config/apiRoutes';
import { getHeaderConfigs } from '@/config/GetHeaderConfigs';
import { axiosGet, axiosPost } from '@/services/apiRequests';
import { IConnectionListAPIParameter } from './connection';

export const getVerifiedProofDetails = async (
  proofId: string,
  orgId: string
) => {
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.proofRequestAttributesVerification}/${proofId}`;
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

export const getVerificationList = async (
  orgId: string,
  apiParameter: IConnectionListAPIParameter
) => {
  const { page, itemPerPage, search, sortBy, sortingOrder } = apiParameter;

  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.verifyCredential}?pageSize=${itemPerPage}&pageNumber=${page}&search=${search}&sortBy=${sortingOrder}&sortField=${sortBy}`;

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

export const verifyPresentation = async (proofId: string) => {
  // const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
  const orgId = '';
  const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Verification.presentationVerification}/${proofId}/verify`;
  const axiosPayload = {
    url,
    config: await getHeaderConfigs()
  };

  try {
    return await axiosPost(axiosPayload);
  } catch (error) {
    const err = error as Error;
    return err?.message;
  }
};
