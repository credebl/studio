'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { getPublicOrganizations } from '../../api/organization';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import SearchInput from '../SearchInput';
import { Button, Card, Pagination } from 'flowbite-react';
import CustomSpinner from '../CustomSpinner';
import CustomAvatar from '../Avatar';
import { EmptyListMessage } from '../EmptyListComponent';

const OrganisationPublicProfile = () => {
	const initialPageState = {
		pageNumber: 1,
		pageSize: 10,
		total: 0,
	};

	const [organizationsList, setOrganizationList] = useState([]);

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
			<div className="flex items-center justify-between mb-4 p-2 pl-0">
				<SearchInput onInputChange={searchInputChange} />
			</div>

			<div className="flex flex-wrap">
				{loading ? (
					<div className="flex items-center justify-center mb-4 ">
						<CustomSpinner />
					</div>
				) : organizationsList && organizationsList?.length > 0 ? (
					<div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2">
						{organizationsList?.map(
							(org: {
								logoUrl: string;
								name: string;
								description: string;
								id: number;
								orgSlug: string;
							}) => (
								<Card
									onClick={() => {
										window.location.href = `/org/${org?.orgSlug}`;
									}}
									className="transform transition duration-500 hover:scale-[1.02] hover:bg-gray-50 cursor-pointer"
								>
									<div className="flex items-center">
										{org.logoUrl ? (
											<CustomAvatar size="80" src={org?.logoUrl} />
										) : (
											<CustomAvatar size="80" name={org?.name} />
										)}

										<div className="ml-4">
											<h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
												<p>{org?.name}</p>
											</h5>
											<div className="flow-root h-auto">
												<ul className="divide-y divide-gray-200 dark:divide-gray-700">
													<li className="py-3 sm:py-4 overflow-auto">
														<div className="flex items-center space-x-4">
															<div className="inline-flex items-center text-base text-lg text-gray-900 dark:text-white">
																{org?.description}
															</div>
														</div>
													</li>
												</ul>
											</div>
										</div>
									</div>
								</Card>
							),
						)}
					</div>
				) : (
					organizationsList && (
						<div className="flex justify-center items-center">
							<EmptyListMessage
								message={'No Matching Organization'}
								description={''}
							/>
						</div>
					)
				)}

				<div className="flex items-center justify-end mb-4">
					{organizationsList && organizationsList?.length > 0 && (
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
