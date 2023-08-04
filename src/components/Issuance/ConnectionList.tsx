'use client';

import type { AxiosResponse } from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { getConnectionsByOrg } from "../../api/connection";
import DataTable from "../../commonComponents/datatable";
import type { TableData } from "../../commonComponents/datatable/interface";
import { apiStatusCodes } from "../../config/CommonConstant";
import { AlertComponent } from "../AlertComponent";


const ConnectionList = () => {
	const [connectionList, setConnectionList] = useState<TableData[]>([])
	const [selectedConnectionList, setSelectedConnectionList] = useState<TableData[]>([])

	const [loading, setLoading] = useState<boolean>(false)
	const [searchText, setSearchText] = useState("");
	const [error, setError] = useState<string | null>(null)

	//This useEffect is called when the searchText changes 
	useEffect(() => {
		getConnections()
	}, [])


	//Fetch the connection list against organization id
	const getConnections = async () => {
		setLoading(true)
		const response = await getConnectionsByOrg();
		const { data } = response as AxiosResponse

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const connections = data?.data?.map((ele) => {
				const userName = ele?.theirLabel ? ele.theirLabel : 'Not available';
				const connectionId = ele.id ? ele.id : 'Not available'
				return {
					data: [{
						data: <div className="flex items-center">
							<input id="default-checkbox" type="checkbox" onClick={(event: React.MouseEvent<HTMLInputElement>) => {
								const inputElement = event.target as HTMLInputElement;
								selectConnection(userName, connectionId, inputElement.checked)
							}}
								value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer" />
						</div>
					},
					{ data: userName }, { data: connectionId },
					]
				}
			})

			setConnectionList(connections)
		} else {
			setError(response as string)
		}

		setLoading(false)
	}


	const header = [
		{ columnName: '', width: 'w-0.5' },
		{ columnName: 'User' },
		{ columnName: 'Connection ID' }
	]

	const selectedConnectionHeader = [
		{ columnName: 'User' },
		{ columnName: 'Connection ID' }
	]

	const selectConnection = (user: string, connectionId: string, checked: boolean) => {

		if (checked) {
			setSelectedConnectionList((prevList) => [...prevList, {
				data: [
					{
						data: user,
					}, {
						data: connectionId,
					}]
			}]
			)
		} else {
			setSelectedConnectionList((prevList) =>
				prevList.filter((connection) => connection.data[1].data !== connectionId)
			);
		}
	}

	return (
		<div>

			<div className="flex items-center justify-between mb-4">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Connection List
				</h1>
			</div>
			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null)
				}}
			/>
			<div
				className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">

				<DataTable header={header} data={connectionList} loading={loading} ></DataTable>
			</div>
			<div className="flex items-center justify-between mb-4">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Selected Users
				</h1>
			</div>
			<div
				className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
				<DataTable header={selectedConnectionHeader} data={selectedConnectionList} loading={false} ></DataTable>
			</div>

		</div>
	)
}

export default ConnectionList
