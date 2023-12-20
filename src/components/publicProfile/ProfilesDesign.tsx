import CustomAvatar from "../../components/Avatar"
import type { IExploreOrg } from "../organization/interfaces"

const ProfilesDesign = ({ orgData }: IExploreOrg) => {
    return (
        <div className="w-full h-full dark:bg-gray-800 dark:border-gray-700 items-center">
            <div className="flex flex-col items-center pb-10 mx-auto">

                {orgData?.logoUrl ? (
                    <CustomAvatar className="rounded-full shadow-lg" size="100" src={orgData?.logoUrl} />
                ) : (
                    <CustomAvatar className="rounded-full shadow-lg" size="180" name={orgData?.name || "NA"} />
                )}

                <h3 className="mb-1 text-center text-3xl font-medium text-gray-900 dark:text-white pt-4">{orgData?.name}</h3>
                <div className="flex text-center align-middle ">
                    {orgData?.website &&
                        <><svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 19 19">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.013 7.962a3.519 3.519 0 0 0-4.975 0l-3.554 3.554a3.518 3.518 0 0 0 4.975 4.975l.461-.46m-.461-4.515a3.518 3.518 0 0 0 4.975 0l3.553-3.554a3.518 3.518 0 0 0-4.974-4.975L10.3 3.7" />
                        </svg><a href={orgData?.website} target="_blank">	<span className="text-2xl text-gray-500 dark:text-gray-400 pl-2 ">{orgData?.website}</span></a></>
                    }
                </div>
                <p className="pt-2 p-4 flex items-center justify-center text-gray-900 dark:text-white flex-wrap">{orgData?.description}</p>
            </div>
        </div>
    )

}

export default ProfilesDesign