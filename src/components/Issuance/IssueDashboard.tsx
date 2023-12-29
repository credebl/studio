import '../../common/global.css';
import { Card } from 'flowbite-react';
import BreadCrumbs from '../BreadCrumbs';
import { pathRoutes } from '../../config/pathRoutes';
import BackButton from '../../commonComponents/backbutton';
import React from 'react';

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
		<div className="px-4 pt-2 h-full h-[700px]">
			<div className="mt-1">
				<BreadCrumbs />
			</div>
			<div className="mb-2 flex justify-between items-center relative">
				<h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Issue Credential
				</h1>
				<BackButton path={pathRoutes.organizations.issuedCredentials} />
			</div>
			<div className="px-6 pt-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 dark:bg-gray-800">
				<p className="text-gray-900 text-xl text-start font-medium dark:text-white">
					Select the appropriate action for issuing credential(s){' '}
				</p>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16 pt-12">
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
