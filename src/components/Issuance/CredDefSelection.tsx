'use client';

import type { CredDefData, SchemaState } from './interface';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import { getFromLocalStorage, setToLocalStorage } from '../../api/Auth';
import { useEffect, useState } from 'react';

import { AlertComponent } from '../AlertComponent';
import type { AxiosResponse } from 'axios';
import BreadCrumbs from '../BreadCrumbs';
import { Button } from 'flowbite-react';
import CustomSpinner from '../CustomSpinner';
import DataTable from '../../commonComponents/datatable';
import SchemaCard from '../../commonComponents/SchemaCard';
import type { TableData } from '../../commonComponents/datatable/interface';
import { dateConversion } from '../../utils/DateConversion';
import { getCredentialDefinitions } from '../../api/issuance';
import { pathRoutes } from '../../config/pathRoutes';
import DateTooltip from '../Tooltip';
import BackButton from '../../commonComponents/backbutton';

const CredDefSelection = () => {
	const [schemaState, setSchemaState] = useState({
		schemaName: '',
		version: '',
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [schemaLoader, setSchemaLoader] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [credDefList, setCredDefList] = useState<TableData[]>([]);
	const [schemaDetailsState, setSchemaDetailsState] = useState<SchemaState>({
		schemaId: '',
		issuerDid: '',
		attributes: [],
		createdDateTime: '',
	});

	useEffect(() => {
		getSchemaAndCredDef();
	}, []);

	const getSchemaAndCredDef = async () => {
		const schemaId = await getFromLocalStorage(storageKeys.SCHEMA_ID);

		if (schemaId) {
			getSchemaDetails(schemaId);
			getCredDefs(schemaId);
			const parts = schemaId.split(':');
			const schemaName = parts[2];
			const version = parts[3];
			setSchemaState({ schemaName, version });
		} else {
			setSchemaState({ schemaName: '', version: '' });
		}
	};

	const getSchemaDetails = async (schemaId: string) => {
		setSchemaLoader(true);
		const schemaDid = await getFromLocalStorage(storageKeys.SCHEMA_ATTR);
		const schemaDidObject = JSON.parse(schemaDid);
		if (schemaDidObject) {
			setSchemaDetailsState({
				schemaId: schemaId,
				issuerDid: schemaDidObject?.issuerDid,
				attributes: schemaDidObject?.attribute,
				createdDateTime: schemaDidObject?.createdDate,
			});
		}
		setSchemaLoader(false);
	};

	const header = [
		{ columnName: 'Name' },
		{ columnName: 'Created on' },
		{ columnName: 'Revocable' },
		{ columnName: ' ' },
	];

	const getCredDefs = async (schemaId: string) => {
		setLoading(true);
		const response = await getCredentialDefinitions(schemaId);

		const { data } = response as AxiosResponse;

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const credDefs = data?.data?.data.map((ele: CredDefData) => {
				return {
					clickId: ele.credentialDefinitionId,
					data: [
						{ data: ele.tag ? ele.tag : 'Not available' },
						{
							data: ele?.createDateTime ? (
								<DateTooltip date={ele?.createDateTime}>
									{' '}
									{dateConversion(ele?.createDateTime)}{' '}
								</DateTooltip>
							) : (
								'Not available'
							),
						},
						{
							data:
								ele.revocable === true ? (
									<span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-green-400 border border-green-100 dark:border-green-500">
										Yes
									</span>
								) : (
									<span className="bg-red-100 text-red-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-md border border-red-100 dark:border-red-400 dark:bg-gray-700 dark:text-red-400">
										No
									</span>
								),
						},
					],
				};
			});

			if (credDefs.length === 0) {
				setError('No Data Found');
			}

			setCredDefList(credDefs);
		} else {
			setError(response as string);
		}

		setLoading(false);
	};

	const schemaSelectionCallback = () => {};

	const selectCredDef = async (credDefId: string | null | undefined) => {
		if (credDefId) {
			await setToLocalStorage(storageKeys.CRED_DEF_ID, credDefId);
			window.location.href = `${pathRoutes.organizations.Issuance.connections}`;
		}
	};

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
				<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.back.issuance.schemas} />
				</div>

				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Schema
				</h1>
			</div>
			<div className="mb-4 col-span-full xl:mb-2 pb-3">
				{schemaLoader ? (
					<div className="flex items-center justify-center mb-4">
						<CustomSpinner />
					</div>
				) : (
					<div className="m-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap4">
						<SchemaCard
							className="col-span-1 sm:col-span-2 md:col-span-1"
							schemaName={schemaState?.schemaName}
							version={schemaState?.version}
							schemaId={schemaDetailsState.schemaId}
							issuerDid={schemaDetailsState.issuerDid}
							attributes={schemaDetailsState.attributes}
							created={schemaDetailsState.createdDateTime}
							onClickCallback={schemaSelectionCallback}
							isClickable={false}
							limitedAttributes={false}
						/>
					</div>
				)}
			</div>

			<div className="mb-4 col-span-full xl:mb-2 pt-5 flex">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Credential definitions
				</h1>
				<Button
					id="createSchemaButton"
					onClick={() => {
						window.location.href = `${pathRoutes.organizations.viewSchema}?schemaId=${schemaDetailsState?.schemaId}`;
					}}
					className="ml-auto text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
					title="Create new credential-definition"
				>
					<svg
						className="pr-2"
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							fill="#fff"
							d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z"
						/>
					</svg>
					Create
				</Button>
			</div>
			<div className="ml-2 text-base font-normal text-gray-500 dark:text-gray-400">
				You can select only one credential definition at a time.
			</div>

			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null);
				}}
			/>
			<DataTable
				header={header}
				data={credDefList}
				loading={loading}
				callback={selectCredDef}
				showBtn={true}
			></DataTable>
		</div>
	);
};

export default CredDefSelection;
