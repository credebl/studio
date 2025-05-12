'use client'

import {Button} from '@/components/ui/button'
import { Card } from '@/components/ui/card';
import { IDashboard } from '../type/Dashboard';
import React from 'react';
import { useRouter } from 'next/navigation';

const Dashboard = ({ title, options, backButtonPath }:IDashboard) => {
	const router = useRouter()
	return (
		<div className="px-4 pt-2 h-full h-[700px]">
			<div className="mb-2 flex justify-between items-center relative">
				<h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					{title}
				</h1>
				<Button
					title={title}
					onClick={()=>router.push(backButtonPath)}
					className='text-base'
				>
					Back
				</Button>
			</div>
			<div className="px-6 pt-6 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 dark:bg-gray-800">
				<p className="text-gray-900 text-xl text-start font-medium dark:text-white">
					Select the appropriate action
				</p>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16 pt-12">
					{options.map((option) => (
						<Card
							key={option.heading}
							className={`${
								option.path
									? 'grid items-center p-6 custom-card group transform transition duration-500 ease-in-out overflow-hidden overflow-ellipsis border border-gray-200 shadow-md hover:scale-105 cursor-pointer dark:hover:bg-primary hover:bg-primary'
									: 'grid items-center p-6 cursor-not-allowed bg-gray-300 text-gray-500 dark:border-gray-600 dark:bg-gray-700'
							}`}
							style={{
								maxHeight: '100%',
								overflow: 'auto',
								height: '168px',
								color: 'inherit',
							}}
							onClick={() => option.path && router.push(option.path)}
						>
							<div
								className={`overflow-hidden flex items-center min-[401px]:flex-nowrap flex-wrap ${
									option.path ? 'group-hover:text-white' : ''
								}`}
								style={{ color: 'inherit' }}
							>
								<div className="ml-4">
									<h5
										className={`text-2xl font-semibold ${
											option.path
												? 'text-primary dark:text-white group-hover:text-white'
												: 'text-gray-500'
										} pb-2`}
									>
										{option.heading}
									</h5>
									<p
										className={`text-base ${
											option.path
												? 'text-gray-700 dark:text-white group-hover:text-white'
												: 'text-gray-500'
										}`}
									>
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

export default Dashboard;
