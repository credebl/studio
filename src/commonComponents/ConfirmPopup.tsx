import { Button, Modal } from 'flowbite-react';

interface IProps {
    openModal: boolean;
    closeModal: (flag: boolean) => void;
    onSuccess: (flag: boolean) => void;
    message: string
    isProcessing: boolean
}

const ConfirmModal = (props: IProps) => {
    return (
        <Modal show={props.openModal} size="md">
            <div className="relative w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button
                        type="button"
                        className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-hide="popup-modal"
                        onClick={() => {
                            props.closeModal(false)
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
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
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
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                        </svg>
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            {props.message}
                        </h3>
                        <button
                            data-modal-hide="popup-modal"
                            type="button"
                            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                            onClick={() => {
                                props.closeModal(false)
                            }}
                        >
                            No, cancel
                        </button>
                        <Button
                            type="submit"
                            isProcessing={props.isProcessing}
                            disabled={props.isProcessing}
                            onClick={() => {
                                props.onSuccess(true)
                            }}
                            className="text-base bg-primary-700 hover:!bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 font-medium rounded-lg text-sm inline-flex items-center text-center ml-2"
                        >
                            Yes, I'm sure
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;