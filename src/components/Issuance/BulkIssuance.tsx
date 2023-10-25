import { Card } from 'flowbite-react';
import React, { useState } from 'react';
import Select from 'react-select'

const BulkIssuance = () => {
	const [csvData, setCsvData] = useState<string[][]>([]);

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

	const options = [
		{ value: 'chocolate', label: 'Chocolate' },
		{ value: 'strawberry', label: 'Strawberry' },
		{ value: 'vanilla', label: 'Vanilla' }
	  ]

	const handleDrop = (e) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file) {
			handleFileUpload(file);
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

	return (
		<div>
			<Card>
				<div className="grid grid-cols-2">
					<div>
					<Select options={options} />
						{/* <div>
							<input
								placeholder="Choose Schema-credential definition"
								type="text"
								list="schema-cred-def-search"
								value={credentialDefinition}
								onChange={(e) => setCredentialDefinition(e.target.value)}
							/>
							<datalist id="schema-cred-def-search">
								{dummyOptions.map((option) => (
									<option key={option.id} value={option.name} />
								))}
							</datalist>
						</div> */}
						<div className="mt-20">
							<button className="text-primary-700 dark:text-primary-700 py-2 px-4 rounded inline-flex items-center border border-primary-700">
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

					<div onDrop={handleDrop} onDragOver={handleDragOver}>
						<label
							htmlFor="csv-file"
							className="flex flex-col items-center justify-center w-36 h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover-bg-gray-100 dark-border-gray-600 dark-hover-border-gray-500 dark-hover-bg-gray-600"
						>
							<div className="flex flex-col items-center justify-center pt-5 pb-6">
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
						<p className="steps-active-text">Select and download</p>
						<p>
							Select Schema - Credential definition and download .CSV file
							template
						</p>
					</li>
					<li className="mt-5">
						<p className="steps-active-text">Upload the filled CSV and issue</p>
						<p>Upload the correct filled CSV and start Bulk-Issuance</p>
					</li>
					<li className="mt-5">
						<p className="steps-active-text">
							Check the issunace details on history page
						</p>
						<p>
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
