import { Button, Modal } from 'flowbite-react';

interface IProps {
	openModal: boolean;
	closeModal: (flag: boolean) => void;
	onSuccess: (flag: boolean) => void;
	message: string;
	isProcessing: boolean;
}

const IssuancePopup = (props: IProps) => {
	return (
		<Modal show={props.openModal} size="md">
			<div className="relative w-full max-w-md max-h-full">
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
							className="mx-auto mb-4 text-yellow-300 w-12 h-12 dark:text-gray-200"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 20 20"
						>
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
							/>
						</svg>
						<p className="text-2xl text-primary-700">Confirmation</p>
						<h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
							{props.message}
						</h3>

						<div className='flex justify-center'>
						<button
							data-modal-hide="popup-modal"
							type="button"
							className="flex justify-center items-center text-red-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-lg font-medium px-5 py-2.5 mr-8 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
							onClick={() => {
								props.closeModal(false);
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 30 30"
								fill="none"
								className='mr-2'
							>
								<path
									d="M15 0C6.705 0 0 6.705 0 15C0 23.295 6.705 30 15 30C23.295 30 30 23.295 30 15C30 6.705 23.295 0 15 0ZM15 27C8.385 27 3 21.615 3 15C3 8.385 8.385 3 15 3C21.615 3 27 8.385 27 15C27 21.615 21.615 27 15 27ZM20.385 7.5L15 12.885L9.615 7.5L7.5 9.615L12.885 15L7.5 20.385L9.615 22.5L15 17.115L20.385 22.5L22.5 20.385L17.115 15L22.5 9.615L20.385 7.5Z"
									fill="#EA5455"
								/>
							</svg>
						<p>	Cancel </p>
						</button>
						<Button
							type="submit"
							isProcessing={props.isProcessing}
							disabled={props.isProcessing}
							onClick={() => {
								props.onSuccess(true);
							}}
							className="bg-primary-700 hover:!bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 font-medium rounded-lg inline-flex items-center text-center ml-2"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="25"
								height="25"
								viewBox="0 0 39 27"
								fill="none"
								className='mr-2'
							>
								<path
									d="M38.7397 9.43217L29.5658 0.260136C29.2187 -0.0867122 28.6561 -0.0867122 28.309 0.260136L25.0503 3.51815H14.0521C11.5184 3.51815 9.10581 4.67242 7.50894 6.62771H5.77611V5.29504C5.77611 4.80444 5.37827 4.40659 4.88747 4.40659H0.888632C0.39784 4.40659 0 4.80444 0 5.29504C0 5.78564 0.39784 6.18348 0.888632 6.18348H3.99884V18.6217H0.888632C0.39784 18.6217 0 19.0195 0 19.5101C0 20.0007 0.39784 20.3986 0.888632 20.3986H4.88747C5.37827 20.3986 5.77611 20.0007 5.77611 19.5101V17.289H7.50894C9.10581 19.2443 11.5184 20.3986 14.0521 20.3986H15.0859L21.4285 26.7398C21.602 26.9132 21.8294 27 22.0568 27C22.2842 27 22.5117 26.9132 22.6852 26.7398L38.7397 10.6887C38.9063 10.522 39 10.2961 39 10.0605C39 9.82486 38.9063 9.59884 38.7397 9.43217ZM8.66327 15.8773C8.49603 15.6478 8.22908 15.5121 7.94508 15.5121H5.77611V8.40459H7.94517C8.22917 8.40459 8.49603 8.26893 8.66336 8.03944C9.91606 6.32101 11.9306 5.29504 14.0522 5.29504H23.2731L18.0009 10.5661C17.2596 10.0237 16.5988 9.36376 16.0428 8.59978C15.7541 8.20301 15.1984 8.11541 14.8014 8.40406C14.4045 8.69272 14.3169 9.24835 14.6056 9.64513C16.2918 11.9624 18.7796 13.4844 21.6108 13.9307C22.1554 14.0166 22.5285 14.5294 22.4427 15.0738C22.3568 15.6181 21.8446 15.9907 21.2994 15.9053C18.8398 15.5175 16.5753 14.4386 14.7509 12.7852C14.3873 12.4557 13.8253 12.4833 13.4957 12.8468C13.1661 13.2104 13.1937 13.7722 13.5573 14.1017C13.7166 14.246 13.8796 14.3852 14.0446 14.5217L12.2546 16.3112C12.088 16.4778 11.9943 16.7038 11.9943 16.9394C11.9943 17.175 12.088 17.401 12.2546 17.5677L13.2611 18.5739C11.4377 18.3537 9.75904 17.3804 8.66327 15.8773ZM22.0568 24.855L14.1395 16.9394L15.4998 15.5795C17.164 16.6368 19.0372 17.3474 21.0224 17.6604C21.1684 17.6834 21.3133 17.6946 21.4566 17.6946C22.7986 17.6944 23.9826 16.7167 24.1981 15.3505C24.4366 13.8382 23.4002 12.414 21.8876 12.1754C21.083 12.0485 20.3117 11.8174 19.5886 11.4915L28.9374 2.14488L36.8547 10.0605L22.0568 24.855Z"
									fill="white"
								/>
							</svg>
							<p className='text-lg'>Issue</p>
						</Button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default IssuancePopup;
