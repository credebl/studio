import { ReactElement, useEffect, useState } from 'react';

import { Button } from 'flowbite-react';
import { Features } from '../../utils/enums/features';
import { Roles } from '../../utils/enums/roles';
import { getFromLocalStorage } from '../../api/Auth';
import { storageKeys } from '../../config/CommonConstant';

interface RoleViewButtonProps {
    buttonTitle?: string,
    svgComponent?: ReactElement,
    onClickEvent?: () => void,
    feature: string
}


const RoleViewButton = ({ buttonTitle, svgComponent, onClickEvent, feature }: RoleViewButtonProps) => {

    const [userRoles, setUserRoles] = useState<string[]>([])

    const getUserRoles = async () => {
        const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES)
        const roles = orgRoles.split(',')
        setUserRoles(roles)
    }

    useEffect(() => {
        getUserRoles()
    }, [])

    const isRoleAccess = (): boolean => {

        if(feature === Features.CRETAE_ORG){
            return true
        } else if (userRoles.includes(Roles.OWNER) || userRoles.includes(Roles.ADMIN)) {
            return true
        } else {
            return false
        }

    }

    return (
        <>
            {
                isRoleAccess()
                && <Button
                    onClick={onClickEvent}
                    className='text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"'
                >
                    {svgComponent}
                    {buttonTitle}
                </Button>
            }
        </>
    )

}

export default RoleViewButton