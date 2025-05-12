'use client';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
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

interface RefreshTokenResponse {
  data: {
    access_token: string;
    refresh_token: string;
  };
}

// Refresh Token
const refreshAccessToken = async () => {
  const state = store.getState();
  const refreshToken = state?.auth?.refreshToken;

  if (!refreshToken) {
    console.error('No refresh token available');
    return null;
  }

  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.refreshToken}`,
      { refreshToken }
    );

    if (
      response?.status === apiStatusCodes.API_STATUS_CREATED &&
      response.data?.data
    ) {
      const AccessToken = response.data.data.access_token;
      const RefreshToken = response.data.data.refresh_token;

      if (AccessToken && RefreshToken) {
        store.dispatch(setToken(AccessToken));
        store.dispatch(setRefreshToken(RefreshToken));
        return AccessToken;
      }
    }
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Token refresh failed:', error.response || error.message);
    } else {
      console.error('Token refresh failed:', error);
    }
    return null;
  }
};

// REQUEST INTERCEPTOR
instance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state?.auth?.token;

    if (token) {
      const updatedConfig = {
        ...config,
        headers: new axios.AxiosHeaders({
          ...config.headers,
          Authorization: `Bearer ${token}`
        })
      };
      return updatedConfig;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

function logoutAndRedirect() {
  const rootKey = 'persist:root';

  if (localStorage.getItem(rootKey)) {
    localStorage.removeItem(rootKey);

    const interval = setInterval(() => {
      if (!localStorage.getItem(rootKey)) {
        clearInterval(interval);
        window.location.href = '/auth/sign-in';
      }
    }, 100);
  } else {
    window.location.href = '/auth/sign-in';
  }
}

// RESPONSE INTERCEPTOR
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      retry?: boolean;
    };

    if (
      error.response?.status === apiStatusCodes.API_STATUS_UNAUTHORIZED &&
      !originalRequest?.retry
    ) {
      originalRequest.retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      }

      if (typeof window !== 'undefined') {
        logoutAndRedirect();
      }
    }

    return Promise.reject(error);
  }
);

export { instance, EcosystemInstance };
