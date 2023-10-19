import { Card } from 'flowbite-react';

interface AttributesListProps {
    attributeDataList: { entity: string; properties: any[] }[]
}

	const AttributesListData = ({attributeDataList}: AttributesListProps): JSX.Element => {
		return (
			<>
				<Card >
					<div className="flex h-full flex-col justify-center gap-0 sm:p-0">
						<div className="flex border-b">
							<div className="w-5/12 font-semibold flex truncate md:pl-1 sm:mr-8 md:mr-0 text-primary-700 dark:bg-gray-800 text-xl">
								Attributes
							</div>
							<div className="w-1/12 font-semibold flex justify-start truncate md:pl-1 sm:mr-8 md:mr-0 text-primary-700 dark:bg-gray-800 text-xl">
							</div>
							<div className="w-6/12 font-semibold flex truncate sm:pl-4 text-primary-700 dark:bg-gray-800 text-xl">
								{' '}
								Values
							</div>
						</div>

						{
							attributeDataList?.map((item, index) => (
								<div
									key={item?.entity + 1}
									className="flex w-full"
								>
									<div
										className={`flex w-full text-lg`}
									>
										<div className="w-5/12 m-1 p-1 text-start text-gray-700 dark:text-white text-lg">
											{item?.entity}
										</div>
										<div className="w-1/12 m-1 p-1 flex  items-center text-gray-700 dark:text-white text-lg">
											:
										</div>
										<div className="w-6/12 m-1 truncate p-1 flex justify-start text-gray-700 dark:text-white text-lg">
											{item?.properties.join(', ')}
										</div>
									</div>
								</div>
							))
						}

					</div>
				</Card>

			</>
		)
	}

    export default AttributesListData;