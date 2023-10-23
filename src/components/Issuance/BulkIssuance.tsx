import { Card } from 'flowbite-react';
import React, { useState } from 'react';

const BulkIssuance = () => {
	const [credentialDefinition, setCredentialDefinition] =
		useState('ChooseFromDropDown');
	const [selectedFile, setSelectedFile] = useState(null);
	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setSelectedFile(file);

		}
	};
	return (
		<Card>
			<div className="grid grid-cols-2">
				<div>
					<select
						value={credentialDefinition}
						onChange={(e) => setCredentialDefinition(e.target.value)}
					>
						<option value="ChooseFromDropDown">Choose Schema-Credential</option>
					</select>
				</div>
				<div>
					<label
						htmlFor="csv-file"
						className=" flex flex-col items-center justify-center w-36 h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
					>
						<div className="flex flex-col items-center justify-center pt-5 pb-6">
							<svg
								className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 20 16"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
								></path>
							</svg>
							<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
								<span className="font-semibold">Drag file here</span>
							</p>
						</div>
					</label>
					<div className="w-fit">
						<label htmlFor="organizationlogo">
							<div className="px-4 py-2 mt-4 ml-4 bg-primary-700 hover:bg-primary-800 text-white text-center rounded-lg">
								Choose file
							</div>
							<input
								type="file"
								accept=".csv"
								name="file"
								className="hidden"
								id="organizationlogo"
								onChange={handleFileUpload}
								title=""
							/>
						</label>
					</div>
				</div>
			</div>
		</Card>
	);
};

export default BulkIssuance;
