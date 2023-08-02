'use client';

import BreadCrumbs from "../BreadCrumbs";
import ConnectionList from "./ConnectionList";
import EmailList from "./EmailList";

const Connections = () => {

	return (
		<div className="px-4 pt-6">
			<div className="pl-6 mb-4 col-span-full xl:mb-2">
				<BreadCrumbs />
			</div>

			<div className="mb-4 border-b border-gray-200 dark:border-gray-700">
				<ul className="flex flex-wrap -mb-px text-sm font-medium text-center" id="myTab" data-tabs-toggle="#myTabContent" role="tablist">
					<li className="mr-2" role="presentation">
						<button className="inline-block p-4 border-b-2 rounded-t-lg text-xl" id="profile-tab" data-tabs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Connection</button>
					</li>
					<li className="mr-2" role="presentation">
						<button className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 text-xl" id="dashboard-tab" data-tabs-target="#dashboard" type="button" role="tab" aria-controls="dashboard" aria-selected="false">Email</button>
					</li>
				</ul>
			</div>
			<div id="myTabContent">
				<div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="profile" role="tabpanel" aria-labelledby="profile-tab">
					<ConnectionList />
				</div>
				<div className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="dashboard" role="tabpanel" aria-labelledby="dashboard-tab">
				<EmailList />
				</div>
			</div>


		</div>
	)
}

export default Connections
