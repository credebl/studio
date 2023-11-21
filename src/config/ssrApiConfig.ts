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
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			method,
			body: JSON.stringify(payload),
		};
		const baseURL = globalThis.baseUrl || envConfig.PUBLIC_BASE_URL;
		console.log(77,baseURL);
		const apiURL = baseURL + url;
		const res = await fetch(apiURL, {
			...config,
		});
		console.log(22,res);	
		const { data } = (await res.json()) || {};
		console.log(33,data)
		return data;
	} catch (err) {
		console.error('ERROR::', err);
		return err;
	}
};

export default API;
