import { useEffect, useState } from "react";

import CustomAvatar from '../Avatar/index.tsx'
import type { IUserProfile } from "./interfaces";
import { getFromLocalStorage } from "../../api/Auth.ts";
import { storageKeys } from "../../config/CommonConstant.ts";

const DisplayProfileImg = () => {
    const [userObj, setUserObj] = useState<IUserProfile>({
        id: '',
        profileImg: '',
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        isEmailVerified: false,
        keycloakUserId: '',
        publicProfile: false,
        isPublic: false,
        roles: ''
    })
    const getUserDetails = async () => {
        const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
        const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES)

        if (orgRoles) {
            userProfile.roles = orgRoles;
            setUserObj(userProfile);
        }
    }

    useEffect(() => {
        getUserDetails()
    }, [])

    return (
        <>
        {(userObj?.profileImg) ?
            <CustomAvatar
                className="rounded-full w-[100%] h-[100%] "
                src={userObj?.profileImg}
            /> :
            <CustomAvatar
                className="rounded-full w-[100%] h-[100%]"
                name={userObj?.firstName ? userObj?.firstName : userObj?.email} />}
    </>
    )
}

export default DisplayProfileImg