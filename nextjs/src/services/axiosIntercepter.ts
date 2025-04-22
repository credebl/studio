'use client';

import axios from 'axios';
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

const refreshAccessToken = async () => {
  const state = store.getState();
  const { refreshToken } = state.auth;

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}${apiRoutes.auth.refreshToken}`,
      {
        refreshToken
      }
    );

    if (response.status === apiStatusCodes.API_STATUS_CREATED) {
      
      const { access_token, refresh_token } = response?.data?.data;

      const accessToken = access_token;
      const refreshToken = refresh_token;

      store.dispatch(setToken(accessToken));
      store.dispatch(setRefreshToken(refreshToken));

      return accessToken;
    }
  } catch (err) {
    console.error('Token refresh failed:', err);
    return null;
  }
};

// REQUEST INTERCEPTOR
instance.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    const { token } = state.auth;

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorRes = error.response;

    if (errorRes?.status === apiStatusCodes.API_STATUS_NOT_FOUND && !originalRequest._retry) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      }
      const route = useRouter();
      route.push('/auth/sign-in');
    }

    return Promise.reject(error);
  }
);

// Optional: if you want to attach baseURL to Ecosystem instance too
EcosystemInstance.interceptors.request.use(
  async (config) => {
    config.baseURL = process.env.PUBLIC_ECOSYSTEM_BASE_URL;
    return config;
  },
  (error) => Promise.reject(error)
);

export { instance, EcosystemInstance };
