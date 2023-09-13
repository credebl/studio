import type { ReactElement } from "react";
import RoleViewButton from "../RoleViewButton";

export const EmptyListMessage = ({ message, description, buttonContent, svgComponent, onClick, feature }
    : {
        message: string,
        description: string,
        buttonContent?: string,
        svgComponent?: ReactElement,
        feature?: string
        onClick?: () => void,
    }) => {
    return (
        <div className='flex mt-20 justify-start items-center flex-col'>
            <p className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>{message}</p>
            <p className='text-lg mb-4 text-gray-900 dark:text-white'>{description}</p>
            {
                buttonContent
                && 
                <RoleViewButton
                  buttonTitle={buttonContent}
                        feature={feature as string}
                        svgComponent={svgComponent}
                        onClickEvent={onClick}
                />              
            }

        </div>
    )
};

