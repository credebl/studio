import { useEffect, useState } from "react";

import CustomAvatar from '../Avatar/index.tsx'
import type { IUserProfile } from "./interfaces";
import { getFromLocalStorage } from "../../api/Auth.ts";
import { storageKeys } from "../../config/CommonConstant.ts";

const DisplayProfileImg = () => {
    const [userObj, setUserObj] = useState<IUserProfile | null>(null)
    const getUserDetails = async () => {
        const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
        console.log("🚀 ~ getUserDetails ~ userProfile: type of:::::::", typeof userProfile)
        console.log("🚀 ~ getUserDetails ~ userProfile22222222222:", userProfile)
        const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES)
        // const parsedUser = userProfile ? JSON.parse(userProfile) : null;
        // console.log("🚀 ~ getUserDetails ~ parsedUser type of:", typeof parsedUser)
        // console.log("🚀 ~ getUserDetails ~ parsedUser:", parsedUser)

        // if (parsedUser) {
            userProfile.roles = orgRoles;
            setUserObj(userProfile);
        // }
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