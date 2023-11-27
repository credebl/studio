

import React, { useEffect, useState } from "react"
import { EmptyListMessage } from "../EmptyListComponent";
import CustomQRCode from "../../commonComponents/QRcode";
import type { IExploreOrg, IWalletData } from "../organization/interfaces";

const OrgWalletDetails = ({ orgData }: IExploreOrg) => {

    const [connectionInvitation, setConnectionInvitation] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    function copyTextVal(e: React.MouseEvent<HTMLButtonElement>, orgDid: string) {

        e.preventDefault()

        setIsCopied(true);

        // Copy the text inside the text field
        navigator.clipboard.writeText(orgDid);

        // Reset copied state after 1 second
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);
    }

    useEffect(() => {
        if (orgData && orgData?.org_agents?.length > 0) {
            const agents = orgData?.org_agents[0]
            if (agents?.agent_invitations?.length > 0) {
                const connection = agents?.agent_invitations[0].connectionInvitation;
                setConnectionInvitation(connection)
            }
        }
    }, [orgData])

    return (
        <div className="w-full h-full">
            {
                orgData?.org_agents ?
                    <div className="max-w-7xl">
                        <h1 className="text-black dark:text-white font-semibold text-2xl px-0 py-4 sm:px-4 pt-0">Wallet Details</h1>
                        <div className={`flex justify-between flex-wrap`}>
                            <div className="mb-4 sm:mb-0 px-0 sm:px-4 py-4 min-w-full lg:min-w-[550px]" style={{ width: "calc(100% - 23rem)" }}>
                                {orgData?.org_agents.length > 0 &&
                                    <div className="">
                                        <ul className="text-black dark:text-white">
                                            {orgData?.org_agents ?
                                                orgData?.org_agents?.map((agentData: IWalletData) => (
                                                    <>
                                                        <li className="flex z-10 items-center text-xl">
                                                            <span className="z-10 w-fit lg:w-40 shrink-0">DID</span>
                                                            <span className="mx-2">:</span>
                                                            <span className="ml-4 lg:ml-9 text-gray-600 dark:text-gray-400 truncate">
                                                                {agentData?.orgDid}
                                                            </span>
                                                            <button id="myButton" className={`${false}`} onClick={(e) => copyTextVal(e, agentData?.orgDid)}>
                                                                {isCopied
                                                                    ? <svg className="h-6 w-6 text-white ml-3 text-base" width="25" height="25" viewBox="0 0 24 24" strokeWidth={2} stroke="green" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 12l5 5l10 -10" /></svg>
                                                                    : <svg className="h-6 w-6 text-green ml-3 text-base" width="25" height="25" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="8" y="8" width="12" height="12" rx="2" />  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>}
                                                            </button>
                                                        </li>
                                                        <li className="flex items-center text-xl">
                                                            <span className="shrink-0 w-fit lg:w-40">Ledger</span>
                                                            <span className="mx-2">:</span>
                                                            <span className="ml-4 lg:ml-9 text-gray-600 dark:text-gray-400">{agentData?.ledgers?.name}</span>
                                                        </li>
                                                        <li className="flex items-center text-xl">
                                                            <span className="shrink-0 w-fit lg:w-40">Network</span>
                                                            <span className="mx-2">:</span>
                                                            <span className="ml-4 lg:ml-9 text-gray-600 dark:text-gray-400">{agentData?.ledgers?.networkType}</span>
                                                        </li>
                                                    </>
                                                ))
                                                :
                                                <ul>
                                                    Wallet details are not avilable. Need to create wallet.
                                                </ul>
                                            }
                                        </ul>
                                    </div>
                                }
                            </div>
                            {
                                connectionInvitation
                                && <div className="flex flex-col text-wrap">
                                    <div className="h-auto flex-col items-center p-0 sm:p-4 inline-block sm:hidden">
                                        <CustomQRCode
                                            size={100}
                                            value={connectionInvitation?.toString() || ""}
                                        />
                                    </div>
                                    <div className="h-auto flex-col items-center p-0 sm:p-4 hidden sm:inline-block">
                                        <CustomQRCode
                                            size={160}
                                            value={connectionInvitation?.toString() || ""}
                                        />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                    :
                    <div className="flex justify-center items-center">
                        <EmptyListMessage
                            message={'No Wallet Details Found'}
                            description={'The owner is required to create a wallet'}
                            buttonContent={''}
                        />
                    </div>
            }

        </div>
    );
}


export default OrgWalletDetails
