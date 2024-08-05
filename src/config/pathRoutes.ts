import { deleteOrganizationInvitation } from "../api/organization";
import { envConfig } from "./envConfig";

export const pathRoutes = {
	landingPage:{
		landingPage:'/'
	},
	auth: {
		signUp: '/authentication/sign-up',
		sinIn: '/authentication/sign-in',
		verifyEmail: '/auth/verify',
	},
	users: {
		dashboard: '/dashboard',
		profile: '/profile',
		invitations: '/invitations',
		fetchUsers: '/users',
		connectionList: '/connections',
		platformSetting: '/platform-settings',
		setting: '/setting'
	},
	organizations: {
		root: '/organizations',
		invitations: '/organizations/invitations',
		users: '/organizations/users',
		schemas: `/organizations/schemas`,
		dashboard: '/organizations/dashboard',
		issuedCredentials: '/organizations/credentials',
		credentials: '/organizations/verification',
		createSchema: '/organizations/schemas/create',
		deleteOrganization:'/organizations/delete-organizations',

		viewSchema: '/organizations/schemas/view-schema',
		Issuance: {
			issue: '/organizations/credentials/issue',
			schema: '/organizations/credentials/issue/schemas',
			credDef: '/organizations/credentials/issue/schemas/cred-defs',
			connection:'/organizations/credentials/issue/connections',
			connections:
				'/organizations/credentials/issue/schemas/cred-defs/connections',
			issuance:
				'/organizations/credentials/issue/schemas/cred-defs/connections/issuance',
			w3cIssuance:'/organizations/credentials/issue/connections/issuance',
			history: '/organizations/credentials/issue/bulk-issuance/history',
			details: '/organizations/credentials/issue/bulk-issuance/history/details',
			bulkIssuance: '/organizations/credentials/issue/bulk-issuance',
			email: '/organizations/credentials/issue/email',
			emailHistory: '/organizations/credentials/issue/email/history',
		},
		verification: {
			requestProof: '/organizations/verification/verify-credentials',
			email: '/organizations/verification/verify-credentials/email/schemas',
			schema: '/organizations/verification/verify-credentials/schemas',
			credDef: '/organizations/verification/verify-credentials/schemas/cred-defs',
			attributes: '/organizations/verification/verify-credentials/schemas/cred-defs/attributes',
			emailCredDef: '/organizations/verification/verify-credentials/email/schemas/cred-defs',
			connections: '/organizations/verification/verify-credentials/schemas/cred-defs/connections',
			verify:
				'/organizations/verification/verify-credentials/schemas/cred-defs/connections/verification',
		},
	},
	ecosystem: {
		root: '/ecosystems',
		dashboard: '/ecosystems/dashboard',
		endorsements: '/ecosystems/endorsement',
		invitation: '/ecosystems/invitation',
		sentinvitation: '/ecosystems/invitations',
		addOrgs: '/ecosystems/dashboard/add-organizations'
	},
	documentation: {
		root: envConfig.PLATFORM_DATA.docs
	},
	schema: {
		create: '/schemas',
		getAll: '/schemas',
		getSchemaById: '/schemas/id',
		createCredentialDefinition: '/credential-definitions',
		getCredDeffBySchemaId: '/schemas/credential-definitions',
	},
	back: {
		schema: {
			schemas: '/organizations/schemas',
		},
		verification: {
			credDef: '/organizations/verification/verify-credentials/schemas/cred-defs',
			schemas: '/organizations/verification/verify-credentials/schemas',
			verification: '/organizations/verification/verify-credentials/schemas/cred-defs/connections',
		},
		issuance: {
			credDef: '/organizations/credentials/issue/schemas/cred-defs',
			schemas: '/organizations/credentials/issue/schemas',
			connections:
				'/organizations/credentials/issue/schemas/cred-defs/connections',
		},
	},
};
