import type { AxiosResponse } from "axios";
import { getFromLocalStorage, getUserProfile, setToLocalStorage } from "../../api/Auth";
import { apiStatusCodes, storageKeys } from "../../config/CommonConstant";
import { useEffect, useState } from "react";
import type { UserProfile } from "./interfaces";
import CustomAvatar from '../Avatar'

interface IProfileImage {
    imagePreviewUrl: string | ArrayBuffer | null | File,
}
const DisplayUserProfile = ({ toggleEditProfile }: { toggleEditProfile: () => void }) => {

    const [failure, setFailure] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [logoImage, setLogoImage] = useState<IProfileImage>()

    const displayUserDetails = async () => {

        const token = await getFromLocalStorage(storageKeys.TOKEN)
		const userDetails = await getUserProfile(token);
		const { data } = userDetails as AxiosResponse
        console.log(`User::`, data);
        
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
            setUserProfile(data?.data)          
        } else {
            setFailure(userDetails as string);
        }
        
		setLoading(false)
	}
    
    useEffect(() => {
        displayUserDetails();
    }, []);
    
    return (
        <div className="pl-2 pt-2 lg:flex mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 md:p-8 dark:bg-gray-800">

            <div className="flow-root">
                <ul>

                    <li className="flex items-start justify-between pb-4">
                        <CustomAvatar size='90' name={userProfile?.firstName}/>

                        {/* <button
                            type="button"
                            className=""
                            onClick={toggleEditProfile}
                        >
                            <svg aria-hidden="true"
                                className="mr-1 mt-8 -ml-1 w-5 h-5"

                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                                color='#3558A8'
                            >
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">

                                </path>
                                <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>

                        </button>
 */}

                    </li>

                    <li className="py-3">
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-normal text-gray-500 truncate dark:text-gray-400">
                                    Name
                                </p>
                                <p className="text-lg text-black truncate dark:text-white">
                                {userProfile?.firstName} {userProfile?.lastName}
                                </p>
                            </div>

                        </div>
                    </li>
                    <li className="py-3">
                        <div className="flex items-center space-x-4">

                            <div className="flex-1 min-w-0">
                                <p className="text-lg font-normal text-gray-500 truncate dark:text-gray-400">
                                    Email
                                </p>
                                <p className="text-lg text-black truncate dark:text-white">

                                    {userProfile?.email}
                                </p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default DisplayUserProfile;
function setFidoLoader(arg0: boolean) {
    throw new Error("Function not implemented.");
}

