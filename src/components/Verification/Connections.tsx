'use client';

import { Button } from "flowbite-react";
import { useState } from "react";
import { setToLocalStorage } from "../../api/Auth";
import DataTable from "../../commonComponents/datatable";
import type { TableData } from "../../commonComponents/datatable/interface";
import { storageKeys } from "../../config/CommonConstant";
import { pathRoutes } from "../../config/pathRoutes";
import BreadCrumbs from "../BreadCrumbs";
import ConnectionList from "./ConnectionList";
import EmailList from "./EmailList";
import BackButton from '../../commonComponents/backbutton'

const Connections = () => {
	const [selectedConnectionList, setSelectedConnectionList] = useState<TableData[]>([])
	const selectedConnectionHeader = [
		{ columnName: 'User' },
		{ columnName: 'Connection ID' },
	]

	const selectConnection = (connections: TableData[]) => {
		setSelectedConnectionList(connections)
	}

	const continueToVerify = async () => {
		const selectedConnections = selectedConnectionList.map(ele =>{
			return {userName: ele.data[0].data, connectionId:ele.data[1].data}
	})
		await setToLocalStorage(storageKeys.SELECTED_USER, selectedConnections)
		window.location.href = `${pathRoutes.organizations.verification.verify}`
	}

	return (
		<div className="px-4 pt-2">
			<div className="mb-4 col-span-full xl:mb-2">
			<div className="flex justify-between items-center">
					<BreadCrumbs />
					<BackButton path={pathRoutes.back.verification.credDef}/>
				</div>
			</div>

			<div className="mb-4 border-b border-gray-200 dark:border-gray-700">
				<ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
					<li className="mr-2">
						<button className="inline-block p-4 border-b-2 rounded-t-lg text-xl" id="profile-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Connection</button>
					</li>
					<li className="mr-2">
						<button className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-xl" id="dashboard-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">Email</button>
					</li>
				</ul>
			</div>
			<div id="myTabContent">
				<div className="hidden rounded-lg bg-gray-50 dark:bg-gray-800" id="profile" role="tabpanel" aria-labelledby="profile-tab">
					<ConnectionList selectConnection={selectConnection} />
				</div>
				<div className="hidden rounded-lg bg-gray-50 dark:bg-gray-800" id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
					<EmailList />
				</div>
			</div>
			<div className="flex items-center justify-between mb-4 pt-3">
				<h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Selected Users
				</h1>
			</div>
			<div
				className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
				<DataTable header={selectedConnectionHeader} data={selectedConnectionList} loading={false} ></DataTable>
				{selectedConnectionList.length ? <div className="flex justify-end pt-3">
					<Button
						onClick={continueToVerify}
						className='text-base text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-accent-00 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
					>
						<div className='pr-3'>
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
								<path fill="#fff" d="M12.516 6.444a.556.556 0 1 0-.787.787l4.214 4.214H4.746a.558.558 0 0 0 0 1.117h11.191l-4.214 4.214a.556.556 0 0 0 .396.95.582.582 0 0 0 .397-.163l5.163-5.163a.553.553 0 0 0 .162-.396.576.576 0 0 0-.162-.396l-5.163-5.164Z" />
								<path fill="#fff" d="M12.001 0a12 12 0 0 0-8.484 20.485c4.686 4.687 12.283 4.687 16.969 0 4.686-4.685 4.686-12.282 0-16.968A11.925 11.925 0 0 0 12.001 0Zm0 22.886c-6 0-10.884-4.884-10.884-10.885C1.117 6.001 6 1.116 12 1.116s10.885 4.885 10.885 10.885S18.001 22.886 12 22.886Z" />
							</svg>
						</div>
						Continue
					</Button>
				</div>
					: ''}
			</div>

		</div>
	)
}

export default Connections
