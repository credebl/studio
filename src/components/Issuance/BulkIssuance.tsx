import { Button, Card } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { DownloadCsvTemplate, getSchemaCredDef } from '../../api/BulkIssuance';
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
	const [isFileUploaded, setIsFileUploaded] = useState(false);
	const [uploadedFileName, setUploadedFileName] = useState('');

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


	const DownloadSchemaTemplate = async () => {
		setLoading(true);
		const orgId = await getFromLocalStorage(storageKeys.CRED_DEF_ID);

		if (orgId) {
			const response = await DownloadCsvTemplate();
			console.log('API Response:', response);
			const { data } = response as AxiosResponse;

			if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) 
			{
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
		DownloadSchemaTemplate();
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
				setIsFileUploaded(true);
				setUploadedFileName(file.name)
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
		<div className='flex flex-col justify-between min-h-100/21rem'>
			<Card>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className='flex flex-col justify-between'>
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
						<div className="mt-4">
							<button className={`text-primary-700 dark:text-primary-700 py-2 px-4 rounded inline-flex items-center border border-primary-700  ${!isCredSelected ? "opacity-50" : ""}`}
							
							disabled={!isCredSelected}>
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
							<div 
							className={`flex flex-col items-center justify-center pt-5 pb-6 ${!isCredSelected ? "opacity-50" : ""}`}
							>
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
						<p className="mt-2">{uploadedFileName}</p>
						<div className="w-fit">
							<label htmlFor="organizationlogo">
								<div className={`px-4 py-2 mt-4 ml-4 bg-primary-700 hover-bg-primary-800 text-white text-center rounded-lg ${!isCredSelected ? "opacity-50" : ""}`}>
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
			
			<div >
			{!isCredSelected && 
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
			}
			<div>
						<Button
						disabled={!isFileUploaded}
                          type="reset"
                          color='bg-primary-800'
                          className='float-right py-2 bg-primary-700 ring-primary-700  hover:bg-primary-800 ring-2 text-white font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto dark:text-white dark:hover:text-white dark:hover:bg-primary-800'

                          style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
                        >
                        <svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="30" height="25" fill="none" viewBox="0 0 25 18">
									<path fill="#fff" d="M.702 10.655a.703.703 0 1 0-.001-1.406.703.703 0 0 0 .001 1.406Z" />
									<path fill="#fff" d="m24.494 5.965-5.8-5.8a.562.562 0 0 0-.795 0l-2.06 2.06H8.884c-1.602 0-3.128.73-4.137 1.966H3.652V3.35a.562.562 0 0 0-.562-.562H.562a.562.562 0 0 0 0 1.123h1.966v7.866H.562a.562.562 0 0 0 0 1.124H3.09c.31 0 .562-.252.562-.562v-1.404h1.096A5.358 5.358 0 0 0 8.885 12.9h.653l4.01 4.01a.56.56 0 0 0 .795 0l10.15-10.15a.562.562 0 0 0 0-.795ZM5.478 10.04a.562.562 0 0 0-.455-.231h-1.37V5.315h1.37c.18 0 .349-.086.455-.23a4.23 4.23 0 0 1 3.407-1.736h5.83L11.38 6.682a5.675 5.675 0 0 1-1.238-1.243.562.562 0 0 0-.908.66 6.74 6.74 0 0 0 4.429 2.71.633.633 0 0 1-.197 1.25 8 8 0 0 1-4.14-1.974.562.562 0 0 0-.755.833c.1.091.204.18.308.266l-1.132 1.131a.562.562 0 0 0 0 .795l.637.636a4.235 4.235 0 0 1-2.907-1.705Zm8.468 5.677L8.94 10.713l.86-.86a9.16 9.16 0 0 0 3.492 1.316 1.759 1.759 0 0 0 2.008-1.46 1.758 1.758 0 0 0-1.461-2.01 5.69 5.69 0 0 1-1.454-.432l5.911-5.91 5.006 5.005-9.356 9.356Z" />
								</svg>

                          Issue
                        </Button>
						<Button
			              disabled={!isFileUploaded}
                          type="reset"
                          color='bg-primary-800' 
                         
                          className='float-right py-4 bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 ml-auto dark:text-white dark:hover:text-black dark:hover:bg-primary-50'

                          style={{ height: '2.6rem', width: '6rem', minWidth: '2rem' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className='mr-2' width="18" height="18" fill="none" viewBox="0 0 20 20">
                            <path fill="#1F4EAD" d="M19.414 9.414a.586.586 0 0 0-.586.586c0 4.868-3.96 8.828-8.828 8.828-4.868 0-8.828-3.96-8.828-8.828 0-4.868 3.96-8.828 8.828-8.828 1.96 0 3.822.635 5.353 1.807l-1.017.18a.586.586 0 1 0 .204 1.153l2.219-.392a.586.586 0 0 0 .484-.577V1.124a.586.586 0 0 0-1.172 0v.928A9.923 9.923 0 0 0 10 0a9.935 9.935 0 0 0-7.071 2.929A9.935 9.935 0 0 0 0 10a9.935 9.935 0 0 0 2.929 7.071A9.935 9.935 0 0 0 10 20a9.935 9.935 0 0 0 7.071-2.929A9.935 9.935 0 0 0 20 10a.586.586 0 0 0-.586-.586Z" />
                          </svg>

                          Reset
                        </Button>
						
			</div>
				
			</div>
		</div>
	);
};

export default BulkIssuance;
