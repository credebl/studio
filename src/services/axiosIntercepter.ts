import axios from 'axios';
import { envConfig } from '../config/envConfig';
import { apiRoutes } from '../config/apiRoutes';
import { getFromLocalStorage } from '../api/Auth';
import { apiStatusCodes, storageKeys } from '../config/CommonConstant';
import { pathRoutes } from '../config/pathRoutes';

const instance = axios.create({
	baseURL: envConfig.PUBLIC_BASE_URL,
});

const checkAuthentication = async (sessionCookie: string) => {
	console.log('check auth');
	try {
		const baseURL = envConfig.PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL;
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${sessionCookie + ''}`,
			},
			method: 'GET',
		};
		console.log(232323, baseURL, config);
		const res = await fetch(`${baseURL + apiRoutes.users.userProfile}`, {
			...config,
		});
		const userData = await res.json();
		console.log('Check Authorized User-interceptor:::', {
			status: userData.statusCode,
			message: userData.message,
		});
		if (userData.statusCode === apiStatusCodes.API_STATUS_UNAUTHORIZED) {
			await localStorage.clear();
			window.location.href = pathRoutes.auth.sinIn;
		}
	} catch (error) {}
};

instance.interceptors.request.use(
	async (config) => {
		config.baseURL = globalThis.baseUrl;
		console.log(883838, config);
		return config;
	},
	(error) => Promise.reject(error),
);

// Add a response interceptor
instance.interceptors.response.use(
	function (response) {
		// Any status code that lie within the range of 2xx cause this function to trigger
		// Do something with response data
		console.log(8282828, response);
		return response;
	},
	async function (error) {
		// Any status codes that falls outside the range of 2xx cause this function to trigger
		// Do something with response error
		const errorRes = error?.response;
		const token = await getFromLocalStorage(storageKeys.TOKEN);
		console.log(82992, errorRes);
		if (errorRes?.status === 401) {
			await checkAuthentication(token);
		}

		console.log(82828281, error);
		return Promise.reject(error);
	},
);

export default instance;
