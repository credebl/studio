'use client';

import OrganisationPublicProfile from './OrganisationPublicProfile';
import PublicNavbar from '../../commonComponents/PublicNavbar'

const PublicProfile = () => {
	return (
		<div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
			<header>
				<PublicNavbar />
			</header>
			<div className="pt-6">
				<h1 className="ml-1 px-4 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
					Organizations
				</h1>
				<div id="myTabContent">
					<div
						className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
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
