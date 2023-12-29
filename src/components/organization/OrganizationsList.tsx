'use client';
import React from 'react';
import { Card, Pagination } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';

import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import CustomAvatar from '../Avatar';
import { Features } from '../../utils/enums/features';
import type { Organisation } from './interfaces';
import RoleViewButton from '../RoleViewButton';
import SearchInput from '../SearchInput';
import { getOrganizations } from '../../api/organization';
import { pathRoutes } from '../../config/pathRoutes';
import { setToLocalStorage } from '../../api/Auth';
import { EmptyListMessage } from '../EmptyListComponent';
import CustomSpinner from '../CustomSpinner';
import CreateEcosystemOrgModal from '../CreateEcosystemOrgModal';

const initialPageState = {
	pageNumber: 1,
	pageSize: 9,
	total: 100,
};

const OrganizationsList = () => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(initialPageState);
	const onPageChange = (page: number) => {
		setCurrentPage({
			...currentPage,
			pageNumber: page,
		});
	};
	const [searchText, setSearchText] = useState('');

	const [organizationsList, setOrganizationsList] =
		useState<Array<Organisation> | null>(null);

	const props = { openModal, setOpenModal };

	const createOrganizationModel = () => {
		props.setOpenModal(true);
	};

	//Fetch the user organization list
	const getAllOrganizations = async () => {
		setLoading(true);
		const response = await getOrganizations(
			currentPage.pageNumber,
			currentPage.pageSize,
			searchText,
		);
		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const totalPages = data?.data?.totalPages;

			const orgList = data?.data?.organizations.map((userOrg: Organisation) => {
				const roles: string[] = userOrg.userOrgRoles.map(
					(role) => role.orgRole.name,
				);
				userOrg.roles = roles;
				return userOrg;
			});

			setOrganizationsList(orgList);
			setCurrentPage({
				...currentPage,
				total: totalPages,
			});
		} else {
			setError(response as string);
		}
		setLoading(false);
	};

	//This useEffect is called when the searchText changes
	useEffect(() => {
		let getData: NodeJS.Timeout;

		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getAllOrganizations();
			}, 1000);
			return () => clearTimeout(getData);
		} else {
			getAllOrganizations();
		}

		return () => clearTimeout(getData);
	}, [searchText, openModal, currentPage.pageNumber]);

	useEffect(() => {
		const queryParameters = new URLSearchParams(window?.location?.search);
		const isModel = queryParameters.get('orgModal') ?? '';

		if (isModel !== '') {
			props.setOpenModal(true);
		}
	}, []);

	//onCHnage of Search input text
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
	};

	const redirectOrgDashboard = async (activeOrg: Organisation) => {
		await setToLocalStorage(storageKeys.ORG_ID, activeOrg.id.toString());
		const roles: string[] = activeOrg?.userOrgRoles.map(
			(role) => role.orgRole.name,
		);
		activeOrg.roles = roles;

		await setToLocalStorage(storageKeys.ORG_ROLES, roles.toString());
		window.location.href = pathRoutes.organizations.dashboard;
	};
	let content: React.JSX.Element = <></>;
	if (organizationsList && organizationsList?.length > 0) {
		content = (
			<div>
				<div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
					{organizationsList.map((org) => (
						<Card
							key={org.id}
							onClick={() => redirectOrgDashboard(org)}
							className="transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer overflow-hidden overflow-ellipsis"
							style={{
								maxHeight: '100%',
								maxWidth: '100%',
								overflow: 'auto',
							}}
						>
							<div className="flex items-center min-[401px]:flex-nowrap flex-wrap">
								{org.logoUrl ? (
									<CustomAvatar
										className="min-w-[80px]"
										size="80"
										src={org?.logoUrl}
									/>
								) : (
									<CustomAvatar size="80" name={org.name} />
								)}

								<div className="ml-4 w-100/6rem line-clamp-4 ">
									<h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
										{org?.name}
									</h5>
									<p className="text-base tracking-tight text-gray-900 dark:text-white truncate">
										{org?.description}
									</p>
									<div className="flow-root h-auto">
										<ul className="divide-y divide-gray-200 dark:divide-gray-700">
											<li className="pt-2 sm:pt-3 overflow-auto">
												<div className="flex items-center space-x-4">
													<div className="inline-flex flex-wrap items-center text-base font-semibold text-gray-900 dark:text-white">
														Role(s):
														{org.roles &&
															org.roles.length > 0 &&
															org.roles.map((role: string, index: number) => {
																return (
																	<span
																		key={index}
																		className="m-1 bg-primary-50 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
																	>
																		{role.charAt(0).toUpperCase() + role.slice(1)}
																	</span>
																);
															})}
													</div>
												</div>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
				<div>
					{currentPage.total > 1 && (
						<div className="flex items-center justify-end mb-4">
							<Pagination
								currentPage={currentPage.pageNumber}
								onPageChange={onPageChange}
								totalPages={currentPage.total}
							/>
						</div>
					)}
				</div>
			</div>
		);
	} else if (organizationsList) {
		content = (
			<EmptyListMessage
				message={'No Organization'}
				description={'Get started by creating a new Organization'}
				buttonContent={'Create Organization'}
				onClick={createOrganizationModel}
				feature={Features.CRETAE_ORG}
				svgComponent={
					<svg
						className="pr-2 mr-1"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="15"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							fill="#fff"
							d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
						/>
					</svg>
				}
			/>
		);
	}

	return (
		<div className="px-4 pt-2">
			<div className="mb-2 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>

			<div className='mb-4 flex justify-between flex-wrap gap-4 items-center'>
				<h1 className="ml-1 text-xl font-semibold mb-4 flex justify-between flex-wrap gap-4  text-gray-900 sm:text-2xl dark:text-white">
					Organizations
				</h1>
				<div className="ml-auto">
					<SearchInput
						onInputChange={searchInputChange}
					/>
				</div>
				<RoleViewButton
					buttonTitle='Create'
					feature={Features.CRETAE_ORG}
					svgComponent={
						<div className='pr-3'>
							<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
								<path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
							</svg>
						</div>
					}
					onClickEvent={createOrganizationModel}
				/>

			</div>
			<div>
				<div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700   sm:p-6 dark:bg-gray-800">

					<CreateEcosystemOrgModal
						openModal={props.openModal}
						setMessage={(data) => setMessage(data)}
						setOpenModal={props.setOpenModal}
						isorgModal={true}
					/>
					<AlertComponent
						message={message || error}
						type={message ? 'success' : 'failure'}
						onAlertClose={() => {
							setMessage(null);
							setError(null);
						}}
					/>

					{loading ? (
						<div className="flex items-center justify-center mb-4 ">
							<CustomSpinner />
						</div>
					) : (
						<div>{content}</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default OrganizationsList;
