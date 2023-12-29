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
    isOutline?: boolean
}


const RoleViewButton = ({ buttonTitle, svgComponent, onClickEvent, feature, isOutline }: RoleViewButtonProps) => {

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

        if (feature === Features.CRETAE_ORG) {
            return true
        } else if (feature === Features.ISSUANCE) {
            if (userRoles.includes(Roles.OWNER)
                || userRoles.includes(Roles.ADMIN)
                || userRoles.includes(Roles.ISSUER)
            ) {
                return true
            }
            return false
        } else if (feature === Features.VERIFICATION) {
            if (userRoles.includes(Roles.OWNER)
                || userRoles.includes(Roles.ADMIN)
                || userRoles.includes(Roles.VERIFIER)
            ) {
                return true
            }
            return false
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
                    outline={Boolean(isOutline)}
                    onClick={onClickEvent}
                    color={isOutline ? "bg-primary-800" : "bg-primary-700"}
                    className={`${isOutline ? "!p-0 role-btn group flex h-min items-center justify-center text-center focus:z-10 focus:ring-2 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-md text-sm dark:text-white dark:hover:text-primary-700" : "text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-md hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"}`}
                >
                    {svgComponent}
                    {buttonTitle}
                </Button>
            }
        </>
    )

}

export default RoleViewButton
