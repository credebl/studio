import type { AstroCookies } from 'astro';
import { getSupabaseClient } from '../supabase';
import { getFromCookies } from '../api/Auth';
import { pathRoutes } from '../config/pathRoutes';
import { RolePermissions } from '../config/permissions';

interface IProps {
	cookies: AstroCookies;
}

interface IOutput {
	permitted: boolean;
	redirect?: string;
	authorized?: boolean;
}

export const checkUserSession = async ({
	cookies,
}: IProps): Promise<IOutput> => {
	const sessionCookie = getFromCookies(cookies, 'session');

	if (!sessionCookie) {
		return {
			permitted: false,
			redirect: pathRoutes.auth.sinIn,
			authorized: false,
		};
	}

	return {
		permitted: true,
		authorized: true,
	};
};
