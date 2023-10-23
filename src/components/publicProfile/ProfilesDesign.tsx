import React from "react"
import CustomAvatar from "../../components/Avatar"


interface OrgInterface {
    orgData: {
        name: string;
        website: string;
        logoUrl: string;
        description: string;
    }
    
}

const ProfilesDesign = ({orgData}: OrgInterface) => {

    return (
        <>
            <div className="min-[320]:h-auto md:h-screen col-span-1 border-white box-border items-center">
                <div className="w-full h-full bg-white rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 items-center">
                    <div className="flex flex-col items-center pb-10 mx-auto">

                        {orgData?.logoUrl ? (
                            <CustomAvatar className="my-4 rounded-full shadow-lg" size="100" src={orgData?.logoUrl} />
                        ) : (
                            <CustomAvatar className="my-4 rounded-full shadow-lg" size="180" name={orgData?.name} />
                        )}

                        <h3 className="mb-1 text-3xl font-medium text-gray-900 dark:text-white pt-4">{orgData?.name}</h3>
                        <div className="flex text-center align-middle ">
                            {orgData?.website &&
					<><svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 19 19">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.013 7.962a3.519 3.519 0 0 0-4.975 0l-3.554 3.554a3.518 3.518 0 0 0 4.975 4.975l.461-.46m-.461-4.515a3.518 3.518 0 0 0 4.975 0l3.553-3.554a3.518 3.518 0 0 0-4.974-4.975L10.3 3.7" />
                                </svg><a href={orgData?.website} target="_blank">	<span className="text-2xl text-gray-500 dark:text-gray-400 pl-2 ">{orgData?.website}</span></a></>
                            }
                        </div>
                        <p className="pt-2 p-4 flex items-center justify-center flex-wrap">{orgData?.description}</p>
                    </div>
                </div>
            </div>
        </>
    )

}

export default ProfilesDesign