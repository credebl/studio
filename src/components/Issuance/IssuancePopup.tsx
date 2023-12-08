import { Button, Modal } from 'flowbite-react';

interface IProps {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
	onSuccess: (flag: boolean) => void;
	isProcessing: boolean;
}

const IssuancePopup = (props: IProps) => {
	return (
		<Modal show={props.openModal} size="xl">
			<div className="relative w-full max-w-xl max-h-full">
				<div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
					<button
						type="button"
						className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
						data-modal-hide="popup-modal"
						onClick={() => {
							props.closeModal(false);
						}}
					>
						<svg
							className="w-3 h-3"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 14 14"
						>
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
							/>
						</svg>
						<span className="sr-only">Close modal</span>
					</button>
					<div className="p-6 text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="120"
							height="120"
							fill="none"
							viewBox="0 0 208 140"
							className='m-auto'
						>
							<g filter="url(#a)">
								<ellipse
									cx="103.989"
									cy="96"
									fill="#1F4EAD"
									rx="63.989"
									ry="60"
								/>
							</g>
							<path
								stroke="#fff"
								strokeLinecap="round"
								strokeWidth="8"
								d="M75.195 96.186 94.26 114l38.526-36"
							/>
							<defs>
								<filter
									id="a"
									width="207.98"
									height="200"
									x="0"
									y="0"
									colorInterpolationFilters="sRGB"
									filterUnits="userSpaceOnUse"
								>
									<feFlood floodOpacity="0" result="BackgroundImageFix" />
									<feColorMatrix
										in="SourceAlpha"
										result="hardAlpha"
										values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
									/>
									<feOffset dy="4" />
									<feGaussianBlur stdDeviation="20" />
									<feComposite in2="hardAlpha" operator="out" />
									<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
									<feBlend
										in2="BackgroundImageFix"
										result="effect1_dropShadow_7814_9151"
									/>
									<feBlend
										in="SourceGraphic"
										in2="effect1_dropShadow_7814_9151"
										result="shape"
									/>
								</filter>
							</defs>
						</svg>
						<p className="text-3xl text-primary-700 dark:text-primary-600 mb-4">Confirmation</p>
						<h3 className="mb-6 text-xl font-normal text-gray-500 dark:text-gray-400">
						Are you sure you want to <span className='text-primary-700 dark:text-primary-600'> Offer</span> Credentials ?
						</h3>

						<div className="flex justify-center">
							<button
								data-modal-hide="popup-modal"
								type="button"
								className="flex justify-center items-center text-red-500 dark:text-red-500 bg-white hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-red-200 rounded-lg border border-red-500 dark:border-red-500 text-lg px-5 py-2.5 mr-8 hover:text-red-600 focus:z-10 dark:bg-gray-700 dark:hover:text-red:700 dark:hover:bg-gray-600 dark:focus:ring-red-600"
								onClick={() => {
									props.closeModal(false);
								}}
							>
								No, Cancel
							</button>
							<Button
								type="submit"
								isProcessing={props.isProcessing}
								disabled={props.isProcessing}
								onClick={() => {
									props.onSuccess(true);
									window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
								}}
								className="bg-primary-700 hover:!bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 rounded-lg inline-flex items-center text-center ml-2"
							>
								<p className="text-lg font-normal">Yes, I'm sure</p>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default IssuancePopup;