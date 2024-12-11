// import { useEffect, useState } from "react";

// import { TextTittlecase } from "../../utils/TextTransform.ts";
// import { getFromLocalStorage } from "../../api/Auth.ts";
// import { storageKeys } from "../../config/CommonConstant.ts";

// const DisplayUser = () => {

//     const [userObj, setUserObj] = useState(null)
		
//     let timer:any= null
//     const getUserDetails = async () => {
//         const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE)
//         console.log("🚀 ~ getUserDetails ~ userProfile11111111111:", userProfile)
//         const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES)
//             userProfile.roles = orgRoles;
//             setUserObj(userProfile);
//     }
//     useEffect(() => {
// 			const fetchData = async () => {
// 					await getUserDetails();
// 			};
// 			if (userObj === null && timer === null) {
// 				timer = setTimeout(fetchData, 1000);
// 			}
// 			return () => {
// 					clearTimeout(timer);
// 					timer = null;
// 			};
// 	}, [userObj]);

//     return (
//         <div className="px-4 py-3" role="none">
//             {
//                 userObj &&
//                 <>
//                     <p
//                         className="text-xl font-medium text-gray-900 truncate dark:text-gray-300 mb-1"
//                         role="none"
//                     >
//                         {userObj?.['firstName']}
//                     </p>
//                     <p className="text-sm text-gray-900 dark:text-white mb-1" role="none">
//                         {userObj?.['email']}
//                     </p>
//                     <p
//                         className="text-base font-medium text-gray-900 truncate dark:text-gray-300"
//                         role="none"
//                     >
//                         {TextTittlecase(userObj['roles'])}
//                     </p>
//                 </>
//             }


//         </div>
//     )
// }

// export default DisplayUser

import { useEffect, useState } from "react";
import { TextTittlecase } from "../../utils/TextTransform.ts";
import { getFromLocalStorage } from "../../api/Auth.ts";
import { storageKeys } from "../../config/CommonConstant.ts";

const DisplayUser = () => {
    const [userObj, setUserObj] = useState(null);
    let timer: any = null;

    const getUserDetails = async () => {
        // Retrieve user profile from localStorage and parse it safely
        const userProfile = await getFromLocalStorage(storageKeys.USER_PROFILE);
        console.log("🚀 ~ getUserDetails ~ userProfile:", userProfile);

        // Check if userProfile is a valid object
        if (userProfile && typeof userProfile === 'object') {
            const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
            userProfile.roles = orgRoles || []; // Fallback if orgRoles is null or undefined
            setUserObj(userProfile);
        } else {
            console.error("Invalid user profile:", userProfile);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getUserDetails();
        };

        // Only fetch user details if userObj is null and timer is not set
        if (userObj === null && timer === null) {
            timer = setTimeout(fetchData, 1000);
        }

        // Cleanup timeout when component unmounts
        return () => {
            clearTimeout(timer);
            timer = null;
        };
    }, [userObj]);

    return (
        <div className="px-4 py-3" role="none">
            {userObj && (
                <>
                    <p
                        className="text-xl font-medium text-gray-900 truncate dark:text-gray-300 mb-1"
                        role="none"
                    >
                        {userObj?.['firstName']}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white mb-1" role="none">
                        {userObj?.['email']}
                    </p>
                    <p
                        className="text-base font-medium text-gray-900 truncate dark:text-gray-300"
                        role="none"
                    >
                        {TextTittlecase(userObj['roles'])}
                    </p>
                </>
            )}
        </div>
    );
};

export default DisplayUser;
