import { useEffect, useState } from "react";

import { TextTittlecase } from "../../utils/TextTransform.ts";
import { getFromLocalStorage } from "../../api/Auth.ts";
import { storageKeys } from "../../config/CommonConstant.ts";

const DisplayUser = () => {

    const [userObj, setUserObj] = useState(null)
		
    let timer:any= null
    const getUserDetails = async () => {
        const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
        const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES)
        const parsedUser = userProfile ? JSON.parse(userProfile) : null
        parsedUser.roles = orgRoles
        setUserObj(parsedUser)
    }
    useEffect(() => {
			const fetchData = async () => {
					await getUserDetails();
			};
			if (userObj === null && timer === null) {
				timer = setTimeout(fetchData, 1000);
			}
			return () => {
					clearTimeout(timer);
					timer = null;
			};
	}, [userObj]);


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
