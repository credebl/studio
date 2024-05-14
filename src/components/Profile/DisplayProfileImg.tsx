import { useEffect, useState } from "react";

import CustomAvatar from '../Avatar'
import type { IUserProfile } from "./interfaces";
import { getFromLocalStorage } from "../../api/Auth";
import { storageKeys } from "../../config/CommonConstant";

const DisplayProfileImg = () => {
    const [userObj, setUserObj] = useState<IUserProfile | null>(null)
    const getUserDetails = async () => {
        const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
        console.log('userProfile',userProfile)
        const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES)
        console.log('orgRoles',orgRoles)
        console.log('JSON.parse(userProfile)',JSON.parse(userProfile))
        const parsedUser = userProfile ? JSON.parse(userProfile) : null;
        parsedUser.roles = orgRoles
        console.log('parsedUser',parsedUser)
        setUserObj(parsedUser)
    }

    useEffect(() => {
        console.log('abcd-------')
        getUserDetails()
    }, [])

    return (
        <>
            {/* {(userObj?.profileImg) ?
                <CustomAvatar
                    className="rounded-full w-8 h-8"
                    src={userObj?.profileImg}
                /> :
                <CustomAvatar
                    className="rounded-full w-8 h-8"
                    // src={userObj?.profileImg}
                    // name={userObj?.firstName ? userObj?.firstName : userObj?.email} 
                    />
                } */}
                {/* <CustomAvatar
                    className="rounded-full w-8 h-8"
                    src={'/images/profile.png'}
                    name={'user-name'}
                    // src={userObj?.profileImg===null||userObj?.profileImg===undefined?'/images/profile.png':userObj?.profileImg}
                    // name={userObj?.firstName ? userObj?.firstName : userObj?.email} 
                    /> */}
        </>
    )
}

export default DisplayProfileImg