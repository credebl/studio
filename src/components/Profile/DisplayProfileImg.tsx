import { useEffect, useState } from "react";

import CustomAvatar from '../Avatar'
import type { IUserProfile } from "./interfaces";
import { getFromLocalStorage } from "../../api/Auth";
import { storageKeys } from "../../config/CommonConstant";

const DisplayProfileImg = () => {
    const [userObj, setUserObj] = useState<IUserProfile | null>(null)
    const getUserDetails = async () => {
        const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
        const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES)
        const parsedUser = userProfile ? JSON.parse(userProfile) : null;
        parsedUser.roles = orgRoles
        setUserObj(parsedUser)
    }

    useEffect(() => {
        getUserDetails()
    }, [])

    return (
        <>
            {(userObj?.profileImg) ?
                <CustomAvatar
                    className="rounded-full w-8 h-8"
                    src={userObj?.profileImg}
                /> :
                <CustomAvatar
                    className="rounded-full w-8 h-8"
                    name={userObj?.firstName ? userObj?.firstName : userObj?.email} />}
        </>
    )
}

export default DisplayProfileImg