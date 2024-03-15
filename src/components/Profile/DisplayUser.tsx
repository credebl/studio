import { useEffect, useState } from "react";

import { TextTittlecase } from "../../utils/TextTransform";
import { getFromLocalStorage } from "../../api/Auth";
import { storageKeys } from "../../config/CommonConstant";

const DisplayUser = () => {

    const [userObj, setUserObj] = useState(null)

    const getUserDetails = async () => {
        const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
        const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES)
        const parsedUser = JSON.parse(userProfile)
        parsedUser.roles = orgRoles
        setUserObj(parsedUser)
    }

    useEffect(() => {
        getUserDetails()
    }, [])


    return (
        <div className="px-4 py-3" role="none">
            {
                userObj &&
                <>
                    <p
                        className="text-xl font-medium text-gray-900 truncate dark:text-gray-300 mb-1"
                        role="none"
                    >
                        {userObj['firstName']}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white mb-1" role="none">
                        {userObj['email']}
                    </p>
                    <p
                        className="text-base font-medium text-gray-900 truncate dark:text-gray-300"
                        role="none"
                    >
                        {TextTittlecase(userObj['roles'])}
                    </p>
                </>
            }


        </div>
    )
}

export default DisplayUser
