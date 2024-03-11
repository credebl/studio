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
	const token = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);
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
			userData.statusCode === apiStatusCodes.API_STATUS_UNAUTHORIZED &&
			token
		) {
			await localStorage.clear();
			window.location.href = pathRoutes.auth.sinIn;
		}
	} catch (error) {}
};
const { PUBLIC_BASE_URL}: any = globalThis

instance.interceptors.request.use(async config => { 
    config.baseURL = PUBLIC_BASE_URL;    
    return config; 
}, error => Promise.reject(error));

// Add a response interceptor
instance.interceptors.response.use(
	function (response) {
		// Any status code that lie within the range of 2xx cause this function to trigger
		// Do something with response data
		return response;
	},
	async function (error) {
		// Any status codes that falls outside the range of 2xx cause this function to trigger
		// Do something with response error
		const errorRes = error?.response;
		const token = await getFromLocalStorage(storageKeys.TOKEN);
		if (errorRes?.status === 401) {
			await checkAuthentication(token);
		}
		return Promise.reject(error);
	},
);

export default instance;
