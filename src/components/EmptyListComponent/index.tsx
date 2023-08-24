import type { ReactElement } from "react";

export const EmptyListMessage = ({ message, description, buttonContent, svgComponent, onClick }
    : {
        message: string,
        description: string,
        buttonContent?: string,
        svgComponent?: ReactElement,

        onClick?: () => void,
    }) => {
    return (
        <div className='flex mt-20 justify-start items-center flex-col'>
            <p className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>{message}</p>
            <p className='text-lg mb-4 text-gray-900 dark:text-white'>{description}</p>
            {
                buttonContent
                && <button
                    className='group flex h-min p-3 mt-5 items-center justify-center p-0.5 font-medium focus:z-10 border border-transparent enabled:hover:!bg-primary-800  dark:enabled:hover:bg-cyan-700 text-base font- text-center text-white bg-primary-700 rounded-lg hover:bg-accent-00 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800&quot;'
                    onClick={onClick}>
                    {svgComponent}
                    <span className="ml-2">{buttonContent}</span>
                </button>
            }

        </div>
    )
};

