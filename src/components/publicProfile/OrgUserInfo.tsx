import React from "react"
import CustomAvatar from "../../components/Avatar"
import { UserDetails } from "../organization/interfaces";


const OrgUserInfo = ({orgUsersData}) => {

    return (
        <>
            {orgUsersData &&
                <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-2 rounded">
                    <div
                        className="px-6 py-4 col-span-1 bg-gradient-to-r from-white via-white to-gray-50 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 shadow-lg shadow-gray-500/50 dark:shadow-lg dark:shadow-gray-800/80 rounded-lg"
                    >
                        {
                            orgUsersData &&
                            orgUsersData?.map((orgUser: UserDetails) => {
                                return (
                                    <>
                                        <div className=" flex items-center">
                                            {orgUser.firstName &&

                                                <><span>
                                                    {orgUser?.profileImg ? (
                                                        <CustomAvatar className="mb-2 rounded-full shadow-lg" size="30" src={orgUser?.profileImg}/>
                                                    ) : (
                                                        <CustomAvatar className="mb-2 rounded-full shadow-lg" size="30" name={orgUser?.firstName}/>
                                                    )}
                                                </span><div className="font-bold text-xl pl-2 mb-2">
                                                        {orgUser.firstName} {orgUser.lastName}
                                                    </div></>
                                            }
                                        </div>

                                        <div className="flex items-center">
                                            {orgUser.email &&
                                                <><svg
                                                    className="w-6 h-6 text-gray-800 dark:text-white m-1"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 20 16"
                                                >
                                                    <path
                                                        stroke="currentColor"
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="m19 2-8.4 7.05a1 1 0 0 1-1.2 0L1 2m18 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1m18 0v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2" />
                                                </svg><p className="text-gray-700 text-xl mb-1.5 pl-2">{orgUser.email}</p></>
                                            }
                                        </div>
                                    </>
                                );
                            })
                        }
                    </div>
                </div>}
        </>
    )

}

export default OrgUserInfo