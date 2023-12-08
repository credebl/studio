import type { InvitationProps } from "./EcoSystemReceivedInvitations";
import CustomAvatar from '../Avatar';

const EcoInvitationList = (props: InvitationProps) => {
	const { invitationId, ecosytem } = props;
	const { name, logoUrl } = ecosytem;

	return (
		<div className="flex space-x-2">
			<div className="mr-2 border border-gray-200 dark:border-gray-700">
				{logoUrl ? (
					<CustomAvatar size="60" src={logoUrl} />
				) : (
					<CustomAvatar size="70" name={name} />
				)}
			</div>

			<div className="flex-1 min-w-0">
				<p className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white">
					{name}
				</p>

				<div className="flow-root h-auto">
					<ul className="divide-y divide-gray-200 dark:divide-gray-700">
						<li className="pt-3 sm:pt-3 overflow-auto">
							<div className="items-center space-x-4">
								<div className="inline-flex items-center text-base font-normal text-gray-900 dark:text-white">
									Role:{' '}
									<span
										key={invitationId}
										className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
									>
										Ecosystem Member
									</span>
								</div>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default EcoInvitationList;
