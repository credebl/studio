import { axiosGet, axiosPost, ecosystemAxiosGet } from "@/services/apiRequests";

import { apiRoutes } from "@/config/apiRoutes";

// Get all organization Inviattions
export const getOrganizationInvitations = async (orgId: string, pageNumber: number, pageSize: number, search = '') => {

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.invitations}?&pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

	const config = {
		headers: {
			'Content-Type': 'application/json'
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


//Create Invitations
export const createInvitations = async (orgId: string, invitationList: Array<object>) => {

	const url = `${apiRoutes.organizations.root}/${orgId}${apiRoutes.organizations.invitations}`
	const payload = {
		invitations: invitationList,
		orgId
	}
	
	const config = {
		headers: {
			'Content-Type': 'application/json'
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

	const config = {
		headers: {
			'Content-Type': 'application/json'
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

// Accept and Reject Invitations
export const acceptRejectInvitations = async (invitationId: string, orgId: string, status: string) => {

	const url = `${apiRoutes.users.invitations}/${invitationId}`

	const payload = {
		orgId,
		status
	}

	const config = {
		headers: {
			'Content-Type': 'application/json'
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


// Fetch ecosystem invitations
export const getUserEcosystemInvitations = async (pageNumber: number, pageSize: number, search: string, orgId: string) => {

	const url = `${apiRoutes.Ecosystem.root}/${orgId}${apiRoutes.Ecosystem.usersInvitation}?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`

	const config = {
		headers: {
			'Content-Type': 'application/json'
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
