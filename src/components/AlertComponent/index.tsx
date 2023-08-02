import { Alert, Avatar, Spinner } from 'flowbite-react';

export const AlertComponent = ({ message, type, onAlertClose }: { message: string | null, type: string, onAlertClose: () => void }) => {
    

    return message !== null ? <Alert
        className='mb-4'
        color={type}
        onDismiss={() => onAlertClose()}
    >
        <span>
            <p>
                {message}
            </p>
        </span>
    </Alert>
    : <></>
}