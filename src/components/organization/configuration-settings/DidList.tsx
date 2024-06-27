import React, { useEffect, useState } from "react"
import { Button } from "flowbite-react"
import CopyDid from '../../../commonComponents/CopyDid'
import CreateDidPopup from "./CreateDid"
import { getDids, updatePrimaryDid } from "../../../api/organization"
import { getFromLocalStorage } from "../../../api/Auth"
import { apiStatusCodes, storageKeys } from "../../../config/CommonConstant"
import type { AxiosResponse } from "axios"
import { AlertComponent } from "../../AlertComponent"
import type { IDidList, IUpdatePrimaryDid } from "../interfaces"
import { Roles } from "../../../utils/enums/roles"

const DIDList = () => {
    const [didList, setDidList] = useState<IDidList[]>([]);
    const [showPopup, setShowPopup] = useState(false);
    const [erroMsg, setErrMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [userRoles, setUserRoles] = useState<string[]>([]);
    const setPrimaryDid = async (id: string, did: string) => {
        try {
            const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
            const payload: IUpdatePrimaryDid = {
                id,
                did
            }
            const response = await updatePrimaryDid(orgId, payload);
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
                window.location.reload();
            } else {
                setErrMsg(response as string);
            }
        } catch (error) {
        }
    }

    const getData = async () => {
        try {
            const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
            const response = await getDids(orgId);
            const { data } = response as AxiosResponse;
            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                const sortedDids = data?.data.sort((a, b) => {
                    if (a.isPrimaryDid && !b.isPrimaryDid) return -1;
                    if (!a.isPrimaryDid && b.isPrimaryDid) return 1;
                    return 0;
                });
                setDidList(sortedDids)
            }
        } catch (error) {
            console.error("ERROR::::", error);
        }
    }

    const getUserOrgRoles = async () => {
		const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
		const roles = orgRoles.split(',');
		setUserRoles(roles);
	}

    useEffect(() => {
        getData();
        getUserOrgRoles();
    }, [])

    return (
        <>
            <div className="w-full">
            <AlertComponent
					message={successMsg ?? erroMsg}
					type={successMsg ? 'success' : 'failure'}
					onAlertClose={() => {
						setErrMsg(null);
						setSuccessMsg(null);
					}}
				/>
                <div className="flex justify-between items-center mb-6 mr-10">
                    <h3 className="text-lg font-bold dark:text-white">DID Details</h3>
                    <Button
                        onClick={() => setShowPopup(true)}
                        disabled= {userRoles.includes(Roles.MEMBER) || userRoles.includes(Roles.ISSUER) || userRoles.includes(Roles.VERIFIER)}
                        className={`hover:bg-primary-800 dark:hover:text-white dark:hover:bg-primary-700 hover:!bg-primary-800 text-base font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:focus:ring-primary-800`}
                    >
                        Create DID
                    </Button>
                    
                </div>
                <div className="overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
                    {
                        didList.map((item: IDidList, index: number) => {
                            const primary = item.id;
                            return (
                                <div key={item.id} className={`px-4 dark:text-white sm:px-6 py-4 text-sm w-fit sm:w-full ${primary && item.isPrimaryDid  ? 'bg-[#E6E6E6] dark:bg-gray-600' : ''}`}>
                                    <div className="flex items-center justify-between gap-6">
                                        <p className="shrink-0">DID {index + 1}</p>
                                        <p>:</p>
                                        {item?.did ? (
                                            <CopyDid
                                                className="font-courier min-w-[200px] text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white"
                                                value={item?.did}
                                            />
                                        ) : (
                                            <span className="font-courier min-w-[200px] text-base text-gray-500 dark:text-gray-400 font-semibold text-gray-900 truncate dark:text-white">
                                                Not available
                                            </span>
                                        )}
                                        {
                                            primary && item.isPrimaryDid ?
                                                <div
                                                    className="m-1 bg-[#AFD2EE] text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mr-auto"
                                                >
                                                    Primary DID
                                                </div>
                                                :
                                                <div className="flex gap-2 ml-auto shrink-0">
                                                    <Button
                                                        onClick={() => setPrimaryDid(item.id, item.did)}
                                                        color='bg-primary-800'
                                                        title='Initiate Credential Issuance'
                                                        className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 ring-2 text-black font-medium rounded-lg text-sm ml-auto dark:text-white dark:hover:text-blue-800 dark:hover:bg-primary-50'
                                                    >
                                                        Set Primary DID
                                                    </Button>
                                                </div>
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <CreateDidPopup
                setOpenModal={(value) => setShowPopup(value)}
                loading={false}
                success={"message"}
                failure={""}
                openModal={showPopup}
                closeModal={() => setShowPopup(false)}
                onSuccess={() => console.log("On Success")}
                message={'Would you like to proceed? Keep in mind that this action cannot be undone.'}
                buttonTitles={["No, cancel", "Yes, I'm sure"]}
                isProcessing={false}
                setFailure={() => console.log("SET Error")}
                setSuccess={() => console.log("SET Success")}
            />
        </>
    )
}


export default DIDList;