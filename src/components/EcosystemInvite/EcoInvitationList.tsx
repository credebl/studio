interface InvitationProps {
	invitationId: string;
	ecosytem: [];
}

const EcoInvitationList = (props: InvitationProps) => {
	const { invitationId, ecosytem } = props;

	const { name } = ecosytem;

	return (
			<div className="flex space-x-4">
				<svg
					width="60"
					height="60"
					viewBox="0 0 398 398"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<g clip-path="url(#clip0_3892_5729)">
						<path
							d="M350.828 117.051V166.651L382.328 143.251L350.828 117.051Z"
							fill="#6B7280"
						/>
						<path
							d="M217.922 6.9502C206.822 -2.2498 190.722 -2.3498 179.622 6.8502L166.922 17.6502H230.822L217.922 6.9502Z"
							fill="#6B7280"
						/>
						<path
							d="M228.629 282.451C220.029 288.851 209.629 292.351 198.929 292.251C188.229 292.251 177.729 288.851 169.129 282.451L9.82869 163.551V367.451C9.72869 383.951 23.0287 397.451 39.5287 397.551H358.029C374.529 397.451 387.829 383.951 387.729 367.451V163.551L228.629 282.451Z"
							fill="#6B7280"
						/>
						<path
							d="M15.3281 143.249L45.8281 165.949V117.949L15.3281 143.249Z"
							fill="#6B7280"
						/>
						<path
							d="M65.8281 37.6484V180.848L180.828 266.448C191.528 274.248 206.228 274.248 216.928 266.448L330.828 181.548V37.6484H65.8281ZM136.828 117.648H190.828C196.328 117.648 200.828 122.148 200.828 127.648C200.828 133.148 196.328 137.648 190.828 137.648H136.828C131.328 137.648 126.828 133.148 126.828 127.648C126.828 122.148 131.328 117.648 136.828 117.648ZM260.828 187.648H136.828C131.328 187.648 126.828 183.148 126.828 177.648C126.828 172.148 131.328 167.648 136.828 167.648H260.828C266.328 167.648 270.828 172.148 270.828 177.648C270.828 183.148 266.328 187.648 260.828 187.648Z"
							fill="#6B7280"
						/>
					</g>
					<defs>
						<clipPath id="clip0_3892_5729">
							<rect width="397.55" height="397.55" fill="white" />
						</clipPath>
					</defs>
				</svg>

				<div className="flex-1 min-w-0">
					<p className="text-base font-semibold text-gray-900 leading-none truncate mb-0.5 dark:text-white">
						{name}
					</p>

					<div className="flow-root h-auto">
						<ul className="divide-y divide-gray-200 dark:divide-gray-700">
							<li className="pt-3 sm:pt-3 overflow-auto">
								<div className="items-center space-x-4">
									<div className="inline-flex items-center text-base font-normal text-gray-900 dark:text-white">
										Roles:
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
