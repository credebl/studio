'use client';

import OrganisationPublicProfile from './OrganisationPublicProfile';
import PublicNavbar from '../../commonComponents/PublicNavbar';

const PublicProfile = () => {
	return (
		<>
			<PublicNavbar limitedWidth={false} />
			<div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
				<header></header>
				<div className="">
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
		</>
	);
};

export default PublicProfile;
