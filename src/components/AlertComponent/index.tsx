import { Alert } from 'flowbite-react';

export const AlertComponent = ({ message, type, viewButton, onAlertClose, path='' }: { message: string | null, type: string, viewButton?: boolean, path?:string, onAlertClose: () => void }) => {


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
                  <a href={path}>View more... </a>
                </p>
            }
           
        </span>

    </Alert>
        : <></>
}
