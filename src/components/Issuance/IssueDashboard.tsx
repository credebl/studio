import Dashboard from '../../commonComponents/Dashboard';
import { pathRoutes } from '../../config/pathRoutes';

const IssuanceDashboard = () => {
	const options = [
		{
			heading: 'Connection',
			description:
				'Issue credential(s) by selecting connection from existing users',
			path: pathRoutes.organizations.Issuance.schema,
		},
		{
			heading: 'Email',
			description: 'Issue credential(s) by entering email ID for specific user',
			path: pathRoutes.organizations.Issuance.email,
		},
		{
			heading: 'Bulk',
			description: 'Issue credential(s) by uploading .csv file records',
			path: pathRoutes.organizations.Issuance.bulkIssuance,
		},
	];

	return (
		<Dashboard
			title="Issue Credential"
			options={options}
			backButtonPath={pathRoutes.organizations.issuedCredentials}
		/>
	);
};

export default IssuanceDashboard;
