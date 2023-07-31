
	const UserDashBoard = () => {

	return (
		<div className="px-4 pt-6">
			<div
				className="grid w-full grid-cols-1 gap-4 mt-0 mb-4 xl:grid-cols-2 2xl:grid-cols-3"
			>
				<div
					className=" justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
					<div className="w-full">
						<h2 className="text-base font-bold text-gray-500 dark:text-gray-400">
							Organizations
						</h2>
						<div className="pt-4 flex">
							<img
								className="w-6 h-6 rounded-full "
								src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
								alt="user photo"
							/>
							<h3 className="pl-2.5"> AyanWorks</h3>
						</div>

						<div className="pt-4 flex">
							<img
								className="w-6 h-6 rounded-full "
								src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
								alt="user photo"
							/>
							<h3 className="pl-2.5">Blockster</h3>
						</div>

						<div className="pt-4 flex">
							<img
								className="w-6 h-6 rounded-full "
								src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
								alt="user photo"
							/>
							<h3 className="pl-2.5">Health</h3>

						</div>
						<a
							href="#"
							className="pl-60 inline-flex items-center p-2 text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
						>
							View More..
						</a>

					</div>

				</div>
				<div
					className="justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
					<div className="w-full">
						<h3 className="text-base font-bold text-gray-500 dark:text-gray-400">
							Ecosystems
						</h3>

						<div className="pt-4 flex">
							<img
								className="w-6 h-6 rounded-full "
								src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
								alt="user photo"
							/>
							<h3 className="pl-2.5"> Lorem Ipsum</h3>
						</div>

						<div className="pt-4 flex">
							<img
								className="w-6 h-6 rounded-full "
								src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
								alt="user photo"
							/>
							<h3 className="pl-2.5">Lorem Ipsum</h3>
						</div>

						<div className="pt-4 flex">
							<img
								className="w-6 h-6 rounded-full "
								src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
								alt="user photo"
							/>
							<h3 className="pl-2.5">Lorem Ipsum</h3>
						</div>

						<a
							href="#"
							className="pl-60 inline-flex items-center p-2 text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
						>
							View More..
						</a>
					</div>

				</div>
				<div
					className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800"
				>
					<div className="w-full">
						<h3 className="mb-2 text-base font-bold text-gray-500 dark:text-gray-400">
							DID Methods
						</h3>
						<div className="pt-4 flex">
							<img
								className="w-6 h-6 rounded-full "
								src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
								alt="user photo"
							/>
							<h3 className="pl-2.5">DID:Indy</h3>
						</div>

						<div className="pt-4 flex">
							<img
								className="w-6 h-6 rounded-full "
								src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
								alt="user photo"
							/>
							<h3 className="pl-2.5">DID:Key</h3>
						</div>

						<div className="pt-4 flex">
							<img
								className="w-6 h-6 rounded-full "
								src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
								alt="user photo"
							/>
							<h3 className="pl-2.5">DID:Mob</h3>
						</div>
						<a
							href="#"
							className="pl-60 inline-flex items-center p-2 text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
						>
							Configure
						</a>
					</div>
					<div id="traffic-channels-chart" className="w-full"></div>
				</div>
			</div>

			{/* 2 columns */}
			<div className="">
				{/* Activity Card */}
				<div
					className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800 xl:mb-0"
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="pl-12 text-lg font-semibold text-gray-900 dark:text-white">
							Recent Activity
						</h3>
						<a
							href="#"
							className="inline-flex items-center p-2 text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700"
						>
							View all
						</a>
					</div>
					<ol className="relative border-l pl-8 border-gray-200 dark:border-gray-700">
						<li className="mb-10 ml-4">
							<div
								className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-800 dark:bg-gray-700"
							>
							</div>
							<time
								className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
							>April 2023</time
							>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Application UI design in Figma
							</h3>
							<p
								className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400"
							>
								Get access to over 20+ pages including a dashboard layout, charts,
								kanban board, calendar, and pre-order E-commerce & Marketing pages.
							</p>

						</li>
						<li className="mb-10 ml-4">
							<div
								className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-800 dark:bg-gray-700"
							>
							</div>
							<time
								className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
							>March 2023</time
							>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Marketing UI code in Flowbite
							</h3>
							<p
								className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400"
							>
								Get started with dozens of web components and interactive elements
								built on top of Tailwind CSS.
							</p>

						</li>
						<li className="mb-10 ml-4">
							<div
								className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-800 dark:bg-gray-700"
							>
							</div>
							<time
								className="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
							>February 2023</time
							>
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Marketing UI design in Figma
							</h3>
							<p className="text-base font-normal text-gray-500 dark:text-gray-400">
								Get started with dozens of web components and interactive elements
								built on top of Tailwind CSS.
							</p>
						</li>
					</ol>
				</div>
				{/* Carousel widget */}

			</div>
			
		</div>

	)
}
export default UserDashBoard;