import { getHeaderConfigs } from './GetHeaderConfigs';
import { envConfig } from './envConfig';

interface IProps {
	token: string;
	url: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	payload?: any;
}

const API = async ({ token, url, method, payload }: IProps) => {
	try {
		const headers = {
			'Content-Type': 'application/json',
		}
		if(token) {
			headers["Authorization"]= `Bearer ${token}`
		}
		const config = {
			headers,
			method,
			body: JSON.stringify(payload),
		};
		const baseURL = globalThis.baseUrl || envConfig.PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL;
		const apiURL = baseURL + url;
		const res = await fetch(apiURL, {
			...config,
		});	
		const { data } = (await res.json()) || {};
		return data;
	} catch (err) {
		console.error('ERROR::', err);
		return err;
	}
};

export default API;
