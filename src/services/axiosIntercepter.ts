import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { envConfig } from '../config/envConfig';
import { apiRoutes } from '../config/apiRoutes';
import { getFromLocalStorage, setToLocalStorage } from '../api/Auth';
import { apiStatusCodes, storageKeys } from '../config/CommonConstant';

const instance = axios.create({
	baseURL: envConfig.PUBLIC_BASE_URL,
});

const EcosystemInstance = axios.create({
	baseURL: envConfig.PUBLIC_ECOSYSTEM_BASE_URL,
});

const checkAuthentication = async (sessionCookie: string, request: AxiosRequestConfig) => {
	const isAuthPage = window.location.href.includes('/authentication/sign-in') || window.location.href.includes('/authentication/sign-up')
	try {
		const baseURL = envConfig.PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL;
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${sessionCookie}`,
			},
			method: 'GET',
		};
		const res = await fetch(`${baseURL + apiRoutes.users.userProfile}`, {
			...config,
		});
		const userData = await res.json();
		console.log('Check Authorized User-interceptor:::', {
			status: userData.statusCode,
			message: userData.message,
		});
		if (
			userData.statusCode === apiStatusCodes.API_STATUS_UNAUTHORIZED
		) {
			if (sessionCookie && !isAuthPage) {
				const { access_token, refresh_token }: any = globalThis;

				await setToLocalStorage(storageKeys.TOKEN, access_token);
				await setToLocalStorage(storageKeys.REFRESH_TOKEN, refresh_token);

				window.location.reload();
			} else {
				window.location.assign('/authentication/sign-in')
			}
		}
	} catch (error) { }
};
const { PUBLIC_BASE_URL, PUBLIC_ECOSYSTEM_BASE_URL }: any = globalThis

instance.interceptors.request.use(async config => {
	config.baseURL = PUBLIC_BASE_URL;
	return config;
}, error => Promise.reject(error));

EcosystemInstance.interceptors.request.use(async config => {
	config.baseURL = PUBLIC_ECOSYSTEM_BASE_URL;
	return config;
}, error => Promise.reject(error));


// Add a response interceptor
instance.interceptors.response.use(
	function (response) {
		// Any status code that lie within the range of 2xx cause this function to trigger
		return response;
	},
	async function (error) {
		// Any status codes that falls outside the range of 2xx cause this function to trigger		
		const isAuthPage = window.location.href.includes('/authentication/sign-in') || window.location.href.includes('/authentication/sign-up')
		const errorRes = error?.response;
		const originalRequest = error.config;
		const token = await getFromLocalStorage(storageKeys.TOKEN);
		if (errorRes?.status === 401 && !isAuthPage) {
			await checkAuthentication(token, originalRequest);
		}

		return Promise.reject(error);
	
	},
);

export {instance, EcosystemInstance};
