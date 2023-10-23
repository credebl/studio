

import React, { useEffect, useState } from "react"
import { EmptyListMessage } from "../EmptyListComponent";
import CustomQRCode from "../../commonComponents/QRcode";
import DateTooltip from '../Tooltip';
import { dateConversion } from '../../utils/DateConversion';
import { OrgWalletDetailsObject } from "../organization/interfaces";

const OrgWalletDetails = ({orgData}) => {

	const [connectionInvitation, setConnectionInvitation] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        
        if(orgData && orgData?.org_agents?.length > 0){
            const agents = orgData?.org_agents[0]
            if(agents?.agent_invitations?.length > 0){
                const connection = agents?.agent_invitations[0].connectionInvitation;                
                setConnectionInvitation(connection)
            }
        
        }

    },[orgData])


    return (
        <div className="flex flex-col w-full md:flex rounded gap-2 bg-white">
        <div className="mb-4 sm:mb-0 sm:pr-4 p-2">
            <h1 className="font-semibold text-2xl p-3">Wallet Details</h1>
    
        {	orgData?.org_agents.length > 0 ?
        <div className=" flex justify-start align-middle items-center p-3">
            <ul className="space-y-6">
                {orgData?.org_agents ? 
                orgData?.org_agents?.map((agentData:OrgWalletDetailsObject) => (
                    <><li className="flex z-10 items-center text-xl">
                        <span className="z-10 w-40">DID</span>
                        <span className="mx-2">:</span>
                        <span className="ml-9 text-gray-600">
                            {agentData?.orgDid && `${agentData?.orgDid.substring(0, 25)}...`}
                        </span>
                        <button id="myButton" className={`${false}`}>
                            {false
                                ? <svg className="h-6 w-6 text-white ml-3 text-base" width="25" height="25" viewBox="0 0 24 24" stroke-width="2" stroke="green" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 12l5 5l10 -10" /></svg>
                                : <svg className="h-6 w-6 text-green ml-3 text-base" width="25" height="25" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="8" y="8" width="12" height="12" rx="2" />  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>}
                        </button>
                    </li><li className="flex items-center text-xl">
                            <span className=" w-40">Ledger</span>
                            <span className="mx-2">:</span>
                            <span className="ml-9 text-gray-600">{agentData?.ledgers?.name}</span>
                        </li><li className="flex items-center text-xl">
                            <span className=" w-40">Network</span>
                            <span className="mx-2">:</span>
                            <span className="ml-9 text-gray-600">{agentData?.ledgers?.networkType}</span>
                        </li>
                        </>
                ))
            :
            <ul>
                Wallet details are not avilable. Need to create wallet.
                </ul>
    
            }
        </ul>
        </div>:
        <div className="flex justify-center items-center">
            <EmptyListMessage
                     message={'No Wallet Details Found'}
                     description={'The owner is required to create a wallet'}
                      buttonContent={''}
                />
        </div>
        }
        </div>
        {
            connectionInvitation 
            && <div className="lg:w-2/3 flex flex-col text-wrap p-2">
            <div className="h-auto flex-col items-center p-4">
                <div
                        className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 overflow-hidden">
                        <CustomQRCode
                                size={160}
                                value={connectionInvitation.toString()}
                        />
                </div>
            
            </div>
        </div>
        }
        
    </div>
    );
}


export default OrgWalletDetails
