import { Button, Modal } from 'flowbite-react';
import React, { useState } from 'react';

const ProofRequest = (props: { openModal: boolean; closeModal: (flag: boolean, id: string) => void; onSucess: (verifyPresentationId: string) => void; requestId: string }) => {
  const [buttonLoader, setButtonLoader] = useState<boolean>(false)
	const handleConfirmClick = async () => {
    try {
      setButtonLoader(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      props.onSucess(props.requestId);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setButtonLoader(false); 
    }
  };
  return (

    <Modal show={props.openModal} size="lg">
      <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <button
          onClick={() => {
            setButtonLoader(false)
            props.closeModal(false, '')
          }}
          className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
          <span className="sr-only">Close modal</span>
        </button>
        <div className='pt-6'>
          <p className="mb-4 text-gray-500 dark:text-gray-300">
            Are you sure you want to present proof for {' '}
            <p className="dark:text-white text-gray-600 font-bold p-2">
             Request Id: {props.requestId}
            </p>
          </p>
        </div>


        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => {
              setButtonLoader(false)
              props.closeModal(false, '')
							console.log("buttonLoader",buttonLoader);

            }}
            style={{ height: '2.5rem', minWidth: '3rem' }}
            className="py-1 px-2 medium text-center font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          >
            No, cancel
          </button>
          <Button
             isProcessing={buttonLoader}
						 onClick={handleConfirmClick} // Use the custom handler
						 disabled={buttonLoader}
            // onClick={() => {
            //   setButtonLoader(true);
            //   props.onSucess(props.requestId);
						// 	console.log("buttonLoader",buttonLoader);
            // }}
						// disabled={buttonLoader}
            className="py-1 px-2 medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            style={{ height: '2.5rem', minWidth: '3rem' }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProofRequest;
