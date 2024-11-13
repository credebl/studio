import { Card } from 'flowbite-react';
import CopyDid from '../../commonComponents/CopyDid';

interface AttributesListProps {
	attributeDataList: { [key: string]: any }[];
}

const groupAndMergeAttributes = (data: { [key: string]: any }[], key: string): { [key: string]: any }[] => {
	const grouped = data.reduce((result, item) => {
		const groupKey = item[key] || item['schemaId'];
		if (!result[groupKey]) {
			result[groupKey] = {};
		}
		// Merge attributes into a single object
		result[groupKey] = { ...result[groupKey], ...item };
		return result;
	}, {} as { [key: string]: any });

	// Convert the grouped object back to an array
	return Object.values(grouped);
};

const AttributesListData = ({ attributeDataList }: AttributesListProps): JSX.Element => {

	const mergedData = groupAndMergeAttributes(attributeDataList, 'credDefId');

	return (
		<>
			{mergedData?.map((item, index) => (
				<Card key={index} className="mb-4">
					<div className="flex flex-col justify-start gap-2 p-4">
						<div className="flex justify-start text-xl font-semibold text-gray-900 dark:text-white mb-2">
							{`Credential ${index + 1}`}
						</div>

						<div className="flex h-full flex-col justify-center gap-0 sm:p-0 mb-4">
							<div className="flex border-b">
								<div className="w-5/12 font-semibold flex truncate md:pl-1 sm:mr-8 md:mr-0 text-primary-700 dark:bg-gray-800 text-lg">
									Attributes
								</div>
								<div className="w-1/12 font-semibold flex justify-start truncate md:pl-1 sm:mr-8 md:mr-0 text-primary-700 dark:bg-gray-800 text-xl"></div>
								<div className="w-6/12 font-semibold flex truncate sm:pl-4 text-primary-700 dark:bg-gray-800 text-lg">
									{' '}
									Values
								</div>
							</div>

							{Object.entries(item)
								.filter(([key]) => key !== 'credDefId' && key !== 'schemaId')
								.map(([key, value], idx) => (
									<div key={idx} className="flex w-full text-lg items-center">
										<div className="w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center text-start">

											{key}
										</div>
										<div className="w-1/12 m-1 p-1 flex items-center text-gray-700 dark:text-white text-lg">
											:
										</div>
										<div className="w-9/12 m-1 text-start text-gray-600 dark:text-white items-center cursor-pointer overflow-auto">
											{value}
										</div>
									</div>
								))}
						</div>

						<div className="">
							<div className="flex w-full text-lg items-center">
								<div className="w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center text-start">
									schemaId
								</div>
								<div className="flex items-center p-1 m-1">:</div>
								<div className="w-9/12 m-1 text-start text-gray-600 dark:text-white items-center cursor-pointer overflow-auto">
									<div className="flex items-center">
										<CopyDid value={item.schemaId} className="truncate font-courier mt-2" />
									</div>
								</div>
							</div>
						</div>

						{item.credDefId && (
							<div className="mb-4">
								<div className="flex w-full text-lg items-center">
									<div className="w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center text-start">
										credDefId
									</div>
									<div className="flex items-center p-1 m-1">:</div>
									<div className="w-9/12 m-1 text-start text-gray-600 dark:text-white items-center cursor-pointer overflow-auto">
										<div className="flex items-center">
											<CopyDid value={item.credDefId} className="truncate font-courier mt-2" />
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</Card>
			))}
		</>
	);
};

export default AttributesListData;
