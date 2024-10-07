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
	ecosystem: {
		root: '/ecosystems',
		ecosystemLogin: '/authentication/sign-in'
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
			email: '/organizations/verification/verify-credentials/schema',
			schema: '/organizations/verification/verify-credentials/schemas',
			credDef: '/organizations/verification/verify-credentials/schemas/cred-defs',
			w3cAttributes: '/organizations/verification/verify-credentials/schema/attributes',
			attributes: '/organizations/verification/verify-credentials/schema/cred-defs/attributes',
			emailVerification: '/organizations/verification/verify-credentials/schema/cred-defs/attributes/verification-email',
			w3cEmailVerification: '/organizations/verification/verify-credentials/schema/attributes/verification-email',
			emailCredDef: '/organizations/verification/verify-credentials/schema/cred-defs',
			connections: '/organizations/verification/verify-credentials/schemas/cred-defs/connections',
			W3CConnections: '/organizations/verification/verify-credentials/schemas/connections',

			verify:
				'/organizations/verification/verify-credentials/schemas/cred-defs/connections/verification',
				W3CVerification:
				'/organizations/verification/verify-credentials/schemas/connections/verification',
		},
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
