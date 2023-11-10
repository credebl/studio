import { PlatformRoles } from '../common/enums';
import { pathRoutes } from './pathRoutes';

interface IPermission {
	role: PlatformRoles;
	pages: string[];
}

export const RolePermissions: IPermission[] = [
	{
		role: PlatformRoles.platformAdmin,
		pages: [pathRoutes.users.platformSetting, pathRoutes.users.profile],
	},
];
