import {
    axiosGet,
  } from '@/services/apiRequests';
  import { apiRoutes } from '@/config/apiRoutes';
  
  export const getAllCountries = async () => {
  const url = `${apiRoutes.geolocation.countries}`;

  const config = getHeaderConfigs()

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

export const getAllStates = async (countryId: number | null) => {
  const url = `${apiRoutes.geolocation.countries}/${countryId}${apiRoutes.geolocation.state}`;

  const config = getHeaderConfigs()

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

export const getAllCities = async (
  countryId: number | null,
  stateId: number | null
) => {
  const url = `${apiRoutes.geolocation.countries}/${countryId}${apiRoutes.geolocation.state}/${stateId}${apiRoutes.geolocation.cities}`;

  const config = getHeaderConfigs()

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