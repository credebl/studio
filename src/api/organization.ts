import {
	axiosDelete,
	axiosGet,
	axiosPost,
	axiosPublicOrganisationGet,
	axiosPut,
} from '../services/apiRequests';

import { apiRoutes } from '../config/apiRoutes';
import { getFromLocalStorage } from './Auth';
import { getHeaderConfigs } from '../config/GetHeaderConfigs';
import { storageKeys } from '../config/CommonConstant';

export const createOrganization = async (data: object) => {
	const url = apiRoutes.organizations.create;
	const payload = data;
	const token = await getFromLocalStorage(storageKeys.TOKEN);

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const axiosPayload = {
		url,
		payload,
		config,
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const updateOrganization = async (data: object, orgId: string) => {
	const url = `${apiRoutes.organizations.update}/${orgId}`;
	const payload = data;
	const token = await getFromLocalStorage(storageKeys.TOKEN);

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const axiosPayload = {
		url,
		payload,
		config,
	};

	try {
		return await axiosPut(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const getOrganizations = async (
	pageNumber: number,
	pageSize: number,
	search = '',
) => {
	const url = `${apiRoutes.organizations.getAll}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;

	const token = await getFromLocalStorage(storageKeys.TOKEN);

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const axiosPayload = {
		url,
		config,
	};

	try {
		return await axiosGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const getOrganizationById = async (orgId: string) => {
	const url = `${apiRoutes.organizations.getById}/${orgId}`;

	const token = await getFromLocalStorage(storageKeys.TOKEN);

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const axiosPayload = {
		url,
		config,
	};

	try {
		return await axiosGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const getOrgDashboard = async (orgId: string) => {
	const url = `${apiRoutes.organizations.getOrgDashboard}/${orgId}`;

	const token = await getFromLocalStorage(storageKeys.TOKEN);

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const axiosPayload = {
		url,
		config,
	};

	try {
		return await axiosGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const spinupDedicatedAgent = async (data: object, orgId: string) => {
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentDedicatedSpinup}`;
	const payload = data;

	const token = await getFromLocalStorage(storageKeys.TOKEN);

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const axiosPayload = {
		url,
		payload,
		config,
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const spinupSharedAgent = async (data: object, orgId: string) => {
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.Agent.agentSharedSpinup}`;
	const payload = data;

	const token = await getFromLocalStorage(storageKeys.TOKEN);

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const axiosPayload = {
		url,
		payload,
		config,
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const getOrganizationRoles = async () => {
	const url = `${apiRoutes.organizations.orgRoles}`;

	const token = await getFromLocalStorage(storageKeys.TOKEN);

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};
	const axiosPayload = {
		url,
		config,
	};

	try {
		return await axiosGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

//Get users of the organization
export const getOrganizationUsers = async (
	pageNumber: number,
	pageSize: number,
	search = '',
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	if (!orgId) {
		return 'Organization is required';
	}

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.users.fetchUsers}?&pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;

	const axiosPayload = {
		url,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

// Edit user roles
export const editOrganizationUserRole = async (
	userId: string,
	roles: string[],
) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.editUserROle}/${userId}`;
	const payload = {
		orgId,
		userId,
		orgRoleId: roles,
	};

	const axiosPayload = {
		url,
		payload,
		config: await getHeaderConfigs(),
	};

	try {
		return axiosPut(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

//Create Connection

export const createConnection = async (orgName: string) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.connection.create}`;

	const data = {
		label: orgName,
		multiUseInvitation: true,
		autoAcceptConnection: true,
		orgId: orgId,
	};
	const payload = data;

	const axiosPayload = {
		url,
		payload,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosPost(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

// public profile

export const getPublicOrganizations = async (
	pageNumber: number,
	pageSize: number,
	search: string,
) => {
	const url = `${apiRoutes.Public.organizations}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`;

	const config = {
		headers: {
			'Content-Type': 'application/json',
		},
	};
	const axiosPayload = {
		url,
		config,
	};

	try {
		return await axiosPublicOrganisationGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

export const getPublicOrgDetails = async (orgSlug: string) => {
	const url = `${apiRoutes.Public.organizationDetails}/${orgSlug}`;

	const config = {
		headers: {
			'Content-Type': 'application/json',
		},
	};
	const axiosPayload = {
		url,
		config,
	};

	try {
		return await axiosPublicOrganisationGet(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};

// Edit user roles
export const deleteOrganizationInvitation = async (
	orgId: string,
	invitationId: string,
) => {
	const url = `${apiRoutes.organizations.root}/${orgId}/invitations/${invitationId}`;

	const axiosPayload = {
		url,
		config: await getHeaderConfigs(),
	};

	try {
		return await axiosDelete(axiosPayload);
	} catch (error) {
		const err = error as Error;
		return err?.message;
	}
};
