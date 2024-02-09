import type { AstroCookies } from 'astro';
import { getSupabaseClient } from '../supabase';
import { getFromCookies, getUserProfile } from '../api/Auth';
import { pathRoutes } from '../config/pathRoutes';
import { RolePermissions } from '../config/permissions';
import type { AxiosResponse } from 'axios';

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
	currentPath,
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
		const response = await getUserProfile(sessionCookie) as AxiosResponse;
		if(response && typeof response === "string" && response === "Unauthorized"){
			return {
				permitted: false,
				redirect: pathRoutes.auth.sinIn,
				authorized: false,
			};  
		}
	} catch (error) {
		console.log("GET USER DETAILS ERROR::::", error);
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
