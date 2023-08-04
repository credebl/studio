import { Alert } from 'flowbite-react';

export const AlertComponent = ({ message, type, viewButton, onAlertClose }: { message: string | null, type: string, viewButton?: boolean, onAlertClose: () => void }) => {


    return message !== null ? <Alert
        className='mb-4'
        color={type}
        onDismiss={() => onAlertClose()}
    >
        <span className='flex flex-wrap justify-between items-center'>
            <p>
                {message}
            </p>

            {
                viewButton
                && <p className='md:w-32 lg:w-48 text-base text-primary-700 text-right'>
                    View more...
                </p>
            }
           
        </span>

    </Alert>
        : <></>
}