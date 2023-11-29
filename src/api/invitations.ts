import { axiosDelete, axiosGet, axiosPost, axiosPut } from "../services/apiRequests"

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

export const getEcosystemList = async () => {

	const url = `${apiRoutes.Ecosystem.root}`

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
export const createEcoSystemInvitations = async (invitationList: Array<object>, ecosystemId: string) => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.Ecosystem.root}/${ecosystemId}/${orgId}${apiRoutes.Ecosystem.invitations}`

	const payload = {
		invitations: invitationList,
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
		return await axiosGet(axiosPayload);
	}
	catch (error) {
		const err = error as Error
		return err?.message
	}
}

// getEcosytemReceivedInvitations
export const getEcosytemReceivedInvitations = async (pageNumber: number, pageSize: number, search = '') => {
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);

	const url = `${apiRoutes.Ecosystem.root}/${orgId}/?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

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
export const getEcosystemInvitations = async (pageNumber: number, pageSize: number, search: string) => {
	const ecosystemId = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);

	const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
	const url = `${apiRoutes.Ecosystem.root}/${ecosystemId}/${orgId}${apiRoutes.Ecosystem.invitations}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

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

// Accept/ Reject Invitations
export const acceptRejectEcosystemInvitations = async (invitationId: string, orgId: string, status: string) => {

	const url = `${apiRoutes.Ecosystem.root}/${orgId}${apiRoutes.Ecosystem.invitations}/${invitationId}`

	const payload = {
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
		return await axiosPut(axiosPayload);
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

export const deleteEcosystemInvitations = async (invitationId: string) => {

	const ecosystemId = await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);
	const orgId = await getFromLocalStorage(storageKeys.ORG_ID)
	const url = `${apiRoutes.Ecosystem.root}/${ecosystemId}/${orgId}${apiRoutes.Ecosystem.invitations}/${invitationId}`

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
		return await axiosDelete(axiosPayload);
	}
	catch (error) {
		const err = error as Error
		return err?.message
	}
}
