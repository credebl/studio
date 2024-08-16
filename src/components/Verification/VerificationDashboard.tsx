import { pathRoutes } from '../../config/pathRoutes';
import Dashboard from '../../commonComponents/Dashboard';

const VerificationDashboard = () => {
	const options = [
		{
			heading: 'Connection',
			description: 'Verify credential(s) by selecting existing connections',
			path: pathRoutes.organizations.verification.connections,
		},
		{
			heading: 'Email',
			description: 'Verify credential(s) by entering email ID for specific user',
			path: null,
		},
		{
			heading: 'Bulk',
			description: 'Verify credential(s) in bulk by uploading .csv file records',
			path: null,
		},
	];

	return (
		<Dashboard
			title="Verify Credential"
			options={options}
			backButtonPath={pathRoutes.organizations.issuedCredentials}
		/>
	);
};

export default VerificationDashboard;

