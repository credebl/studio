'use client';

import OrganisationPublicProfile from './OrganisationPublicProfile';

const PublicProfile = () => {
	return (
		<div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
			<div className="pt-6">
				<div className="mb-4 border-b border-gray-200 dark:border-gray-700">
					<ul
						className="pl-5 flex flex-wrap -mb-px text-sm font-medium text-center"
						id="myTab"
						data-tabs-toggle="#myTabContent"
						role="tablist"
					>
						<li className="mr-2" role="presentation">
							<button
								className="text-xl inline-block p-4 border-b-2 rounded-t-lg "
								id="profile-tab"
								data-tabs-target="#profile"
								type="button"
								role="tab"
								aria-controls="profile"
								aria-selected="true"
							>
								Organisations
							</button>
						</li>
					</ul>
				</div>
				<div id="myTabContent">
					<div
						className="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
						id="profile"
						role="tabpanel"
						aria-labelledby="profile-tab"
					>
						<OrganisationPublicProfile />
					</div>
				</div>
			</div>
		</div>
	);
};

export default PublicProfile;
