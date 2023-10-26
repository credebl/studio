import { Card } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { getSchemaCredDef } from '../../api/BulkIssuance';
import { getFromLocalStorage } from '../../api/Auth';
import { apiStatusCodes, storageKeys } from '../../config/CommonConstant';
import type { AxiosResponse } from 'axios';

interface IValues {
	value: string;
	label: string;
}

const BulkIssuance = () => {
	const [csvData, setCsvData] = useState<string[][]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [credentialOptions, setCredentialOptions] = useState([]);
	const [credentialSelected, setCredentialSelected] = useState('');

	const getSchemaCredentials = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
		if (orgId) {
			const response = await getSchemaCredDef();
			console.log('API Response:', response);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
				const credentialDefs = data.data;

				const options = credentialDefs.map(
					(credDef: {
						credentialDefinitionId: string;
						schemaCredDefName: string;
					}) => ({
						value: credDef.credentialDefinitionId,
						label: credDef.schemaCredDefName,
					}),
				);

				setCredentialOptions(options);
			} else {
				setError(response as string);
			}
			setLoading(false);
		}
	};

	useEffect(() => {
		getSchemaCredentials();
	}, []);

	const handleFileUpload = (file) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			const result = event.target.result;
			if (typeof result === 'string') {
				const text = result;
				const rows = text.split('\n');
				const data = rows.map((row) => row.split(','));
				setCsvData(data);
			}
		};

		reader.readAsText(file);
	};

	const handleDrop = (e) => {
		e.preventDefault();
		if(isCredSelected){
			const file = e.dataTransfer.files[0];
			if (file) {
				handleFileUpload(file);
			}
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
	};

	const handleInputChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			handleFileUpload(file);
		}
	};

	const isCredSelected = Boolean(credentialSelected)

	return (
		<div>
			<Card>
				<div className="grid grid-cols-2 ">
					<div>
						<div className="search-dropdown text-primary-700 drak:text-primary-700">
							<Select
								placeholder="Select Schema-Cred def"
								className="basic-single "
								classNamePrefix="select"
								isDisabled={false}
								isClearable={true}
								isRtl={false}
								isSearchable={true}
								name="color"
								options={credentialOptions}
								onChange={(value: IValues | null) => {
									console.log(7676, value)
									setCredentialSelected(value?.value || '');
								}}
							/>
						</div>
						<div className="mt-20">
							<button className="text-primary-700 dark:text-primary-700 py-2 px-4 rounded inline-flex items-center border border-primary-700" disabled={!isCredSelected}>
								<svg
									className="h-6 w-6 text-primary-700"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
									/>
								</svg>
								<span>Download Template</span>
							</button>
						</div>
					</div>

					<div onDrop={handleDrop} onDragOver={handleDragOver}  >
						<label
							htmlFor="csv-file"
							className="flex flex-col items-center justify-center w-36 h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover-bg-gray-100 dark-border-gray-600 dark-hover-border-gray-500 dark-hover-bg-gray-600"
						>
							<div className="flex flex-col items-center justify-center pt-5 pb-6" >
								<svg
									className="h-12 w-12 text-gray-500"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									{' '}
									<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />{' '}
									<polyline points="16 6 12 2 8 6" />{' '}
									<line x1="12" y1="2" x2="12" y2="15" />
								</svg>
								<p className="mb-2 mt-2 text-sm text-gray-500 dark-text-gray-400">
									<span className="font-semibold">Drag .CSV file here</span>
								</p>
							</div>
						</label>
						<div className="w-fit">
							<label htmlFor="organizationlogo">
								<div className="px-4 py-2 mt-4 ml-4 bg-primary-700 hover-bg-primary-800 text-white text-center rounded-lg">
									Choose file
								</div>
								<input
								    disabled={!isCredSelected}
									type="file"
									accept=".csv"
									name="file"
									className="hidden"
									id="organizationlogo"
									onChange={handleInputChange}
									title=""
								/>
							</label>
						</div>
					</div>
				</div>

				{csvData.length > 0 && (
					<div className="mt-4">
						<h2>CSV Data:</h2>
						<table className="table-auto">
							<thead>
								<tr>
									{csvData[0].map((header, index) => (
										<th key={index} className="border px-4 py-2">
											{header}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{csvData.slice(1).map((row, rowIndex) => (
									<tr key={rowIndex}>
										{row.map((cell, cellIndex) => (
											<td key={cellIndex} className="border px-4 py-2">
												{cell}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Card>
			<div>
				<ul className="timelinestatic m-12">
					<li className="">
						<p className="steps-active-text text-primary-700 dark-text-primary-700">
							Select and download
						</p>
						<p className="text-primary-700 dark-text-primary-700">
							Select Credential definition and download .CSV template template
						</p>
					</li>
					<li className="mt-5">
						<p className="steps-active-text text-primary-700 dark-text-primary-700">
							Fill the data
						</p>
						<p className="text-primary-700 dark-text-primary-700">
							Fill issuance data in the downloaded .CSV template
						</p>
					</li>
					<li className="mt-5">
						<p className="steps-active-text text-primary-700 dark-text-primary-700">
							Check the issunace details on history page
						</p>
						<p className="text-primary-700 dark-text-primary-700">
							After the completion of issuance, see the details of issuance on
							history page
						</p>
					</li>
				</ul>
			</div>
		</div>
	);
};

export default BulkIssuance;
