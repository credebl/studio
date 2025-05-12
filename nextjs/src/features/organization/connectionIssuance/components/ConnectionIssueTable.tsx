import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button";
import { DataTableProps } from "../type/ConnectionIssueTable";
import Loader from "@/components/Loader";

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
					<Loader />
				</div>
			) : (
				<div className="overflow-x-auto rounded-lg">

					<div className="inline-block min-w-full align-middle">
						<div className="overflow-hidden shadow sm:rounded-lg">
							<Table>
								<TableHeader className="bg-gray-50">
									<TableRow className="bg-gray-50">
										{header &&
											header.length > 0 &&
											header.map((ele, id) => (
												<TableHead
													key={id}
													scope="col"
													className={`bg-gray-50 p-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-white ${ele.width} ${id === 0 && isEmailVerification ? 'pl-12' : ''}`}
												>
													<div className="h-full w-full flex flex-col justify-center">
														<div>{ele.columnName}</div>
														{ele.subColumnName && (
															<div className="text-gray-500">{ele.subColumnName}</div>
														)}
													</div>
												</TableHead>
											))}
										<TableHead>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.length ? (
										data.map((ele, id) => (
											<TableRow
												key={id}
												className={`${id % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-700' : ''
													}`}
											>
												{ele.data.map((subEle, id) => (
													<TableCell
														key={id}
														className={` p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white align-middle	`}
													>
														<div>
															<div>
																{typeof subEle.data === 'string' || typeof subEle.data === 'number' ? (
																	<span>{subEle.data}</span>
																) : (
																	subEle.data
																)}
															</div>
															<div>
																{typeof subEle.subData === 'string' || typeof subEle.subData === 'number' ? (
																	<span>{subEle.subData}</span>
																) : (
																	subEle.subData
																)}
															</div>
														</div>
													</TableCell>
												))}
												<TableCell className="p-4 text-sm font-normal text-gray-900 whitespace-nowrap dark:text-white align-middle">

													{displaySelect || (showBtn && (
														<Button
															key={id}
															onClick={() => (callback ? callback(ele?.clickId) : '')}
															className='w-full sm:w-auto'
														>
															Select
														</Button>
													))}
												</TableCell>
											</TableRow>
										))
									)
										: (
											<TableRow className="text-center">
												<TableCell
													className="p-2 text-center text-gray-500"
													colSpan={header.length}
													key={header.length}
												>
													Empty data
												</TableCell>
											</TableRow>
										)}
								</TableBody>
							</Table>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DataTable;
