import CopyIcon from '../../assets/icons/copy-icon.svg';
import { Spinner } from "flowbite-react";
import type { TableData, TableHeader } from './interface';

const DataTable = (props: { header: TableHeader[], data: TableData[][], loading: boolean }) => {
	const { header, data, loading } = props;
	return (
		<div className="flex flex-col mt-6">
			{loading
				? <div className="flex items-center justify-center mb-4">
					<Spinner
						color="info"
					/>
				</div>
				: <div className="overflow-x-auto rounded-lg">
					<div className="inline-block min-w-full align-middle">
						<div className="overflow-hidden shadow sm:rounded-lg">
							<table
								className="min-w-full divide-y divide-gray-200 dark:divide-gray-600"
							>
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										{header && header.length > 0 &&
											header.map(ele => (
												<th
													scope="col"
													className="p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white"
												>
													<div>{ele.columnName}</div>
													{ele.subColumnName && <div className="flex text-gray-500">{ele.subColumnName} </div>}

												</th>
											))}
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800">
									{data.length ? data.map((ele, index) => (
										<tr className={`${index % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
											{ele.map(subEle => (
												<td className="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white">
													<div>{subEle.data}</div>
													{subEle.subData && <div className="flex text-gray-500">{subEle.subData} &nbsp; {subEle.copySubData && <img src={CopyIcon} alt="Copy" className="cursor-pointer"></img>}</div>}
												</td>
											))}
										</tr>
									)) : <tr className="text-center"><td className="p-2 text-center text-gray-500" colSpan={header.length}>No Data Found</td></tr>}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			}
		</div>
	)
}


export default DataTable
