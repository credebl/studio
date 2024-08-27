import { Card } from 'flowbite-react';
import CopyDid from '../../commonComponents/CopyDid';

interface AttributesListProps {
    attributeDataList: { [key: string]: any }[] 
}

const AttributesListData = ({ attributeDataList }: AttributesListProps): JSX.Element => {

    return (
        <>
            {attributeDataList?.map((item, index) => (
                <Card key={index} className="mb-4">
                    <div className="flex flex-col justify-start gap-2 p-4">
					<div className="flex justify-start text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {`Credential ${index + 1}`}
                        </div>


						{Object.entries(item).map(([key, value], idx) => (
							<div key={idx} className="flex w-full text-lg items-center">
								<div className="w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center text-start">
									{key}
								</div>
								<div className="flex items-center p-1 m-1">
									:
								</div>
								<div className="w-9/12 m-1 text-start text-gray-600 dark:text-white items-center cursor-pointer overflow-auto">
									{key === 'schemaId' || key === 'credDefId' ? (
										<div className="flex items-center">
											<CopyDid value={value} className="truncate font-courier mt-2" />
										</div>
									) : (
										<span className="truncate font-courier">{value}</span>
									)}
								</div>
							</div>
						))}
					</div>
				</Card>
			))}
        </>
    );
}

export default AttributesListData;
