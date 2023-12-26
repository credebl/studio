import type { TableData, TableHeader } from './interface';

import CustomSpinner from '../../components/CustomSpinner';
import SearchInput from '../../components/SearchInput';
import { Pagination } from 'flowbite-react';
import { useState } from 'react';

interface DataTableProps {
	header: TableHeader[];
	data: TableData[];
	loading: boolean;
	callback?: (clickId: string | null | undefined) => void;
	displaySelect?: boolean;
	showBtn?: boolean;
	onInputChange: () => void;
	refresh: () => void;
	currentPage: any;
	onPageChange: () => void;
	totalPages: number;
	pageInfo: { totalItem: number; nextPage: number; lastPage: number };
	searchSortByValue: () => void;
	statusValues: [];
	filterByValue: ()=>void
}

const DataTable: React.FC<DataTableProps> = ({
	header,
	displaySelect,
	data,
	loading,
	callback,
	showBtn,
	onInputChange,
	refresh,
	currentPage,
	onPageChange,
	totalPages,
	pageInfo,
	searchSortByValue,
	statusValues,
	filterByValue
}) => {
	const [selectedValue, setSelectedValue] = useState('');
	const [filterValue, setFilerValue]= useState('')

	console.log("filterValue",filterValue);
	
	const handleSortByValues = (event: { target: { value: any } }) => {
		const newSelectedFruit = event.target.value;
		setSelectedValue(newSelectedFruit);
		searchSortByValue(newSelectedFruit);
	};
	const handleFilterByValues = (event: { target: { value: any } }) => {
		const newFilteredValue = event.target.value;
		setFilerValue(newFilteredValue);
		filterByValue(newFilteredValue);
	};
	const { totalItem, nextPage, lastPage } = pageInfo;
	const startItem = (nextPage - 2) * 10 + 1;
	const endItem = Math.min((nextPage - 1) * 10, totalItem);

	const sortValues = [
		{
			label: 'latest',
			value: 'DESC',
		},
		{ label: 'oldest', value: 'AESC' },
	];

	return (
		<section className="bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto">
				<div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
					<div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-3">
						<div className="w-full md:w-1/2">
							<form className="flex items-center">
								<label htmlFor="simple-search" className="sr-only">
									Search
								</label>
								<div className="relative w-full">
									<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
										<svg
											aria-hidden="true"
											className="w-5 h-5 text-gray-500 dark:text-gray-400"
											fill="currentColor"
											viewBox="0 0 20 20"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												fill-rule="evenodd"
												d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
												clip-rule="evenodd"
											/>
										</svg>
									</div>
									<SearchInput onInputChange={onInputChange} />
								</div>
							</form>
						</div>
						<div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
							<button
								type="button"
								className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
								onClick={refresh}
							>
								<svg
									className="h-3.5 w-3.5 mr-2"
									fill="currentColor"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
									aria-hidden="true"
								>
									<path
										clip-rule="evenodd"
										fill-rule="evenodd"
										d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
									/>
								</svg>
								refresh
							</button>
							<div className="flex items-center space-x-3 w-full md:w-auto">
								{/* className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" */}
								<select
									id="small"
									className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									name="selectedValue"
									value={selectedValue}
									onChange={handleSortByValues}
								>
									{/* <option selected>Choose a country</option> */}
									<option selected>sortBy</option>
									{sortValues.map((sort) => {
										return (
											<>
												<option value={sort.value}>{sort.label}</option>
											</>
										);
									})}
								</select>

								<select
									id="small"
									className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
									name="selectedValue"
									value={filterValue}
									onChange={handleFilterByValues}
								>
									<option selected value=' '>Filter</option>
									{statusValues.map((sort) => {
										return <option value={sort}>{sort}</option>;
									})}
								</select>
							</div>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									{header &&
										header.length > 0 &&
										header.map((ele) => (
											<th
												key={ele.columnName}
												scope="col"
												className={`p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white ${
													ele.width && ele.width
												}`}
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

							{loading ? (
								<div className=" w-full flex items-center justify-center text-center mb-4">
									<CustomSpinner />
								</div>
							) : (
								<>
									<tbody className="bg-white dark:bg-gray-800">
										{data.length ? (
											data.map((ele, index) => (
												<tr
													key={index}
													className={`${
														index % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700' : ''
													}`}
												>
													{ele.data.map((subEle, index) => (
														<td
															key={index}
															className={` p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white align-middle	`}
														>
															<div>{subEle.data}</div>
															{subEle.subData && subEle.subData}
														</td>
													))}
													{displaySelect ||
														(showBtn && (
															<button
																onClick={() =>
																	callback ? callback(ele?.clickId) : ''
																}
																type="button"
																className="text-center mt-2 text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
															>
																Select
															</button>
														))}
												</tr>
											))
										) : (
											<tr className="text-center">
												<td
													className="p-2 text-center text-gray-500"
													colSpan={header.length}
												>
													Empty data
												</td>
											</tr>
										)}
									</tbody>
								</>
							)}
						</table>
					</div>
					{loading ? (
						''
					) : (
						<nav
							className="flex flex-col sm:flex-row justify-between items-center space-y-2 md:space-y-0 p-3 w-full"
							aria-label="Table navigation"
						>
							<span className="text-sm mt-2 font-normal text-gray-500 dark:text-gray-400">
								Showing
								<span className="font-semibold text-gray-900 dark:text-white">
									{' '}
									{startItem}-{endItem}{' '}
								</span>
								of
								<span className="font-semibold text-gray-900 dark:text-white">
									{' '}
									{totalItem}
								</span>
							</span>
							<div className="items-center">
								<Pagination
									currentPage={currentPage}
									onPageChange={onPageChange}
									totalPages={totalPages}
								/>
							</div>
						</nav>
					)}
				</div>
			</div>
		</section>
	);
};

export default DataTable;
