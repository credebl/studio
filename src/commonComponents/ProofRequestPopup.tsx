import { Modal } from 'flowbite-react';
import React from 'react';

const ProofRequest = (props: { openModal: boolean; closeModal: (flag: boolean, id: string) => void; onSucess: (verifyPresentationId: string) => void; requestId: string }) => {
  return (

    <Modal show={props.openModal} size="lg">
      <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <button
          onClick={() => {
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
        <svg viewBox="-2.5 0 261 261" width='200px' height='200px' version="1.1" xmlns="http://www.w3.org/2000/svg"  preserveAspectRatio="xMidYMid" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M141.0316,-0.0001 L116.5006,-0.0001 L12.2546,-0.0001 C6.1276,-0.0001 -0.0004,6.1269 -0.0004,12.2689 L-0.0004,174.7689 C-0.0004,182.4129 4.6026,191.6339 10.7226,194.6969 L118.0316,257.5539 C124.1666,262.1419 133.3646,262.1419 137.9676,257.5539 L245.2696,194.6969 C251.3966,190.0949 255.9996,182.4279 255.9996,174.7689 L255.9996,12.2689 C255.9996,4.6029 249.8656,0.0069 243.7376,0.0069 L141.0316,0.0069 L141.0316,-0.0001 Z" fill="#13C779"> </path> <path d="M200.8173,72.0549 L128.7693,114.9679 L56.7223,72.0549 L200.8173,72.0549 Z M200.8173,144.1029 L128.7693,187.0309 L56.7223,144.1029 L56.7223,88.9119 L128.7623,131.8409 L200.8103,88.9119 L200.8103,144.1029 L200.8173,144.1029 Z M206.9523,56.7289 L128.7623,56.7289 L50.5803,56.7289 C47.5163,56.7289 44.4523,59.7929 44.4523,64.3879 L44.4523,67.4599 L44.4523,144.1179 C44.4523,147.1889 44.4523,153.3159 50.5803,156.3649 C56.7143,160.9679 128.7623,203.8959 128.7623,203.8959 C128.7623,203.8959 200.8103,160.9819 206.9523,156.3649 C213.0723,151.7769 213.0723,147.1809 213.0723,144.1179 L213.0723,67.4599 L213.0723,64.3879 C213.0723,59.7929 211.5473,56.7289 206.9523,56.7289 L206.9523,56.7289 Z" fill="#FFFFFF"> </path> <path d="M128.7622,-0.0001 L116.5072,-0.0001 L12.2542,-0.0001 C6.1272,-0.0001 0.0002,6.1269 0.0002,12.2689 L0.0002,174.7689 C0.0002,182.4129 4.6032,191.6339 10.7232,194.6969 L118.0322,257.5539 C121.0952,259.0789 124.1672,260.6179 128.7552,260.6179 L128.7622,-0.0001 Z" fill-opacity="0.1" fill="#231F1F"> </path> </g> </g></svg>
        <p className="mb-4 text-gray-500 dark:text-gray-300">
          Are you sure you want to request proof for {' '}
          <span className="dark:text-black font-bold">
            {props.requestId}
          </span>

        </p>


        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => {
              props.closeModal(false, '')
            }}
            className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
          >
            No, cancel
          </button>
          <button
            onClick={() => {
              props.onSucess(props.requestId)
            }}
            className="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
          >
            Yes, I'm sure
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProofRequest;
