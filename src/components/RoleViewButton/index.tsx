import { useEffect, useState } from 'react';
import type {ReactElement} from 'react';

import { Button } from 'flowbite-react';
import { Features } from '../../utils/enums/features';
import { Roles } from '../../utils/enums/roles';
import { getUserRoles } from '../../config/ecosystem'

interface RoleViewButtonProps {
    title?: string
    buttonTitle?: string,
    svgComponent?: ReactElement,
    onClickEvent?: () => void,
    feature: string,
    isOutline?: boolean,
    isPadding?: boolean,
    disabled?:boolean
}


const RoleViewButton = ({ title, buttonTitle, svgComponent, onClickEvent, feature, isOutline, isPadding, disabled }: RoleViewButtonProps) => {

    const [userRoles, setUserRoles] = useState<string[]>([])

    const getUserOrgRoles = async () => {
        const roles = await getUserRoles()
        setUserRoles(roles)
    }

    useEffect(() => {
        getUserOrgRoles()
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
        <Button
            title={title}
            outline={Boolean(isOutline)}
            onClick={isRoleAccess() ? onClickEvent : null}
            color={isOutline ? "bg-primary-800" : "bg-primary-700"}
            className={`${isOutline
                ? "!p-0 role-btn group flex h-min items-center justify-center text-center focus:z-10 focus:ring-2 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-md text-sm dark:text-white dark:hover:text-primary-700"
                : `${isPadding ? "!p-0" : ""} text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-md hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`
                }`}
                disabled={disabled || !isRoleAccess()}
        >
            {svgComponent}
            {buttonTitle}
          
        </Button>
    )

}

export default RoleViewButton
