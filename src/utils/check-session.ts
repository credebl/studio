import type { AstroCookies } from 'astro';
import { getFromCookies, setToCookies } from '../api/Auth';
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
			const refreshSession = getFromCookies(cookies, 'refresh');

			const configRefreshToken = {
				headers: {
					'Content-Type': 'application/json'
				},
				method: 'POST',
				body: JSON.stringify({
					refreshToken: refreshSession
				})
			};

			const res = await fetch(`${baseURL + apiRoutes.auth.refreshToken}`, {
				...configRefreshToken,
			});
			const userSession = await res.json();
	
			if (userSession?.statusCode !== apiStatusCodes.API_STATUS_SUCCESS) {
				return {
					permitted: false,
					redirect: pathRoutes.auth.sinIn,
					authorized: false,
				};
			}
			setToCookies(cookies, "session", userSession?.data?.access_token as string, {
				path: "/"
			})
			setToCookies(cookies, "refresh", userSession?.data?.refresh_token as string, {
				path: "/"
			})

			return {
				permitted: true,
				authorized: true
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
