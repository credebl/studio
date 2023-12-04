import { Card } from 'flowbite-react';
import React from 'react';
import BreadCrumbs from '../BreadCrumbs';
import { pathRoutes } from '../../config/pathRoutes';

const IssueDashboard = () => {
	const options = [
		{
			heading: 'Connection',
			description:
				'Issue credential(s) by selecting connection from existing users',
				path: pathRoutes.organizations.Issuance.schema

		},
		{
			heading: 'Email',
			description: 'Issue credential(s) by entering email ID for specific user',
			path: pathRoutes.organizations.Issuance.email

		},
		{
			heading: 'Bulk',
			description: 'Issue credential(s) by uploading .csv file records',
			path: pathRoutes.organizations.Issuance.bulkIssuance
		},
	];
	return (
		<div className="h-[700px] mx-2">
			<div className="mb-2 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>
			<div className="mb-2 flex justify-between">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Issue Credential
				</h1>
			</div>
		<div className='bg-white text-lg shadow-md dark:border-gray-700 dark:bg-gray-800 h-full items-center w-full'>
			<p className='pl-4 pt-6'>Choose following action for issue credential(s)</p>
			<div className="flex justify-center bg-white shadow-md dark:border-gray-700 dark:bg-gray-800 h-full items-center w-full">
				<div className="flex justify-center h-full items-center w-10/12 grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 dark:border-gray-700 dark:bg-gray-800 px-auto">
					{options.map((option) => {
						return (
							<Card
								className="transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer overflow-hidden overflow-ellipsis"
								style={{
									maxHeight: '100%',
									maxWidth: '90%',
									overflow: 'auto',
									height: '168px',
								}}
								onClick={()=>window.location.href=option?.path}
							>
								<div className="flex items-center min-[401px]:flex-nowrap flex-wrap">
									<div className="ml-4 w-100/6rem line-clamp-4 ">
										<h5 className="text-2xl font-semibold tracking-tight text-primary-700 dark:text-white">
											{option.heading}
										</h5>
										<p className="text-sm tracking-tight text-gray-700 dark:text-white">
											{option.description}
										</p>
									</div>
								</div>
							</Card>
						);
					})}
					{/* <Card key={org.id} onClick={() => redirectOrgDashboard(org)} className='transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer overflow-hidden overflow-ellipsis' style={{ maxHeight: '100%', maxWidth: '100%', overflow: 'auto' }}> */}

					{/* <Card
						className="transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer overflow-hidden overflow-ellipsis"
						style={{ maxHeight: '100%', maxWidth: '90%', overflow: 'auto' , height: '168px'}}
					>
						<div className="flex items-center min-[401px]:flex-nowrap flex-wrap">
							<div className="ml-4 w-100/6rem line-clamp-4 ">
								<h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
									name
								</h5>
								<p className="text-base tracking-tight text-gray-900 dark:text-white truncate">
									description
								</p>
							</div>
						</div>
					</Card>
					<Card
						className="transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer overflow-hidden overflow-ellipsis"
						style={{ maxHeight: '100%', maxWidth: '90%', overflow: 'auto' , height: '168px'}}
					>
						<div className="flex items-center min-[401px]:flex-nowrap flex-wrap">
							<div className="ml-4 w-100/6rem line-clamp-4 ">
								<h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
									name
								</h5>
								<p className="text-base tracking-tight text-gray-900 dark:text-white truncate">
									description
								</p>
							</div>
						</div>
					</Card> */}
				</div>
			</div></div>
		</div>
	);
};

export default IssueDashboard;
