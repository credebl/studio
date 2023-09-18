'use client';

import React, { ChangeEvent, useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { apiStatusCodes } from '../../config/CommonConstant';
import { getPublicUsers } from '../../api/organization';
import SearchInput from '../SearchInput';
import { Card, Pagination } from 'flowbite-react';
import CustomAvatar from '../Avatar';
import CustomSpinner from '../CustomSpinner';

const PublicUserList = () => {
	const initialPageState = {
		pageNumber: 1,
		pageSize: 10,
		total: 0,
	};
	const [usersData, setUsersData] = useState([]);
	const [searchText, setSearchText] = useState('');

	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};
	const getAllPublicUsers = async () => {
		setLoading(true);
		const response = await getPublicUsers(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
		);

		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;

			const usersList = data?.data?.users.map((users: any) => {
				return users;
			});

			setUsersData(usersList);
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

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getAllPublicUsers();
			}, 1000);
		} else {
			getAllPublicUsers();
		}

		return () => clearTimeout(getData);
	}, [searchText, currentPage.pageNumber]);

	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	return (
		<>
			<div className="p-2 mb-4 pl-0">
				<SearchInput onInputChange={searchInputChange} />
			</div>

			<div className="flex flex-wrap">
				{loading ? (
					<>
						<CustomSpinner />
					</>
				) : usersData && usersData?.length > 0 ? (
					<div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2">
						{usersData.map(
							(user: { logoUrl: string; firstName: string; email: string , id:number, username:string}) => (
								<Card onClick={()=>{ window.location.href=`/publicUser/${user.username}`}} className="transform transition duration-500 hover:scale-[1.02] hover:bg-gray-50 cursor-pointer">
									<div className="flex items-center">
										{user.logoUrl ? (
											<CustomAvatar size="80" src={user.logoUrl} />
										) : (
											<CustomAvatar size="80" name={user.firstName} />
										)}

										<div className="ml-4">
											<h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
												<p>{user.firstName}</p>
											</h5>
											<div className="flow-root h-auto">
												<ul className="divide-y divide-gray-200 dark:divide-gray-700">
													<li className="py-3 sm:py-4 overflow-auto">
														<div className="flex items-center space-x-4">
															<div className="inline-flex items-center text-base text-lg text-gray-900 dark:text-white">
																{user.email}
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
					''
				)}

				<div className="flex items-center justify-end mb-4">
					{usersData && usersData?.length > 0 && (
						<Pagination
							currentPage={currentPage.pageNumber}
							onPageChange={onPageChange}
							totalPages={currentPage.total}
						/>
					)}
				</div>
			</div>
		</>
	);
};

export default PublicUserList;
