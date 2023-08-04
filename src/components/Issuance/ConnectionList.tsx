'use client';

import { Button } from "flowbite-react";
import { ChangeEvent, useEffect, useState } from "react";
import DataTable from "../../commonComponents/dataTable";
import type { TableData } from "../../commonComponents/dataTable/interface";
import SearchInput from "../SearchInput";

const ConnectionList = (props: { selectConnection: (connections: TableData[]) => void; }) => {
	const [connectionList, setConnectionList] = useState<TableData[]>([])
	const [selectedConnectionList, setSelectedConnectionList] = useState<TableData[]>([])

	const [loading, setLoading] = useState<boolean>(false)
	const [searchText, setSearchText] = useState("");
	const [error, setError] = useState<string | null>(null)

	//This useEffect is called when the searchText changes 
	useEffect(() => {
		let getData: NodeJS.Timeout
		if (searchText.length >= 1) {
			getData = setTimeout(() => {
				getConnections()

			}, 1000)
		} else {
			getConnections()
		}

		return () => clearTimeout(getData)
	}, [searchText])


	//Fetch the user organization list
	const getConnections = async () => {
		const connections: TableData[] = [
			{
				data: [{
					data:
						<div className="flex items-center">
							{/* <input id="default-checkbox" type="checkbox" onClick={(event: React.MouseEvent<HTMLInputElement>) => {
					 		const inputElement = event.target as HTMLInputElement;
					 		selectConnection('User1', 'ConnectionId1', inputElement.checked)
					 	}}
					 		value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer" /> */}
							<input id="default-checkbox" type="radio" name='connection' onClick={(event: React.MouseEvent<HTMLInputElement>) => {
								const inputElement = event.target as HTMLInputElement;
								selectConnection('User1', 'ConnectionId1', inputElement.checked)
							}}
								value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer" />
						</div>,
				}, {
					data: 'User1',
				}, {
					data: 'ConnectionId1',
				}]
			},
			{
				data: [{
					data: <div className="flex items-center">
						{/* <input id="default-checkbox" type="checkbox" onClick={(event: React.MouseEvent<HTMLInputElement>) => {
							const inputElement = event.target as HTMLInputElement;
							selectConnection('User2', 'ConnectionId2', inputElement.checked)
						}} value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer" /> */}
						<input id="default-checkbox" type="radio" name='connection' onClick={(event: React.MouseEvent<HTMLInputElement>) => {
							const inputElement = event.target as HTMLInputElement;
							selectConnection('User2', 'ConnectionId2', inputElement.checked)
						}} value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer" />

					</div>,
				}, {
					data: 'User2',
				}, {
					data: 'ConnectionId2',
				}]
			}]
		setConnectionList(connections)

		// setLoading(true)
		// const response = await getConnectionsByOrg();
		// const { data } = response as AxiosResponse
		// console.log('data::', data);

		// if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {


		// const orgList = data?.data?.organizations.map((userOrg: Organisation) => {
		// 	const roles: string[] = userOrg.userOrgRoles.map(role => role.orgRole.name)
		// 	userOrg.roles = roles
		// 	return userOrg;
		// })

		// if (connections.length === 0) {
		// 	setError('No Data Found')
		// }

		// setConnectionList(connections)
		// } else {
		// 	setError(response as string)
		// }

		// setLoading(false)
	}


	//onChange of Search input text
	const searchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		// setSearchText(e.target.value);
	}

	const header = [
		{ columnName: '', width: 'w-0.5' },
		{ columnName: 'User' },
		{ columnName: 'Connection ID' }
	]


	const selectConnection = (user: string, connectionId: string, checked: boolean) => {
		if (checked) {

			// Needed for multiple connection selection
			// setSelectedConnectionList((prevList) => [...prevList, {
			// 	data: [
			// 		{
			// 			data: user,
			// 		}, {
			// 			data: connectionId,
			// 		}]
			// }]
			// )

			// It is for single connection selection
			setSelectedConnectionList([{
				data: [
					{
						data: user,
					}, {
						data: connectionId,
					}]
			}])
		} else {
			setSelectedConnectionList((prevList) =>
				prevList.filter((connection) => connection.data[1].data !== connectionId)
			);
		}
	}

	useEffect(() => {
		props.selectConnection(selectedConnectionList);

	}, [selectedConnectionList])

	return (
		<div>

			<div className="flex items-center justify-between mb-4">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Connection List
				</h1>
				<SearchInput
					onInputChange={searchInputChange}
				/>
			</div>
			<div
				className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">

				<DataTable header={header} data={connectionList} loading={loading} ></DataTable>
			</div>
		</div>
	)
}

export default ConnectionList
