import '../../common/global.css';
import { Card } from 'flowbite-react';
import BreadCrumbs from '../BreadCrumbs';
import { pathRoutes } from '../../config/pathRoutes';
import BackButton from '../../commonComponents/backbutton';

const IssueDashboard = () => {
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
		<div
			className="mx-2 sm:h-[calc(100vh - 15rem)] h-[720px] min-h-80"
		>
			<div className="flex justify-between items-center mt-1">
				<BreadCrumbs />
				<BackButton path={pathRoutes.organizations.issuedCredentials} />
			</div>
			<div className="mb-2 relative">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Issue Credential
				</h1>
				<p className="absolute top-6 pl-8 pt-6 text-gray-900 text-lg font-medium dark:text-white">
					Select the appropriate action for issuing credential(s){' '}
				</p>
			</div>
			<div className="bg-white text-lg shadow-md dark:border-gray-700 dark:bg-gray-800 flex justify-center items-center w-full h-full">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-8 mt-4 lg:mt-0">
					{options.map((option) => (
						<Card
							key={option.heading}
							className="custom-card group transform transition duration-500 ease-in-out hover:scale-105 cursor-pointer overflow-hidden overflow-ellipsis dark:hover:bg-primary-700 hover:bg-primary-700 border border-gray-200 shadow-md dark:border-gray-600 dark:bg-gray-700"
							style={{
								maxHeight: '100%',
								overflow: 'auto',
								height: '168px',
								color: 'inherit',
							}}
							onClick={() => (window.location.href = option?.path)}
						>
							<div
								className="flex items-center min-[401px]:flex-nowrap flex-wrap group-hover:text-white"
								style={{ color: 'inherit' }}
							>
								<div className="ml-4">
									<h5 className="text-2xl font-semibold text-primary-700 dark:text-white pb-2">
										{option.heading}
									</h5>
									<p className="text-sm text-gray-700 dark:text-white">
										{option.description}
									</p>
								</div>
							</div>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
};

export default IssueDashboard;
