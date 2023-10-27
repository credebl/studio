'use client';

import type { AxiosResponse } from "axios";
import {  useEffect, useState } from "react";
import { getConnectionsByOrg } from "../../api/connection";
import DataTable from "../../commonComponents/datatable";
import type { TableData } from "../../commonComponents/datatable/interface";
import { apiStatusCodes } from "../../config/CommonConstant";
import { AlertComponent } from "../AlertComponent";
import { dateConversion } from "../../utils/DateConversion";
import DateTooltip from "../Tooltip";
import BreadCrumbs from "../BreadCrumbs";

const ConnectionList = () => {
	const [connectionList, setConnectionList] = useState<TableData[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		getConnections()
	}, [])

	const getConnections = async () => {
		setLoading(true)
		const response = await getConnectionsByOrg();
		const { data } = response as AxiosResponse

		if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
			const connections = data?.data?.map((ele: { theirLabel: string; id: string; createdAt: string; }) => {
				const userName = ele?.theirLabel ? ele.theirLabel : 'Not available';
				const connectionId = ele.id ? ele.id : 'Not available'
				const createdOn = ele?.createdAt ? ele?.createdAt : 'Not available'
				return {
					data: [
					{ data: userName }, 
					{ data: connectionId }, 
					{data:<DateTooltip date={createdOn} id="issuance_connection_list">  {dateConversion(createdOn)}  </DateTooltip>},
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
		{ columnName: 'User' },
		{ columnName: 'Connection ID' },
		{ columnName: 'Created on' }
	]

	return (
		<div className='p-4' id="issuance_connection_list">
			<BreadCrumbs/>
			<div className="flex items-center justify-between mb-4" id="issued-credentials-list">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Connections
				</h1>
			</div>
			<AlertComponent
				message={error}
				type={'failure'}
				onAlertClose={() => {
					setError(null)
				}}
			/>
			<div id="issuance_datatable"
				className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
				<DataTable header={header} data={connectionList} loading={loading} ></DataTable>
			</div>
		</div>
	)
}

export default ConnectionList
