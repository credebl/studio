import { Button, Modal } from 'flowbite-react';
import { AlertComponent } from '../components/AlertComponent';
import React, { ReactElement } from 'react';

interface IProps {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
	onSuccess: (flag: boolean) => void;
	message: string | ReactElement;
	isProcessing: boolean;
	success: string | null;
	failure: string | null;
	setFailure: (flag: string | null) => void;
	setSuccess: (flag: string | null) => void;
	buttonTitles: string[];
	loading:boolean;
}

const ConfirmationModal = ({ openModal, closeModal, onSuccess, message, isProcessing, success, failure, setFailure, setSuccess, buttonTitles, loading }: IProps) => {
	return (
		<Modal show={openModal} size="xl">
			<div className="relative w-full max-w-xl max-h-[450px]">
				<div className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-h-[450px]">
					<button
						type="button"
						className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
						data-modal-hide="popup-modal"
						onClick={() => {
							closeModal(false);
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

					<div className="p-6 text-center float-bottom">
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
						<h3 className="py-2 text-lg font-normal text-gray-500 dark:text-gray-200 mb-4">
							{message}
						</h3>
						<div className="w-full">
							{success && (
								<div className="w-full" role="alert">
									<AlertComponent
										message={success}
										type={'success'}
										onAlertClose={() => {
											setSuccess && setSuccess(null);
										}}
									/>
								</div>
							)}
							{failure && (
								<div className="w-full" role="alert">
									<AlertComponent
										message={failure}
										type={'failure'}
										onAlertClose={() => {
											setFailure && setFailure(null);
										}}
									/>
								</div>
							)}
						</div>
						<div className="mt-8 flex gap-4 items-center justify-around">
							<button
								data-modal-hide="popup-modal"
								type="button"
								className="sm:min-w-[197px] text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-md font-medium px-5 py-2 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
								onClick={() => {
									closeModal(false);
								}}
							>
								{buttonTitles[0]}
							</button>
							<Button
								type="submit"
								isProcessing={isProcessing}
								disabled={isProcessing || loading}
								onClick={() => {
									onSuccess(true);
								}}
								className="sm:min-w-[197px] text-md bg-primary-700 hover:!bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 font-medium rounded-lg text-md inline-flex items-center text-center"
							>
								{buttonTitles[1]}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmationModal;
