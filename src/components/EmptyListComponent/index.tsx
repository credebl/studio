import RoleViewButton from "../RoleViewButton";
import type {IEmptyListMessage} from "./interface"

export const EmptyListMessage = ({ message, description, buttonContent, svgComponent, onClick, feature, noExtraHeight }
    : IEmptyListMessage) => {
    return (
        <div className={`flex ${noExtraHeight ? "" : "mt-20 mb-16"} justify-start items-center flex-col`}>
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

