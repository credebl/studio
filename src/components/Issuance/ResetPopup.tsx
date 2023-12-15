import { Button, Modal } from 'flowbite-react';
import React from 'react';
import { IProps } from './interface';

const ResetPopup = (props: IProps) => {
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
							width="22"
							height="22"
							fill="none"
							viewBox="0 0 22 22"
							className="mx-auto mb-4 text-yellow-300 dark:text-yellow-300 w-12 h-12"
						>
							<path
								fill="currentColor"
								d="M12.388 21.99c-.916.01-1.82.01-2.743.01-.202-.078-.397-.052-.586-.069-.685-.062-1.33-.274-1.968-.508a10.64 10.64 0 0 1-3.424-2.051 11.243 11.243 0 0 1-2.35-2.88 11.537 11.537 0 0 1-1.17-3.012c-.085-.356-.07-.721-.137-1.092C0 11.458 0 10.54 0 9.602.083 9.396.049 9.194.072 9c.088-.73.318-1.423.58-2.105A10.541 10.541 0 0 1 2.64 3.654C4.245 1.857 6.22.664 8.581.134 8.916.057 9.26.072 9.612.01 10.528 0 11.432 0 12.355 0c.216.08.425.046.627.07.739.086 1.438.318 2.126.584a10.554 10.554 0 0 1 3.24 1.987c1.804 1.611 2.994 3.594 3.524 5.962.073.328.057.666.118 1.01.01.915.01 1.819.01 2.742-.08.216-.046.425-.07.627-.086.739-.318 1.438-.584 2.126a10.544 10.544 0 0 1-1.988 3.24c-1.61 1.803-3.592 2.996-5.961 3.524-.328.073-.666.057-1.01.118Z"
							/>
							<path
								fill="#FFFfFf"
								d="M12.72 7.183c-.052 1.824-.107 3.62-.155 5.418-.033 1.232-.7 2.147-1.573 2.141-.825-.005-1.506-.88-1.543-2.024a1052 1052 0 0 1-.206-7.108c-.03-1.213.66-2.187 1.546-2.203.23-.005.461-.029.691.033.78.21 1.304 1.09 1.285 2.175-.009.513-.028 1.026-.044 1.568Z"
							/>
							<path
								fill="#FFF"
								d="M9.989 15.875c1.013-.78 2.34-.282 2.54.94.133.817-.438 1.586-1.29 1.736-.785.138-1.588-.419-1.738-1.208-.108-.572.056-1.057.488-1.468Z"
							/>
						</svg>
						<h3 className="mb-6 text-xl font-normal text-gray-500 dark:text-gray-400">
						<div>This will reset all the entries you entered. <br />Do you want to proceed?</div>
						</h3>

						<div className="flex justify-center">
							<button
								data-modal-hide="popup-modal"
								type="button"
								className="flex justify-center items-center text-red-500 dark:text-red-500 bg-white hover:bg-gray-50 focus:ring-2 focus:outline-none focus:ring-red-200 rounded-lg border border-red-500 dark:border-red-500 text-lg px-5 py-2.5 mr-8 hover:text-red-600 focus:z-10 dark:bg-gray-700 dark:hover:text-red:700 dark:hover:bg-gray-600 dark:focus:ring-red-600"
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
								className="bg-primary-700 hover:!bg-primary-800 focus:ring-2 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 rounded-lg inline-flex items-center text-center ml-2"
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

export default ResetPopup;
