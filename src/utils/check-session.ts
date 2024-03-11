import type { AstroCookies } from 'astro';
import { getFromCookies } from '../api/Auth';
import { pathRoutes } from '../config/pathRoutes';
import { RolePermissions } from '../config/permissions';
import { apiStatusCodes } from '../config/CommonConstant';
import { apiRoutes } from '../config/apiRoutes';
import { envConfig } from '../config/envConfig';

interface IProps {
	cookies: AstroCookies;
	currentPath: string;
}

interface IOutput {
	permitted: boolean;
	redirect?: string;
	authorized?: boolean;
}

export const checkUserSession = async ({
	cookies,
	currentPath
}: IProps): Promise<IOutput> => {
	const sessionCookie = getFromCookies(cookies, 'session');

	if (!sessionCookie) {
		return {
			permitted: false,
			redirect: pathRoutes.auth.sinIn,
			authorized: false,
		};
	}

	try {
		const baseURL =
			envConfig.PUBLIC_BASE_URL ||
			process.env.PUBLIC_BASE_URL;
		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${sessionCookie + ''}`,
			},
			method: 'GET',
		};
		const res = await fetch(`${baseURL + apiRoutes.users.userProfile}`, {
			...config,
		});
		const userData = await res.json();
		console.log('Check Authorized User:::', {
			status: userData.statusCode,
			message: userData.message,
		});

		if (userData?.statusCode === apiStatusCodes.API_STATUS_UNAUTHORIZED) {
			return {
				permitted: false,
				redirect: pathRoutes.auth.sinIn,
				authorized: false,
			};
		}
	} catch (error) {
		console.log('GET USER DETAILS ERROR::::', error);
	}

	const role = getFromCookies(cookies, 'role');
	const permittedPages = RolePermissions.find(
		(item) => item.role === role,
	)?.pages;

	if (!permittedPages?.includes(currentPath)) {
		if (permittedPages) {
			return {
				permitted: false,
				redirect: permittedPages[0],
				authorized: true,
			};
		} else {
			return {
				permitted: true,
				redirect: pathRoutes.users.dashboard,
				authorized: true,
			};
		}
	}
	return {
		permitted: true,
		authorized: true,
	};
};
