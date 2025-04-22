'use client';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useRouter } from 'next/navigation';
import { apiRoutes } from '@/config/apiRoutes';
import { store } from '@/lib/store';
import { setRefreshToken, setToken } from '@/lib/authSlice';
import { apiStatusCodes } from '@/config/CommonConstant';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL
});

const EcosystemInstance = axios.create({
  baseURL: process.env.PUBLIC_ECOSYSTEM_BASE_URL
});

// Refresh Token Function
const refreshAccessToken = async () => {
  const state = store.getState();
  const refreshToken = state?.auth?.refreshToken;

  if (!refreshToken) {
    // eslint-disable-next-line no-console
    console.error('No refresh token available');
    return null;
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.refreshToken}`,
      { refreshToken }
    );

    if (
      response?.status === apiStatusCodes.API_STATUS_CREATED &&
      response.data?.data
    ) {
      const { access_token, refresh_token } = response.data.data;

      if (access_token && refresh_token) {
        store.dispatch(setToken(access_token));
        store.dispatch(setRefreshToken(refresh_token));
        return access_token;
      }
    }
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

// REQUEST INTERCEPTOR
instance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state?.auth?.token;

    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === apiStatusCodes.API_STATUS_NOT_FOUND &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken && originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      }

      if (typeof window !== 'undefined') {
        const router = useRouter();
        router.push('/auth/sign-in');
      }
    }

    return Promise.reject(error);
  }
);

// Optional: Attach baseURL in EcosystemInstance too
EcosystemInstance.interceptors.request.use(
  (config) => {
    config.baseURL = process.env.PUBLIC_ECOSYSTEM_BASE_URL;
    return config;
  },
  (error) => Promise.reject(error)
);

export { instance, EcosystemInstance };
