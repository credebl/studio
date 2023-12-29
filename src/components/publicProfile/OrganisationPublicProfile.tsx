'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { getPublicOrganizations } from '../../api/organization';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import SearchInput from '../SearchInput';
import { Card, Pagination } from 'flowbite-react';
import CustomSpinner from '../CustomSpinner';
import CustomAvatar from '../Avatar';
import { EmptyListMessage } from '../EmptyListComponent';
import { AlertComponent } from '../AlertComponent';

const OrganisationPublicProfile = () => {
	const initialPageState = {
		pageNumber: 1,
		pageSize: 12,
		total: 0,
	};

	const [organizationList, setOrganizationList] = useState([]);

	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [searchText, setSearchText] = useState('');
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};

	const getAllOrganizations = async () => {
		setLoading(true);
		const response = await getPublicOrganizations(
			currentPage?.pageNumber,
			currentPage?.pageSize,
			searchText,
		);

		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes?.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;

			const orgList = data?.data?.organizations.map((userOrg: any) => {
				return userOrg;
			});

			setOrganizationList(orgList);
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (searchText?.length >= 1) {
			getData = setTimeout(() => {
				getAllOrganizations();
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getAllOrganizations();
		}

		return () => clearTimeout(getData);
	}, [searchText, currentPage.pageNumber]);

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	return (
		<div>
			<div className="flex justify-between items-center w-full">
				<h1 className="ml-1 px-4 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Organizations
				</h1>
				<div className="flex items-end justify-end mb-4 p-2 pl-0">
					<SearchInput onInputChange={searchInputChange} />
				</div>
			</div>

			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null);
				}}
			/>

			<div className="flex flex-wrap justify-center">
				{loading ? (
					<div className="flex items-center justify-center mb-4 min-h-[5rem]">
						<CustomSpinner />
					</div>
				) : organizationList && organizationList?.length > 0 ? (
					<div className="mt-1 grid w-full grid-cols-1 gap-4 md:gap-6 mt-0 mb-4 sm:grid-cols-2 lg:grid-cols-3">
						{organizationList?.map(
							(org: {
								logoUrl: string;
								name: string;
								description: string;
								id: string;
								orgSlug: string;
							}) => (
								<Card
									key={org.orgSlug}
									onClick={() => {
										window.location.href = `/org/${org?.orgSlug}`;
									}}
									className="transform transition duration-500 hover:scale-[1.02] hover:bg-gray-50 cursor-pointer"
								>
									<div className="flex items-start">
										<div className="shrink-0">
											{org.logoUrl ? (
												<CustomAvatar size="80" src={org?.logoUrl} />
											) : (
												<CustomAvatar size="80" name={org?.name} />
											)}
										</div>

										<div className="ml-4 line-clamp-4">
											<h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
												{org?.name}
											</h5>
											<p className="text-lg tracking-tight text-gray-900 dark:text-white truncate line-clamp-2 whitespace-pre-wrap">
												{org?.description}
											</p>
										</div>
									</div>
								</Card>
							),
						)}
					</div>
				) : (
					<div className="flex justify-center items-center w-full">
						{organizationList && (
							<div className="w-full flex justify-center items-center bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
								<EmptyListMessage
									message={'No Organization Found'}
									description={
										'There is no organization that matches your search'
									}
								/>
							</div>
						)}
					</div>
				)}
			</div>
			<div className="relative mt-16 flex items-center justify-end mb-4 flex-grow">
				<div className="absolute bottom-4 right-4">
					{organizationList && organizationList?.length > 0 && (
						<Pagination
							currentPage={currentPage?.pageNumber}
							onPageChange={onPageChange}
							totalPages={currentPage?.total}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default OrganisationPublicProfile;
