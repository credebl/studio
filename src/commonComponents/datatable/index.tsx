import type { TableData, TableHeader } from './interface';
import CustomSpinner from '../../components/CustomSpinner';

interface DataTableProps {
	header: TableHeader[];
	data: TableData[];
	loading: boolean;
	callback?: (clickId: string | null | undefined) => void;
	displaySelect?: boolean;
	showBtn?: boolean;
	isEmailVerification?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
	header,
	displaySelect,
	data,
	loading,
	callback,
	showBtn,
	isEmailVerification
}) => {
	return (
		<div className="flex flex-col ">
			{loading ? (
				<div className="flex items-center justify-center mb-4">
					<CustomSpinner />
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg">
					<div className="inline-block min-w-full align-middle">
						<div className="overflow-hidden shadow sm:rounded-lg">
							<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										{header &&
											header.length > 0 &&
											header.map((ele, id) => (
												<th
													key={id}
													scope="col"
													className={`p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white ${ele.width} ${id === 0 && isEmailVerification ? 'pl-12' : ''}`}
												>
													<div>{ele.columnName}</div>
													{ele.subColumnName && (
														<div className="flex text-gray-500">
															{ele.subColumnName}{' '}
														</div>
													)}
												</th>
											))}
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800">
									{data.length ? (
										data.map((ele, id) => (
											<tr
												key={id}
												className={`${
													id % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700' : ''
												}`}
											>
												{ele.data.map((subEle, id) => (
													<td
														key={id}
														className={` p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white align-middle	`}
													>
														<div key={id}>{subEle.data}</div>
														{subEle.subData}
													</td>
												))}
												<td className="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white align-middle"> 
												
													{displaySelect || (showBtn && (
														<button
															key={id}
															onClick={() => (callback ? callback(ele?.clickId) : '')}
															type="button"
															className="text-center mt-2 text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
														>
															Select
														</button>
													))}
												</td>
											</tr>
										))
									) : (
										<tr className="text-center">
											<td
												className="p-2 text-center text-gray-500"
												colSpan={header.length}
												key={header.length}
											>
												Empty data
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DataTable;
