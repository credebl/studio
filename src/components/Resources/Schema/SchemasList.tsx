'use client';

import { Alert, Button, Card, Pagination, Spinner, Table, } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import type { GetAllSchemaListParameter, PaginationData } from './interfaces';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import SchemaCard from '../../../commonComponents/SchemaCard';
import SearchInput from '../../SearchInput';
import { getAllSchemasByOrgId, getAllSchemas } from '../../../api/Schema';
import { getFromLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';
import { EmptyListMessage } from '../../EmptyListComponent';
import type { SchemaDetails } from '../../Verification/interface';

const SchemaList = (props: { schemaSelectionCallback: (schemaId: string, schemaDetails: SchemaDetails) => void; }) => {
	const [schemaList, setSchemaList] = useState([])
	const [schemaListErr, setSchemaListErr] = useState<string | null>('')
	const [loading, setLoading] = useState<boolean>(true)
	const [allSchemaFlag, setAllSchemaFlag] = useState<boolean>(false)
	const [orgId, setOrgId] = useState<string>('')
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: 9,
		page: 1,
		search: "",
		sortBy: "id",
		sortingOrder: "DESC",
		allSearch: ""

	})
	const [totalItem, setTotalItem] = useState(0)
	const getSchemaList = async (schemaListAPIParameter: GetAllSchemaListParameter, flag: boolean) => {
		try {
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			setOrgId(organizationId);
			setLoading(true);
			let schemaList
			if (allSchemaFlag) {
				schemaList = await getAllSchemas(schemaListAPIParameter);
			} else {
				schemaList = await getAllSchemasByOrgId(schemaListAPIParameter, organizationId);
			}
			const { data } = schemaList as AxiosResponse;
			if (schemaList === 'Schema records not found') {
				setLoading(false);
				setSchemaList([]);
			}

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				if (data?.data?.data) {
					setTotalItem(data?.data.totalItems)
					setSchemaList(data?.data?.data);
					setLoading(false);
				} else {
					setLoading(false);
					if (schemaList !== 'Schema records not found') {
						setSchemaListErr(schemaList as string)

					}
				}
			} else {
				setLoading(false);
				if (schemaList !== 'Schema records not found') {
					setSchemaListErr(schemaList as string)

				}
			}
			setTimeout(() => {
				setSchemaListErr('')
			}, 3000)
		} catch (error) {
			console.error('Error while fetching schema list:', error);
			setLoading(false);

		}
	};

	useEffect(() => {
		getSchemaList(schemaListAPIParameter, false)

	}, [schemaListAPIParameter, allSchemaFlag])

	const onSearch = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
		event.preventDefault()
		getSchemaList({
			...schemaListAPIParameter,
			search: event.target.value
		}, false)

		if (allSchemaFlag) {
			getSchemaList({
				...schemaListAPIParameter,
				allSearch: event.target.value
			}, false)
		}

	}

	const schemaSelectionCallback = (schemaId: string, attributes: string[], issuerId: string, created: string) => {
		const schemaDetails = {
			attribute: attributes,
			issuerDid: issuerId,
			createdDate: created

		}
		props.schemaSelectionCallback(schemaId, schemaDetails)
	}
	const options = ["All schemas"]

	const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (e.target.value === 'All schemas') {
			setAllSchemaFlag(true)
		}
		else {
			setAllSchemaFlag(false)
			getSchemaList(schemaListAPIParameter, false)
		}
	};

	return (
		<div className="px-4 pt-6">
			<div className="mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Schemas
				</h1>
			</div>
			<div>
				<div
					className=""
				>
					<div className="flex flex-col items-center justify-between mb-4 pr-4 sm:flex-row">
						<div id='schemasSearchInput' className='mb-2 pl-2'>
							<SearchInput
								onInputChange={onSearch}
							/>
						</div>
						<div className='flex space-x-2'>
							<select onChange={handleFilter} id="schamfilter" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
								<option selected>Organization's schema</option>
								{options.map((opt) => (
									<option
										key={opt}
										className=""
										value={opt}
									>
										{opt}
									</option>
								))}
							</select>

							<Button
								id='createSchemaButton'
								onClick={() => {
									window.location.href = `${pathRoutes.organizations.createSchema}?OrgId=${orgId}`
								}}
								className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
								title='Create New Schema'  // This is the tooltip text
							>
								<svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
									<path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
								</svg>
								Create
							</Button>
						</div>
					</div>
				</div>
				{
					schemaListErr &&
					<Alert
						color="failure"
						onDismiss={() => setSchemaListErr(null)}
					>
						<span>
							<p>
								{schemaListErr}
							</p>
						</span>
					</Alert>
				}
				{loading
					? (<div className="flex items-center justify-center mb-4">
						<Spinner
							color="info"
						/>
					</div>)
					:
					schemaList && schemaList.length > 0 ? (
						<div className='Flex-wrap' style={{ display: 'flex', flexDirection: 'column' }}>
							<div className="mt-1 grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3">
								{schemaList && schemaList.length > 0 &&
									schemaList.map((element, key) => (
										<div className='p-2' key={key}>
											<SchemaCard schemaName={element['name']} version={element['version']} schemaId={element['schemaLedgerId']} issuerDid={element['issuerId']} attributes={element['attributes']} created={element['createDateTime']}
												onClickCallback={schemaSelectionCallback} />
										</div>
									))}
							</div>
							<div className="flex items-center justify-end mb-4" id="schemasPagination">

								{schemaList.length> 0 &&(<Pagination
									currentPage={schemaListAPIParameter?.page}
									onPageChange={(page) => {
										setSchemaListAPIParameter(prevState => ({
											...prevState,
											page: page
										}));
									}}
									totalPages={Math.ceil(totalItem / schemaListAPIParameter?.itemPerPage)}
								/>)}
							</div>
						</div>) : (<EmptyListMessage
							message={'No Schemas'}
							description={'Get started by creating a new Schema'}
							buttonContent={'Create Schema'}
							svgComponent={<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
								<path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
							</svg>}
							onClick={() => {
								window.location.href = `${pathRoutes.organizations.createSchema}?OrgId=${orgId}`
							}}
						/>)
				}
			</div>
		</div>


	)
}


export default SchemaList
