import { Alert } from 'flowbite-react';
import { pathRoutes } from '../../config/pathRoutes';

export const AlertComponent = ({ message, type, viewButton, onAlertClose, goToInvite }: { message: string | null, type: string, viewButton?: boolean,goToInvite?:boolean, onAlertClose: () => void }) => {


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
                  {goToInvite ? <a href={pathRoutes.users.invitations}>View more... </a> :"View more..."  }
                </p>
            }
           
        </span>

    </Alert>
        : <></>
}
