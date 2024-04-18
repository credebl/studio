import type { IDataTable } from './interface';
import CustomSpinner from '../../components/CustomSpinner';
import SearchInput from '../../components/SearchInput';
import { Pagination } from 'flowbite-react';
import { useState } from 'react';
import { EmptyListMessage } from '../../components/EmptyListComponent';


const SortDataTable: React.FC<IDataTable> = ({
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
	isPagination,
	isSearch,
	isRefresh,
	isSort,
	isHeader,
	message,
	discription,
	noExtraHeight,
	sortOrder,
	itemPerPage
}) => {
	const [selectedValue, setSelectedValue] = useState(sortOrder ?? '');

	const handleSortByValues = (event: { target: { value: any } }) => {
		const newSelectedValue = event.target.value;
		setSelectedValue(newSelectedValue);
		if (searchSortByValue) {
			searchSortByValue(newSelectedValue);
		}
	};

	const {
		totalItem = 0,
		nextPage = 0,
		lastPage = 0,
	} = (pageInfo || {}) as {
		totalItem?: number;
		nextPage?: number;
		lastPage?: number;
	};
	const startItem = (nextPage - 2) * (itemPerPage || 10) + 1;
	const endItem = Math.min((nextPage - 1) * (itemPerPage || 10), totalItem);	

	const sortValues = [
		{
			label: 'Descending',
			value: 'desc',
		},
		{ label: 'Ascending', value: 'asc' },
	];

	return (
		<section className="bg-gray-50 dark:bg-gray-900 w-full">
			<div className="mx-auto min-h-80">
				<div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
					{isHeader && (
						<div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4 p-3">
							<div className="w-full sm:w-1/2">
								{isSearch && (
									<form className="flex items-center">
										<input type="hidden" name="_csrf" value={new Date().getTime()} />
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
														fillRule="evenodd"
														d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											{isSearch && (
												<SearchInput onInputChange={onInputChange} />
											)}
										</div>
									</form>
								)}
							</div>

							<div className="sm:w-auto flex sm:flex-row space-y-2 sm:space-y-0 items-stretch sm:items-center justify-end sm:space-x-3 flex-shrink-0">
								{isRefresh && (
									<button
										onClick={refresh}
										className="focus:z-10 bg-white-700 hover:bg-secondary-700 rounded-lg mr-4 sm:mr-0 items-center mt-2 sm:mt-0"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="32"
											height="32"
											viewBox="0 0 24 24"
											fill="none"
										>
											<path
												d="M12 20C9.76667 20 7.875 19.225 6.325 17.675C4.775 16.125 4 14.2333 4 12C4 9.76667 4.775 7.875 6.325 6.325C7.875 4.775 9.76667 4 12 4C13.15 4 14.25 4.2375 15.3 4.7125C16.35 5.1875 17.25 5.86667 18 6.75V4H20V11H13V9H17.2C16.6667 8.06667 15.9375 7.33333 15.0125 6.8C14.0875 6.26667 13.0833 6 12 6C10.3333 6 8.91667 6.58333 7.75 7.75C6.58333 8.91667 6 10.3333 6 12C6 13.6667 6.58333 15.0833 7.75 16.25C8.91667 17.4167 10.3333 18 12 18C13.2833 18 14.4417 17.6333 15.475 16.9C16.5083 16.1667 17.2333 15.2 17.65 14H19.75C19.2833 15.7667 18.3333 17.2083 16.9 18.325C15.4667 19.4417 13.8333 20 12 20Z"
												fill="#1F4EAD"
											></path>
										</svg>
									</button>
								)}

								{isSort && (
									<div className="flex items-center space-x-3 w-full sm:w-auto">
										<select
											id="small"
											className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
											name="selectedValue"
											value={selectedValue}
											onChange={handleSortByValues}
										>
											{sortValues.map((sort) => {
												return (
													<option key={sort.value} value={sort.value}>
														{sort.label}
													</option>
												);
											})}
										</select>
									</div>
								)}
							</div>
						</div>
					)}
					<div className="overflow-x-auto">
						<table className="w-full divide-y divide-gray-200 dark:divide-gray-600">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									{header &&
										header.length > 0 &&
										header.map((ele) => (
											<th
												key={ele.columnName}
												scope="col"
												className={`p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white ${ele.width}`}
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
							{loading ? (
								<tr className="text-center">
									<td
										className="p-2 text-center text-gray-500"
										colSpan={header.length}
									>
										{' '}
										<div className="w-full flex items-center justify-center text-center mb-4 ">
											<CustomSpinner />
										</div>
									</td>
								</tr>
							) : data?.length ? (
								data?.map((ele, index) => (
											<tr
												key={index}
												className={`${index % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700' : ''
													}`}
											>
												{ele.data.map((subEle, index) => (
													<td
														key={index}
														className={`p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white align-middle	`}
													>
														<div>{subEle.data}</div>
														{subEle.subData}
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
												<div className="w-full h-full mx-auto flex items-center justify-center">
													<EmptyListMessage
														message={message}
														description={discription}
														noExtraHeight={noExtraHeight}
													/>
												</div>
											</td>
										</tr>
									)}
								</tbody>
										
									</table>
								</div>
								{loading && isPagination && data.length > 0 ? (
									''
					) : (
						<nav
							className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 p-3 w-full"
							aria-label="Table navigation"
						>
							{!loading && data?.length > 0 && (
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
							)}
							{lastPage > 1 && data?.length > 0 && (
								<div className="items-center">
									<Pagination
										currentPage={currentPage}
										onPageChange={onPageChange}
										totalPages={totalPages}
									/>
								</div>
							)}
						</nav>
					)}
				</div>
			</div>
		</section>
	);
};

export default SortDataTable;
