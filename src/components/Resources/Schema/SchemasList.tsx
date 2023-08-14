'use client';

import { Alert, Button, Card, Pagination, Spinner, Table, } from 'flowbite-react';
import { ChangeEvent, useEffect, useState } from 'react';
import type { GetAllSchemaListParameter, PaginationData } from './interfaces';
import { apiStatusCodes, storageKeys } from '../../../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../../BreadCrumbs';
import SchemaCard from '../../../commonComponents/SchemaCard';
import SearchInput from '../../SearchInput';
import { getAllSchemas } from '../../../api/Schema';
import { getFromLocalStorage } from '../../../api/Auth';
import { pathRoutes } from '../../../config/pathRoutes';
import { EmptyListMessage } from '../../EmptyListComponent';

const SchemaList = (props: { schemaSelectionCallback: (schemaId: string) => void; }) => {
	const [schemaList, setSchemaList] = useState([])
	const [schemaListErr, setSchemaListErr] = useState<string | null>('')
	const [loading, setLoading] = useState<boolean>(true)
	const [orgId, setOrgId] = useState<string>('')
	const [schemaListAPIParameter, setSchemaListAPIParameter] = useState({
		itemPerPage: 9,
		page: 1,
		search: "",
		sortBy: "id",
		sortingOrder: "DESC"
	})

	const getSchemaList = async (schemaListAPIParameter: GetAllSchemaListParameter) => {
		try {
			const organizationId = await getFromLocalStorage(storageKeys.ORG_ID);
			setOrgId(organizationId);
			setLoading(true);

			const schemaList = await getAllSchemas(schemaListAPIParameter, organizationId);
			const { data } = schemaList as AxiosResponse;
			if (schemaList === 'Schema records not found') {
				setLoading(false);
				setSchemaList([]);
			}
			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				if (data?.data?.data?.length === 0) {
					setSchemaListErr('No Data Found');
				}
				if (data?.data?.data) {
					setSchemaList(data?.data?.data);
					setLoading(false);
				} else {
					setLoading(false);
					setSchemaListErr(schemaList as string)
				}
			} else {
				setLoading(false);
				setSchemaListErr(schemaList as string)
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
		getSchemaList(schemaListAPIParameter)
	}, []);

	useEffect(() => {
		getSchemaList(schemaListAPIParameter)

	}, [schemaListAPIParameter])

	const onSearch = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
		event.preventDefault()
		setSchemaListAPIParameter({
			...schemaListAPIParameter,
			search: event.target.value
		})

		getSchemaList({
			...schemaListAPIParameter,
			search: event.target.value
		})

	}

	const schemaSelectionCallback = (schemaId: string) => {
		props.schemaSelectionCallback(schemaId)
	}

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
						<Button
							id='createSchemaButton'
							onClick={() => {
								window.location.href = `${pathRoutes.organizations.createSchema}?OrgId=${orgId}`
							}}
							className='text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
						><svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
						<path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"/>
					  </svg>
							Create Schema
						</Button>
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

									<Pagination
										currentPage={1}
										onPageChange={(page) => {
											setSchemaListAPIParameter(prevState => ({
												...prevState,
												page: page
											}));
										}}
										totalPages={0}
									/>
								</div>
							</div>) : (<EmptyListMessage
								message={'No Schemas'}
								description={'Get started by creating a new Schema'}
								buttonContent={'Create Schema'}
								svgComponent={<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24">
									<path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
								</svg>}
								onClick={()=>{
									window.location.href = `${pathRoutes.organizations.createSchema}?OrgId=${orgId}`	
								}}
							/>)
					}
				</div>
			</div>
		</div>

	)
}


export default SchemaList
