import { getHeaderConfigs } from './GetHeaderConfigs';
import { envConfig } from './envConfig';

interface IProps {
	token: string;
	url: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	payload?: any;
	isBaseURL?: boolean
}

const API = async ({ token, url, method, payload, isBaseURL }: IProps) => {
	try {
		const headers = {
			'Content-Type': 'application/json',
			...(token && {"Authorization": `Bearer ${token}`})
		}

		const config = {
			headers,
			method,
			body: JSON.stringify(payload),
		};

		const baseURL = globalThis.baseUrl || envConfig.PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL;
		const apiURL = !isBaseURL ? baseURL + url : url;
		console.log(3434333, apiURL);
		
		const res = await fetch(apiURL, {
			...config,
		});
		
		const data = (await res.json()) || {};
		console.log(7687, baseURL, data);
		return data.data;
	} catch (err) {
		console.error('ERROR::', err);
		return err;
	}
};

export default API;
