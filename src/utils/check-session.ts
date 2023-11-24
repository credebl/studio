import type { AstroCookies } from 'astro';
import { getSupabaseClient } from '../supabase';
import { getFromCookies } from '../api/Auth';
import { pathRoutes } from '../config/pathRoutes';
import { RolePermissions } from '../config/permissions';

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

	const {
		data: { user },
		error,
	} = await getSupabaseClient().auth.getUser(sessionCookie);

	if (!user || user.role !== 'authenticated') {
		return {
			permitted: false,
			redirect: pathRoutes.auth.sinIn,
			authorized: false,
		};
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
