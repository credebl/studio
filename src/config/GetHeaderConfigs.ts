import { getFromLocalStorage } from '../api/Auth';
import { storageKeys } from './CommonConstant';

export const getHeaderConfigs = async (tokenVal?: string) => {
	const token =
		(await getFromLocalStorage(storageKeys.TOKEN)) ||
		(typeof tokenVal === 'string' ? tokenVal : '');
	const config: any = {
		headers: {
			'Content-Type': 'application/json',
		},
	};
	if (token) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
};
