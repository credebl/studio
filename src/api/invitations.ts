import { axiosGet, axiosPost, ecosystemAxiosGet } from "../services/apiRequests"

import { apiRoutes } from "../config/apiRoutes";
import { getFromLocalStorage } from "./Auth";
import { storageKeys } from "../config/CommonConstant";

export const getOrganizationInvitations = async (pageNumber: number, pageSize: number, search = '') => {

	const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

	if (!orgId) {
		return "Organization is required";
	}

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.invitations}?&pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

	const token = await getFromLocalStorage(storageKeys.TOKEN)

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	}
	const axiosPayload = {
		url,
		config
	}

	try {
		return await axiosGet(axiosPayload);
	}
	catch (error) {
		const err = error as Error
		return err?.message
	}
}

export const createInvitations = async (invitationList: Array<object>) => {

	const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.invitations}`
	const payload = {
		invitations: invitationList,
		orgId: orgId
	}
	const token = await getFromLocalStorage(storageKeys.TOKEN)

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	}
	const axiosPayload = {
		url,
		payload,
		config
	}

	try {
		return await axiosPost(axiosPayload);
	}
	catch (error) {
		const err = error as Error
		return err?.message
	}
}
// Received Invitations by User
export const getUserInvitations = async (pageNumber: number, pageSize: number, search = '') => {

	const url = `${apiRoutes.users.invitations}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

	const token = await getFromLocalStorage(storageKeys.TOKEN)

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	}
	const axiosPayload = {
		url,
		config
	}

	try {
		return await axiosGet(axiosPayload);
	}
	catch (error) {
		const err = error as Error
		return err?.message
	}
}
export const acceptRejectInvitations = async (invitationId: string, orgId: string, status: string) => {

	const url = `${apiRoutes.users.invitations}/${invitationId}`

	const payload = {
		orgId: orgId,
		status
	}
	const token = await getFromLocalStorage(storageKeys.TOKEN)

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	}
	const axiosPayload = {
		url,
		payload,
		config
	}

	try {
		return await axiosPost(axiosPayload);
	}
	catch (error) {
		const err = error as Error
		return err?.message
	}
}

export const getUserEcosystemInvitations = async (pageNumber: number, pageSize: number, search: string) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID)

	const url = `${apiRoutes.Ecosystem.root}/${orgId}${apiRoutes.Ecosystem.usersInvitation}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

	const token = await getFromLocalStorage(storageKeys.TOKEN)

	const config = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	}
	const axiosPayload = {
		url,
		config
	}

	try {
		return await ecosystemAxiosGet(axiosPayload);
	}
	catch (error) {
		const err = error as Error
		return err?.message
	}
}

